import type { SpensionesClient } from "./types";

const AFP_FORM_URL =
  "https://www.spensiones.cl/apps/certificados/formConsultaAfiliacion.php";
const PGU_FORM_URL =
  "https://www.spensiones.cl/apps/certificados/formConsultaPgu.php";
const RECAPTCHA_SITEKEY = "6LdY_G8mAAAAAIkbfYun3SQIZeNIHm_lqPDkckWH";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type Browser = import("playwright").Browser;

/** Singleton browser instance — reused across requests. */
let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      return chromium.launch({ headless: true });
    })();
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

/**
 * Generate a reCAPTCHA v3 token inside the page context.
 * Returns the token string or throws on failure.
 */
async function generateRecaptchaToken(page: import("playwright").Page): Promise<string> {
  const result = await page.evaluate(async (siteKey: string) => {
    return new Promise<{ token?: string; error?: string }>((resolve) => {
      if (typeof (globalThis as any).grecaptcha === "undefined") {
        resolve({ error: "grecaptcha not loaded" });
        return;
      }
      (globalThis as any).grecaptcha.ready(async () => {
        try {
          const token = await (globalThis as any).grecaptcha.execute(siteKey, {
            action: "submit",
          });
          resolve({ token });
        } catch (e: any) {
          resolve({ error: e.message });
        }
      });
    });
  }, RECAPTCHA_SITEKEY);

  if (result.error || !result.token) {
    throw new Error(`reCAPTCHA token generation failed: ${result.error ?? "no token"}`);
  }
  return result.token;
}

/**
 * Inject the reCAPTCHA token into the form and submit via in-page fetch.
 * Returns the raw HTML response from spensiones.cl.
 */
async function submitFormWithToken(
  page: import("playwright").Page,
  token: string,
  actionUrl: string
): Promise<string> {
  const result = await page.evaluate(
    async ({ token, actionUrl }: { token: string; actionUrl: string }) => {
      // Find or create the g-recaptcha-response field
      let field =
        document.querySelector<HTMLTextAreaElement>(
          'textarea[name="g-recaptcha-response"]'
        ) ??
        document.querySelector<HTMLInputElement>(
          'input[name="g-recaptcha-response"]'
        );

      if (!field) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "g-recaptcha-response";
        document.getElementById("datos")?.appendChild(input);
        field = input;
      }
      field.value = token;

      const form = document.getElementById("datos") as HTMLFormElement | null;
      if (!form) throw new Error("Form #datos not found");

      const formData = new FormData(form);
      const res = await fetch(actionUrl, {
        method: "POST",
        body: new URLSearchParams(formData as any),
      });
      return res.text();
    },
    { token, actionUrl }
  );

  return result;
}

/**
 * Creates a SpensionesClient backed by headless Chromium via Playwright.
 *
 * Flow per query:
 * 1. Load the form page (gets sessionid + reCAPTCHA v3 JS)
 * 2. Fill in the RUT (and other fields for PGU)
 * 3. Generate reCAPTCHA v3 token via grecaptcha.execute()
 * 4. Inject token into hidden field + submit via in-page fetch
 * 5. Return the raw HTML response
 */
export function createPlaywrightClient(): SpensionesClient {
  return {
    async queryAfp(rut: string): Promise<string> {
      const browser = await getBrowser();
      const context = await browser.newContext({ userAgent: USER_AGENT });
      const page = await context.newPage();

      try {
        await page.goto(AFP_FORM_URL, {
          waitUntil: "networkidle",
          timeout: 15000,
        });

        await page.fill('input[name="rut"]', rut);

        const token = await generateRecaptchaToken(page);
        return await submitFormWithToken(page, token, "consultaAfiliacion.php");
      } finally {
        await context.close();
      }
    },

    async queryPgu(params: {
      rut: string;
      nombre: string;
      email: string;
    }): Promise<string> {
      const browser = await getBrowser();
      const context = await browser.newContext({ userAgent: USER_AGENT });
      const page = await context.newPage();

      try {
        await page.goto(PGU_FORM_URL, {
          waitUntil: "networkidle",
          timeout: 15000,
        });

        await page.fill('input[name="rut"]', params.rut);

        // PGU form may have nombre and email fields
        const nombreInput = await page.$('input[name="nombre"]');
        if (nombreInput) await nombreInput.fill(params.nombre);

        const emailInput = await page.$('input[name="email"]');
        if (emailInput) await emailInput.fill(params.email);

        const token = await generateRecaptchaToken(page);
        return await submitFormWithToken(page, token, "consultaPgu.php");
      } finally {
        await context.close();
      }
    },
  };
}
