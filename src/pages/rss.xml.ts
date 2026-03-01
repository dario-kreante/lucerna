export const prerender = true;

import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles");
  const sorted = articles.sort(
    (a, b) =>
      new Date(b.data.fecha).getTime() - new Date(a.data.fecha).getTime()
  );

  return rss({
    title: "Lucerna — Guía Funeraria",
    description:
      "Artículos informativos sobre trámites funerarios, beneficios previsionales y orientación legal en Chile.",
    site: context.site!.toString(),
    items: sorted.map((article) => ({
      title: article.data.title,
      description: article.data.extracto || article.data.metaDescription || "",
      pubDate: new Date(article.data.fecha),
      link: `/guia/${article.data.slug}/`,
      categories: article.data.categoria ? [article.data.categoria] : [],
    })),
    customData: `<language>es-cl</language>`,
  });
}
