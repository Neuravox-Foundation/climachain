import { type NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getNDVISeries, type NDVIData, type NDVIResponse } from "@/lib/climate-api"
import { COUNTRY_BBOX, getCountryByCode } from "@/lib/countries"
import { fetchNDVIFromCopernicus } from "@/lib/copernicus"

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
const CACHE_VERSION = "v1"
const INFLIGHT_LOCK_TTL = 60 * 5 // 5 minutes

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
    // Outside the Cloudflare runtime (e.g. local Next dev). Fall through.
  }

  const credentialsConfigured = Boolean(env.CDSE_CLIENT_ID && env.CDSE_CLIENT_SECRET)
  const kv = env.NDVI_KV as KVNamespace | undefined
  const cacheKey = `ndvi:${CACHE_VERSION}:${country}`
  const lockKey = `lock:${CACHE_VERSION}:${country}`

  // 1. Try cache first.
  if (kv && bounds) {
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

  // 2. Cache miss. If credentials + bounds + ctx.waitUntil are available,
  //    kick off the Copernicus fetch in the background and return modelled
  //    data immediately. Subsequent requests will get live data from KV.
  if (credentialsConfigured && bounds && kv && ctx?.waitUntil) {
    ctx.waitUntil(populateCache(env, kv, country, cacheKey, lockKey, bounds))
  }

  // 3. Return deterministic model.
  return NextResponse.json(
    {
      ...modelled,
      bounds: bounds ?? null,
      note: credentialsConfigured && bounds
        ? "Live Sentinel-2 NDVI is being fetched in the background; refresh in ~30 seconds."
        : modelled.note,
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } },
  )
}

/**
 * Populate KV with a fresh Copernicus fetch. Uses a short-lived lock key to
 * avoid concurrent Workers all firing the same heavy Statistics call when a
 * cache entry first expires.
 */
async function populateCache(
  env: any,
  kv: KVNamespace,
  country: string,
  cacheKey: string,
  lockKey: string,
  bounds: { minLon: number; minLat: number; maxLon: number; maxLat: number },
): Promise<void> {
  try {
    const lockHolder = await kv.get(lockKey)
    if (lockHolder) return
    await kv.put(lockKey, "1", { expirationTtl: INFLIGHT_LOCK_TTL })
  } catch (err) {
    console.error(`NDVI lock acquire failed for ${country}:`, err)
    return
  }

  try {
    const series = await fetchNDVIFromCopernicus(env.CDSE_CLIENT_ID, env.CDSE_CLIENT_SECRET, bounds)
    if (series.length === 0) return
    const payload: CachedNDVI = { data: series, fetchedAt: new Date().toISOString() }
    await kv.put(cacheKey, JSON.stringify(payload), { expirationTtl: CACHE_TTL_SECONDS })
    console.log(`NDVI cache populated for ${country}: ${series.length} points`)
  } catch (err) {
    console.error(`Copernicus NDVI fetch failed for ${country}:`, err)
  } finally {
    await kv.delete(lockKey).catch(() => {})
  }
}
