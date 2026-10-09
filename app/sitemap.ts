import type { MetadataRoute } from "next";
import { CITY_PAGES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${SITE_URL}/images/home-detailing-logo.png`,
        `${SITE_URL}/images/interier-pred.jpeg`,
        `${SITE_URL}/images/interier-po.jpeg`,
        `${SITE_URL}/images/stredpanel-v2-pred.jpeg`,
        `${SITE_URL}/images/stredpanel-v2-po.jpeg`,
        `${SITE_URL}/images/interier-koberce-pred.jpeg`,
        `${SITE_URL}/images/interier-koberce-po.jpeg`,
        `${SITE_URL}/images/dvere-pred.jpeg`,
        `${SITE_URL}/images/dvere-po.jpeg`,
      ],
    },
    ...CITY_PAGES.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [`${SITE_URL}${page.image}`],
    })),
  ];
}
