import { type NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getNDVISeries, type NDVIData, type NDVIResponse } from "@/lib/climate-api"
import { COUNTRY_BBOX, getCountryByCode } from "@/lib/countries"
import { fetchNDVIFromCopernicus } from "@/lib/copernicus"

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
const CACHE_VERSION = "v2" // bump to invalidate old shape after schema changes

interface CachedNDVI {
  data: NDVIData[]
  fetchedAt: string
  clipped?: boolean
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const country = params.get("country")?.toUpperCase()

  if (!country) {
    return NextResponse.json({ error: "Country code is required" }, { status: 400 })
  }
  if (!getCountryByCode(country)) {
    return NextResponse.json({ error: `Unsupported country code: ${country}` }, { status: 400 })
  }

  const bounds = COUNTRY_BBOX[country] ?? null
  const modelled = getNDVISeries(country)

  let env: any = {}
  let ctx: any = null
  try {
    const cf = getCloudflareContext()
    env = cf.env ?? {}
    ctx = cf.ctx
  } catch {
    // Outside the Cloudflare runtime (e.g. local Next dev). Fall through.
  }

  const credentialsConfigured = Boolean(env.CDSE_CLIENT_ID && env.CDSE_CLIENT_SECRET)
  const kv = env.NDVI_KV as KVNamespace | undefined
  const cacheKey = `ndvi:${CACHE_VERSION}:${country}`

  // 1. Try cache first.
  if (kv && bounds) {
    try {
      const cached = await kv.get<CachedNDVI>(cacheKey, "json")
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        return liveResponse(modelled, cached.data, bounds, cached.fetchedAt, cached.clipped)
      }
    } catch (err) {
      console.error("NDVI KV read failed:", err)
    }
  }

  // 2. Cache miss. If credentials + bounds available, fetch synchronously
  //    with a tight budget. Months are scaled to the country's bbox area so
  //    the Statistics call fits inside the 30s incoming-request wall clock.
  if (credentialsConfigured && bounds) {
    const area = (bounds.maxLon - bounds.minLon) * (bounds.maxLat - bounds.minLat)
    const months = area > 200 ? 3 : area > 100 ? 4 : area > 50 ? 6 : area > 20 ? 9 : 12
    try {
      const { data: series, clipped } = await fetchNDVIFromCopernicus(
        env.CDSE_CLIENT_ID,
        env.CDSE_CLIENT_SECRET,
        bounds,
        months,
      )
      if (series.length > 0) {
        const fetchedAt = new Date().toISOString()
        if (kv) {
          const payload: CachedNDVI = { data: series, fetchedAt, clipped }
          const writePromise = kv
            .put(cacheKey, JSON.stringify(payload), { expirationTtl: CACHE_TTL_SECONDS })
            .catch((e) => console.error("NDVI KV write failed:", e))
          if (ctx?.waitUntil) ctx.waitUntil(writePromise)
          else await writePromise
        }
        return liveResponse(modelled, series, bounds, fetchedAt, clipped)
      }
    } catch (err) {
      console.error(`Copernicus NDVI fetch failed for ${country}:`, err)
    }
  }

  // 3. Fall back to deterministic model. Use a very short TTL so a future
  //    request can pick up the live Copernicus data once Sentinel-2 succeeds.
  return NextResponse.json(
    { ...modelled, bounds: bounds ?? null },
    { headers: { "Cache-Control": "public, max-age=10, s-maxage=10" } },
  )
}

function liveResponse(
  modelled: NDVIResponse,
  data: NDVIData[],
  bounds: { minLon: number; minLat: number; maxLon: number; maxLat: number },
  fetchedAt: string,
  clipped?: boolean,
): NextResponse {
  return NextResponse.json(
    {
      ...modelled,
      data,
      source: clipped
        ? "Copernicus Sentinel-2 L2A (NDVI, monthly mean over central 6 deg sample)"
        : "Copernicus Sentinel-2 L2A (NDVI, monthly mean)",
      quality: "live" as const,
      note: clipped
        ? "Mean computed over a centered 6 deg sub-sample to fit within the request budget; representative of the country's central biome."
        : undefined,
      bounds,
      lastUpdated: fetchedAt,
    } satisfies NDVIResponse,
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  )
}
