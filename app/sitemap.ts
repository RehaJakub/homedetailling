import type { MetadataRoute } from "next";

const siteUrl = "https://homedetailing.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${siteUrl}/images/home-detailing-logo.png`,
        `${siteUrl}/images/interier-pred.jpeg`,
        `${siteUrl}/images/interier-po.jpeg`,
        `${siteUrl}/images/stredpanel-v2-pred.jpeg`,
        `${siteUrl}/images/stredpanel-v2-po.jpeg`,
        `${siteUrl}/images/interier-koberce-pred.jpeg`,
        `${siteUrl}/images/interier-koberce-po.jpeg`,
        `${siteUrl}/images/dvere-pred.jpeg`,
        `${siteUrl}/images/dvere-po.jpeg`,
      ],
    },
  ];
}
