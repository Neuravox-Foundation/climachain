import type { MetadataRoute } from "next"
import { PILOT_FACILITIES } from "@/lib/pilot/facilities.seed"
import { PILOT_LGAS } from "@/lib/pilot/lgas.seed"

const BASE_URL = "https://climachain.online"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const publicRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pilot`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pilot/brief`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const lgaRoutes: MetadataRoute.Sitemap = PILOT_LGAS.map((lga) => ({
    url: `${BASE_URL}/pilot/lga/${lga.code}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.65,
  }))

  const facilityRoutes: MetadataRoute.Sitemap = PILOT_FACILITIES.map((facility) => ({
    url: `${BASE_URL}/pilot/facility/${facility.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  return [...publicRoutes, ...lgaRoutes, ...facilityRoutes]
}
