import type { SpensionesClient } from "./types";

/**
 * Factory that creates a SpensionesClient based on the SPENSIONES_STRATEGY
 * environment variable:
 *
 * - "playwright" → Headless Chromium via Playwright (local dev)
 * - "cloudflare" → Cloudflare Browser Rendering (production, future)
 * - default      → Direct fetch POST (original, likely blocked by reCAPTCHA)
 *
 * All strategies use lazy proxy + dynamic import so that:
 * 1. The factory returns synchronously (SpensionesClient interface)
 * 2. The actual client module is loaded only on first call
 * 3. Playwright is never bundled in production builds
 */
export function createSpensionesClientFromEnv(): SpensionesClient {
  const strategy =
    (typeof process !== "undefined" && process.env?.SPENSIONES_STRATEGY) ||
    (import.meta as any).env?.SPENSIONES_STRATEGY ||
    "fetch";

  let realClient: SpensionesClient | null = null;

  const init = async (): Promise<SpensionesClient> => {
    if (realClient) return realClient;

    switch (strategy) {
      case "playwright": {
        const mod = await import("./playwright-client");
        realClient = mod.createPlaywrightClient();
        break;
      }
      case "cloudflare": {
        const mod = await import("./cloudflare-client");
        realClient = mod.createCloudflareClient();
        break;
      }
      default: {
        const mod = await import("./spensiones-client");
        realClient = mod.createSpensionesClient();
        break;
      }
    }

    return realClient;
  };

  // Lazy proxy: synchronous return, async resolution on first call
  return {
    async queryAfp(rut) {
      return (await init()).queryAfp(rut);
    },
    async queryPgu(params) {
      return (await init()).queryPgu(params);
    },
  };
}
