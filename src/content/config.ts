import { defineCollection, z } from "astro:content";
import { notionLoader } from "notion-astro-loader";

// Graceful loader: wraps notionLoader so dev server doesn't crash without valid Notion credentials
function safeNotionLoader(options: Parameters<typeof notionLoader>[0]) {
  const inner = notionLoader(options);
  return {
    ...inner,
    async load(context: Parameters<typeof inner.load>[0]) {
      try {
        return await inner.load(context);
      } catch (e) {
        console.warn(`[notion-loader] Skipping load (${(e as Error).message})`);
      }
    },
  };
}

const articles = defineCollection({
  loader: safeNotionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_ARTICLES_DB,
    filter: {
      property: "Publicado",
      checkbox: { equals: true },
    },
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    fecha: z.string(),
    extracto: z.string().optional(),
    categoria: z.string().optional(),
    imagen: z.string().url().optional(),
    metaDescription: z.string().optional(),
  }),
});

const services = defineCollection({
  loader: safeNotionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_SERVICES_DB,
    filter: {
      property: "Activo",
      checkbox: { equals: true },
    },
  }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string().optional(),
    precioDesde: z.number().optional(),
    incluye: z.string().optional(),
    orden: z.number().optional(),
  }),
});

const faqs = defineCollection({
  loader: safeNotionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_FAQS_DB,
  }),
  schema: z.object({
    pregunta: z.string(),
    orden: z.number().optional(),
    categoria: z.string().optional(),
  }),
});

export const collections = { articles, services, faqs };
