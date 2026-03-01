export const prerender = true;

import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles");
  const sorted = articles.sort(
    (a, b) =>
      new Date(b.data.fecha).getTime() - new Date(a.data.fecha).getTime()
  );

  const site = context.site!.toString().replace(/\/$/, "");

  const lines = [
    "# Lucerna — Servicios Funerarios en Chile",
    "",
    "> Luz que te acompaña. Servicios funerarios dignos, transparentes y accesibles en Chile.",
    "",
    "## Páginas principales",
    "",
    `- [Inicio](${site}/)`,
    `- [Checklist Post-Fallecimiento](${site}/checklist/)`,
    `- [Guía Funeraria](${site}/guia/)`,
    "",
    "## Artículos de la guía",
    "",
    ...sorted.map(
      (a) =>
        `- [${a.data.title}](${site}/guia/${a.data.slug}/): ${a.data.extracto || a.data.metaDescription || ""}`
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
