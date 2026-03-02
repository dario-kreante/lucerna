export const prerender = false;

import type { APIRoute } from "astro";
import { handleConsultaCuota } from "@lib/cuota/consulta-handler";

export const POST: APIRoute = async (context) => {
  const headers = { "Content-Type": "application/json" };

  try {
    const body = await context.request.json();
    const result = await handleConsultaCuota(body);

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers,
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Solicitud inválida." }),
      { status: 400, headers }
    );
  }
};
