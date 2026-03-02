import type { ConsultaResponse, SpensionesClient } from "./types";
import { validateRut } from "../utils/formatters";
import { consultaCuota } from "./cascade-service";
import { createSpensionesClientFromEnv } from "./client-factory";

interface HandlerResult {
  status: number;
  body: ConsultaResponse;
}

/**
 * Pure handler for the consulta-cuota endpoint.
 * Separated from the Astro route for testability.
 */
export async function handleConsultaCuota(
  params: Record<string, unknown>,
  client?: SpensionesClient
): Promise<HandlerResult> {
  const rut = typeof params.rut === "string" ? params.rut : "";
  const nombre = typeof params.nombre === "string" ? params.nombre : undefined;
  const email = typeof params.email === "string" ? params.email : undefined;
  const manualSelection = typeof params.manualSelection === "string"
    ? (params.manualSelection as "renta-vitalicia" | "ffaa" | "carabineros" | "help")
    : undefined;

  if (!rut) {
    return {
      status: 400,
      body: { ok: false, error: "RUT es requerido." },
    };
  }

  if (!validateRut(rut)) {
    return {
      status: 400,
      body: { ok: false, error: "RUT no válido. Verifique el dígito verificador." },
    };
  }

  const spensionesClient = client ?? createSpensionesClientFromEnv();
  const result = await consultaCuota(
    { rut, nombre, email, manualSelection },
    spensionesClient
  );

  return { status: 200, body: result };
}
