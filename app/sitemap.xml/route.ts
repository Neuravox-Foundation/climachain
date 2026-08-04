import { PILOT_FACILITIES } from "@/lib/pilot/facilities.seed"
import { PILOT_LGAS } from "@/lib/pilot/lgas.seed"

const BASE_URL = "https://climachain.online"
const LAST_MODIFIED = "2026-08-04"

export const dynamic = "force-static"

interface SitemapEntry {
  path: string
  changeFrequency: "weekly" | "monthly"
  priority: number
}

function toXmlEntry(entry: SitemapEntry): string {
  return `  <url>\n    <loc>${BASE_URL}${entry.path}</loc>\n    <lastmod>${LAST_MODIFIED}</lastmod>\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority.toFixed(2)}</priority>\n  </url>`
}

export function GET(): Response {
  const entries: SitemapEntry[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/pilot", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pilot/brief", changeFrequency: "weekly", priority: 0.7 },
    ...PILOT_LGAS.map((lga) => ({
      path: `/pilot/lga/${lga.code}`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...PILOT_FACILITIES.map((facility) => ({
      path: `/pilot/facility/${facility.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(toXmlEntry),
    "</urlset>",
    "",
  ].join("\n")

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
