// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://lucerna.cl",
  output: "server",
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["playwright"],
    },
    build: {
      rollupOptions: {
        // @cloudflare/puppeteer is provided by the Workers runtime — do not bundle it.
        // playwright is dev-only and should never be included in production builds.
        external: ["@cloudflare/puppeteer", "playwright"],
      },
    },
  },
});
