/**
 * Empirical test v2: Generate reCAPTCHA token manually,
 * inject it, and submit the form programmatically.
 */
import { chromium } from "playwright";

const RUT = "169986541";
const URL =
  "https://www.spensiones.cl/apps/certificados/formConsultaAfiliacion.php";

async function testSpensiones() {
  console.log("=== Test v2: token manual + submit directo ===\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    // Step 1: Load the form
    console.log("1. Cargando formulario...");
    await page.goto(URL, { waitUntil: "networkidle", timeout: 15000 });
    console.log("   OK");

    // Step 2: Fill RUT
    console.log(`2. Ingresando RUT: ${RUT}`);
    await page.fill('input[name="rut"]', RUT);

    // Step 3: Wait for reCAPTCHA v3 to be ready and generate token
    console.log("3. Generando token reCAPTCHA v3...");
    const tokenResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        if (typeof grecaptcha === "undefined") {
          resolve({ error: "grecaptcha not loaded" });
          return;
        }
        grecaptcha.ready(async () => {
          try {
            const siteKey = "6LdY_G8mAAAAAIkbfYun3SQIZeNIHm_lqPDkckWH";
            const token = await grecaptcha.execute(siteKey, {
              action: "submit",
            });
            resolve({ token, length: token.length });
          } catch (e) {
            resolve({ error: e.message });
          }
        });
      });
    });

    if (tokenResult.error) {
      console.log(`   ❌ Error: ${tokenResult.error}`);
      return;
    }
    console.log(`   ✓ Token generado (${tokenResult.length} chars)`);

    // Step 4: Inject token into hidden field and submit
    console.log("4. Inyectando token y enviando formulario...");

    // Get the sessionid too
    const sessionId = await page.evaluate(() => {
      const el = document.querySelector('input[name="sessionid"]');
      return el ? el.value : null;
    });
    console.log(`   SessionID: ${sessionId}`);

    // Submit using the onSubmit callback path — inject token and submit form
    const resultHtml = await page.evaluate(async (token) => {
      // Create or find the hidden g-recaptcha-response field
      let field = document.querySelector(
        'textarea[name="g-recaptcha-response"]'
      );
      if (!field) {
        field = document.querySelector(
          'input[name="g-recaptcha-response"]'
        );
      }
      if (!field) {
        // Create it
        field = document.createElement("input");
        field.type = "hidden";
        field.name = "g-recaptcha-response";
        document.getElementById("datos").appendChild(field);
      }
      field.value = token;

      // Now submit the form via the form action
      const form = document.getElementById("datos");
      const formData = new FormData(form);

      // Log what we're sending
      const params = {};
      for (const [key, value] of formData.entries()) {
        params[key] = key === "g-recaptcha-response" ? value.substring(0, 30) + "..." : value;
      }

      // Do a fetch POST to the form action
      const res = await fetch("consultaAfiliacion.php", {
        method: "POST",
        body: new URLSearchParams(formData),
      });
      const html = await res.text();
      return { html: html.substring(0, 2000), params, status: res.status };
    }, tokenResult.token);

    console.log(`   HTTP Status: ${resultHtml.status}`);
    console.log(`   Params enviados:`, resultHtml.params);

    // Step 5: Analyze result
    const html = resultHtml.html;

    if (html.includes("se encuentra incorporado")) {
      console.log("\n✅ ¡ÉXITO! Afiliación encontrada.");

      // Extract AFP name
      const afpMatch = html.match(/incorporado\(a\) a (AFP \w+)/);
      if (afpMatch) {
        console.log(`   AFP: ${afpMatch[1]}`);
      }

      // Extract more details
      const nameMatch = html.match(
        /señor\(a\)\s+([^,]+),\s+RUT/
      );
      if (nameMatch) {
        console.log(`   Nombre: ${nameMatch[1]}`);
      }

      // Print relevant portion
      const startIdx = html.indexOf("Certifico");
      if (startIdx !== -1) {
        const excerpt = html
          .substring(startIdx, startIdx + 500)
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        console.log(`\n   Extracto: "${excerpt.substring(0, 300)}..."`);
      }
    } else if (html.includes("Parámetros incorrectos")) {
      console.log("\n❌ FALLO: 'Parámetros incorrectos'");
      console.log(
        "   El token reCAPTCHA fue rechazado (score bajo o inválido)"
      );
    } else if (html.includes("no se encuentra")) {
      console.log("\n⚠️  RUT no encontrado en el sistema AFP");
    } else {
      console.log("\n⚠️  Resultado inesperado:");
      const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      console.log(`   ${text.substring(0, 500)}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await browser.close();
  }
}

testSpensiones();
