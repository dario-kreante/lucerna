import { SITE } from "@lib/constants";

interface ArticleSchemaOptions {
  title: string;
  description?: string;
  image?: string;
  publishDate: string;
  url: string;
}

/** Generate Schema.org Article JSON-LD. */
export function articleSchema(options: ArticleSchemaOptions): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description || "",
    image: options.image || "",
    datePublished: options.publishDate,
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/lucerna-logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": options.url,
    },
  });
}

interface LocalBusinessSchemaOptions {
  name?: string;
  description?: string;
  url?: string;
  phone?: string;
  email?: string;
}

/** Generate Schema.org LocalBusiness JSON-LD. */
export function localBusinessSchema(
  options: LocalBusinessSchemaOptions = {}
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: options.name || SITE.name,
    description: options.description || SITE.description,
    url: options.url || SITE.url,
    telephone: options.phone || SITE.phone,
    email: options.email || SITE.email,
    logo: `${SITE.url}/lucerna-logo.svg`,
    areaServed: {
      "@type": "Country",
      name: "Chile",
    },
    serviceType: "Funeral Services",
  });
}

/** Generate breadcrumb JSON-LD. */
export function breadcrumbSchema(
  items: { name: string; url: string }[]
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
