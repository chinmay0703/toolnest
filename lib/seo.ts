import type { Metadata } from "next";

const BASE_URL = "https://toolnest.vercel.app";

export function generateToolMetadata(
  toolName: string,
  description: string,
  category: string,
  slug: string
): Metadata {
  const title = `${toolName} Free Online — No Signup`;
  const fullDescription = `Free ${toolName.toLowerCase()} online. No signup, no watermark, runs in your browser. ${description}. Works on mobile and desktop.`;
  const url = `${BASE_URL}/${category}/${slug}`;

  return {
    title,
    description: fullDescription,
    keywords: `${toolName.toLowerCase()}, free ${toolName.toLowerCase()}, ${toolName.toLowerCase()} online, ${toolName.toLowerCase()} no signup, ${toolName.toLowerCase()} browser`,
    openGraph: {
      title: `${toolName} — ToolNest`,
      description: fullDescription,
      url,
      type: "website",
      siteName: "ToolNest",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateCategoryMetadata(
  categoryName: string,
  description: string,
  categoryId: string
): Metadata {
  const title = `Free ${categoryName} Online — No Signup`;
  const fullDescription = `Free ${categoryName.toLowerCase()} online. ${description}. No signup required. Runs 100% in your browser.`;
  const url = `${BASE_URL}/${categoryId}`;

  return {
    title,
    description: fullDescription,
    openGraph: {
      title: `${categoryName} — ToolNest`,
      description: fullDescription,
      url,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateJsonLd(
  name: string,
  description: string,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${BASE_URL}${url}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
