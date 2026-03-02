import type { SpensionesClient } from "./types";

const AFP_URL = "https://www.spensiones.cl/apps/certificados/formConsultaAfiliacion.php";
const PGU_URL = "https://www.spensiones.cl/apps/certificados/formConsultaPgu.php";

/**
 * Real HTTP client for spensiones.cl.
 *
 * Note: These endpoints may be protected by reCAPTCHA. If requests fail,
 * the cascade service handles this gracefully and falls back to manual selection.
 */
export function createSpensionesClient(): SpensionesClient {
  return {
    async queryAfp(rut: string): Promise<string> {
      const body = new URLSearchParams({ rut });
      const res = await fetch(AFP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) {
        throw new Error(`AFP query failed: ${res.status}`);
      }
      return res.text();
    },

    async queryPgu(params: { rut: string; nombre: string; email: string }): Promise<string> {
      const body = new URLSearchParams({
        rut: params.rut,
        nombre: params.nombre,
        email: params.email,
      });
      const res = await fetch(PGU_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) {
        throw new Error(`PGU query failed: ${res.status}`);
      }
      return res.text();
    },
  };
}
