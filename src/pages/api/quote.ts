export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@lib/supabase/server";

export const POST: APIRoute = async (context) => {
  const headers = { "Content-Type": "application/json" };

  try {
    const body = await context.request.json();
    const { nombre, telefono, email, servicio, comuna, notas } = body;

    if (!nombre || !telefono) {
      return new Response(
        JSON.stringify({ error: "Nombre y teléfono son requeridos." }),
        { status: 400, headers }
      );
    }

    const supabase = createClient(context);
    const { error } = await supabase.from("cotizaciones").insert({
      nombre,
      telefono,
      email: email || null,
      servicio: servicio || null,
      comuna: comuna || null,
      notas: notas || null,
      origen: "web",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({ error: "Error al guardar la cotización." }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Cotización recibida." }),
      { status: 200, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Solicitud inválida." }),
      { status: 400, headers }
    );
  }
};
