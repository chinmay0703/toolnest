import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { categories } from "@/lib/categories";

const BASE_URL = "https://toolnest.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolUrls = tools.map((tool) => ({
    url: `${BASE_URL}${tool.url}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: tool.popular ? 0.8 : 0.7,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${BASE_URL}/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...categoryUrls,
    ...toolUrls,
  ];
}
