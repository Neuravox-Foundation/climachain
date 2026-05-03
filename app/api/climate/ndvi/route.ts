import { type NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getNDVISeries, type NDVIData, type NDVIResponse } from "@/lib/climate-api"
import { COUNTRY_BBOX, getCountryByCode } from "@/lib/countries"
import { fetchNDVIFromCopernicus } from "@/lib/copernicus"

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
const CACHE_VERSION = "v1"

interface CachedNDVI {
  data: NDVIData[]
  fetchedAt: string
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
    // Running outside the Cloudflare runtime (e.g. local Next dev). Fall through.
  }

  const credentialsConfigured = Boolean(env.CDSE_CLIENT_ID && env.CDSE_CLIENT_SECRET)
  const kv = env.NDVI_KV as KVNamespace | undefined

  // 1. Try cache.
  if (kv && bounds) {
    const cacheKey = `ndvi:${CACHE_VERSION}:${country}`
    try {
      const cached = await kv.get<CachedNDVI>(cacheKey, "json")
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        return NextResponse.json(
          {
            ...modelled,
            data: cached.data,
            source: "Copernicus Sentinel-2 L2A (NDVI, monthly mean)",
            quality: "live" as const,
            note: undefined,
            bounds,
            lastUpdated: cached.fetchedAt,
          } satisfies NDVIResponse,
          { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
        )
      }
    } catch (err) {
      console.error("NDVI KV read failed:", err)
    }
  }

  // 2. Cache miss. If we have credentials and bounds, try Copernicus synchronously
  //    (capped at 30s). On success, populate KV; on failure, return modelled data.
  if (credentialsConfigured && bounds) {
    try {
      const series = await fetchNDVIFromCopernicus(env.CDSE_CLIENT_ID, env.CDSE_CLIENT_SECRET, bounds)
      if (series.length > 0) {
        if (kv) {
          const payload: CachedNDVI = { data: series, fetchedAt: new Date().toISOString() }
          const writePromise = kv.put(`ndvi:${CACHE_VERSION}:${country}`, JSON.stringify(payload), {
            expirationTtl: CACHE_TTL_SECONDS,
          })
          if (ctx?.waitUntil) ctx.waitUntil(writePromise)
          else await writePromise.catch((e) => console.error("NDVI KV write failed:", e))
        }
        return NextResponse.json(
          {
            ...modelled,
            data: series,
            source: "Copernicus Sentinel-2 L2A (NDVI, monthly mean)",
            quality: "live" as const,
            note: undefined,
            bounds,
            lastUpdated: new Date().toISOString(),
          } satisfies NDVIResponse,
          { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
        )
      }
    } catch (err) {
      console.error(`Copernicus NDVI fetch failed for ${country}:`, err)
    }
  }

  // 3. Fall back to deterministic model.
  return NextResponse.json(
    { ...modelled, bounds: bounds ?? null },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  )
}
