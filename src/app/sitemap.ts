import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || "https://zaltrex.com";
  const routes = ["", "/about", "/solutions", "/contact", "/request-service"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/solutions" ? 0.9 : 0.8,
    alternates: {
      languages: {
        ar: `${baseUrl}${route}`,
        en: `${baseUrl}${route}`,
      },
    },
  }));
}
