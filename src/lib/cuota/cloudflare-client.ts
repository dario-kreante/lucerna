import type { SpensionesClient } from "./types";

/**
 * Stub SpensionesClient for Cloudflare Browser Rendering.
 *
 * Will be implemented when deploying to production with Cloudflare Workers
 * Browser Rendering (requires Workers Paid plan ~$5/mo).
 *
 * The implementation will use @cloudflare/puppeteer to launch a browser
 * session within the Workers runtime, following the same flow as
 * playwright-client.ts.
 */
export function createCloudflareClient(): SpensionesClient {
  return {
    async queryAfp(): Promise<string> {
      throw new Error(
        "Cloudflare Browser Rendering not yet implemented. " +
          "Set SPENSIONES_STRATEGY=playwright for local development."
      );
    },

    async queryPgu(): Promise<string> {
      throw new Error(
        "Cloudflare Browser Rendering not yet implemented. " +
          "Set SPENSIONES_STRATEGY=playwright for local development."
      );
    },
  };
}
