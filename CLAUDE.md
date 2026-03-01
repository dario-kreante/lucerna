# Lucerna — Proyecto Astro

## Qué es
Plataforma chilena de servicios funerarios. Landing page + checklist interactivo + blog SEO + API para leads/cotizaciones.

## Stack
- **Astro 5** — static-first, SSR opt-in para API routes
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (NO usar `@astrojs/tailwind`)
- **Cloudflare Pages** — deploy con Workers para SSR
- **Notion** — CMS para artículos, servicios, FAQs (via `notion-astro-loader`)
- **Supabase** — PostgreSQL para leads, cotizaciones

## Comandos
```bash
npm run dev      # servidor local :4321
npm run build    # build estático
npm run preview  # preview del build
```

## Estructura
```
src/
  components/
    ui/        — Button, Card, Badge
    layout/    — Header, Footer, Container
    landing/   — Hero, Services, HowItWorks, FAQ, CTA, etc.
    checklist/ — ChecklistItem, ChecklistSection, ChecklistProgress
    guia/      — ArticleCard, ArticleGrid, TableOfContents
    seo/       — SchemaOrg, OpenGraph, Breadcrumbs
  layouts/     — BaseLayout, PageLayout, ArticleLayout
  pages/       — index, checklist, guia/, api/
  content/     — config.ts (Notion collections)
  lib/         — supabase/, utils/, constants.ts
  styles/      — global.css (Tailwind @theme tokens)
```

## Design system
- **Colores**: Sage (#5B7B6A), Sage Dark (#3D5C4B), Warm (#C4A97D), Cream (#FAF8F5)
- **Fonts**: DM Serif Display (headings), DM Sans (body) — via @fontsource
- **Tono**: Cálido, cercano, transparente. NO frío, clínico, corporativo.

## Convenciones
- Componentes Astro: PascalCase
- Utilidades: camelCase
- CSS: Tailwind utility classes, tokens via `@theme`
- Islands: usar `client:load` solo cuando se necesita interactividad inmediata, `client:visible` para lazy
