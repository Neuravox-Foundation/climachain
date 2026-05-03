/**
 * Copernicus Data Space Ecosystem client.
 *
 * Authenticates with OAuth client credentials, then queries the Sentinel Hub
 * Statistics API for monthly NDVI aggregated over a country bounding box.
 * Returns data in the same shape as the deterministic synthesiser so the
 * downstream chart and AI synthesis are unchanged.
 *
 * Docs: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Statistical.html
 */

import type { NDVIData } from "./climate-api"

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
const STATS_URL = "https://sh.dataspace.copernicus.eu/api/v1/statistics"

const NDVI_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(samples) {
  const ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04 + 1e-9);
  return {
    ndvi: [ndvi],
    dataMask: [samples.dataMask]
  };
}`

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

interface BBox {
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
}

let cachedToken: { access: string; expiresAt: number } | null = null

export async function getCopernicusToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.access

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`CDSE token request failed (${res.status}): ${detail.slice(0, 200)}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    access: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  }
  return cachedToken.access
}

interface StatisticsResponse {
  data: Array<{
    interval: { from: string; to: string }
    outputs: Record<string, { bands: Record<string, { stats: { mean: number; min: number; max: number; sampleCount: number; noDataCount: number } } > }>
  }>
}

/**
 * Fetch monthly NDVI for the last `months` months over the given bounding box.
 * Returns canonical NDVIData[] (one entry per month-year).
 */
export async function fetchNDVIFromCopernicus(
  clientId: string,
  clientSecret: string,
  bbox: BBox,
  months = 12,
): Promise<{ data: NDVIData[]; clipped: boolean }> {
  const token = await getCopernicusToken(clientId, clientSecret)

  const now = new Date()
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() - months + 1, 1))

  // Clip very large country bboxes to a centered 6 deg square so the
  // Statistics call always finishes inside Cloudflare's 30s wall clock
  // for incoming requests. The mean is computed over this representative
  // central region rather than the full country area; the route discloses
  // this in its source/note when clipping is in effect.
  const MAX_AXIS_DEG = 6
  const width = bbox.maxLon - bbox.minLon
  const height = bbox.maxLat - bbox.minLat
  const clipped = width > MAX_AXIS_DEG || height > MAX_AXIS_DEG
  const cx = (bbox.minLon + bbox.maxLon) / 2
  const cy = (bbox.minLat + bbox.maxLat) / 2
  const half = MAX_AXIS_DEG / 2
  const fetchBox: BBox = clipped
    ? {
        minLon: width > MAX_AXIS_DEG ? cx - half : bbox.minLon,
        maxLon: width > MAX_AXIS_DEG ? cx + half : bbox.maxLon,
        minLat: height > MAX_AXIS_DEG ? cy - half : bbox.minLat,
        maxLat: height > MAX_AXIS_DEG ? cy + half : bbox.maxLat,
      }
    : bbox

  const polygon = bboxPolygon(fetchBox)
  const payload = {
    input: {
      bounds: {
        geometry: polygon,
        properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: { mosaickingOrder: "leastCC", maxCloudCoverage: 40 },
        },
      ],
    },
    aggregation: {
      timeRange: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      aggregationInterval: { of: "P1M" },
      evalscript: NDVI_EVALSCRIPT,
      // Sentinel-2 L2A caps at 1500 m/pixel. 0.013 degrees is ~1448 m at the
      // equator and ~1280 m at 30 degrees latitude, so we sit just under the
      // limit everywhere on the continent while keeping the processing-units
      // cost manageable for country-scale polygons.
      resx: 0.013,
      resy: 0.013,
    },
    calculations: {
      default: {},
    },
  }

  const res = await fetch(STATS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(28_000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`CDSE statistics call failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as StatisticsResponse

  const points: NDVIData[] = []
  for (const entry of json.data ?? []) {
    const stats = entry.outputs?.ndvi?.bands?.B0?.stats
    if (!stats || !Number.isFinite(stats.mean)) continue
    const fromDate = new Date(entry.interval.from)
    const monthIndex = fromDate.getUTCMonth()
    const year = fromDate.getUTCFullYear()
    points.push({
      month: MONTHS[monthIndex],
      year,
      ndvi: Math.max(0, Math.min(1, round(stats.mean, 3))),
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`,
    })
  }
  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return { data: points, clipped }
}

function bboxPolygon(b: BBox) {
  return {
    type: "Polygon" as const,
    coordinates: [[
      [b.minLon, b.minLat],
      [b.maxLon, b.minLat],
      [b.maxLon, b.maxLat],
      [b.minLon, b.maxLat],
      [b.minLon, b.minLat],
    ]],
  }
}

function round(n: number, p: number): number {
  const m = 10 ** p
  return Math.round(n * m) / m
}
