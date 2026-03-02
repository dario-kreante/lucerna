import type {
  AffiliationSystem,
  AfpName,
  ConsultaRequest,
  ConsultaResponse,
  SpensionesClient,
} from "./types";
import { cleanRut } from "../utils/formatters";
import { parseAfpResponse } from "./afp-parser";
import { parsePguResponse } from "./pgu-parser";
import { getGuide } from "./guide-data";

/**
 * Cascade consulta: AFP → PGU → unknown.
 * Manual selection skips all API calls and returns the guide directly.
 */
export async function consultaCuota(
  req: ConsultaRequest,
  client: SpensionesClient
): Promise<ConsultaResponse> {
  const rut = cleanRut(req.rut);

  // Manual selection — skip API calls entirely
  if (req.manualSelection) {
    if (req.manualSelection === "help") {
      return buildUnverifiedResponse(rut);
    }
    const system = manualToSystem(req.manualSelection);
    return buildResponse(rut, system);
  }

  // Step 1: Query AFP affiliation
  const afpSystem = await queryAfpSafe(rut, client);
  if (afpSystem) {
    return buildResponse(rut, afpSystem);
  }

  // Step 2: Cascade to PGU (requires nombre + email)
  if (req.nombre && req.email) {
    const pguSystem = await queryPguSafe(rut, req.nombre, req.email, client);
    if (pguSystem) {
      return buildResponse(rut, pguSystem);
    }
  }

  // Step 3: Could not determine affiliation — signal to frontend
  return buildUnverifiedResponse(rut);
}

function manualToSystem(
  selection: NonNullable<ConsultaRequest["manualSelection"]>
): AffiliationSystem {
  // Handle AFP manual selection (format: "afp:NombreAFP")
  if (selection.startsWith("afp:")) {
    const afpName = selection.slice(4) as AfpName;
    return { type: "afp", afp: afpName };
  }

  switch (selection) {
    case "renta-vitalicia":
      return { type: "renta-vitalicia" };
    case "ffaa":
      return { type: "ffaa" };
    case "carabineros":
      return { type: "carabineros" };
    case "help":
      // Should not reach here — handled before manualToSystem is called
      return { type: "unknown" };
  }
}

async function queryAfpSafe(
  rut: string,
  client: SpensionesClient
): Promise<AffiliationSystem | null> {
  try {
    const html = await client.queryAfp(rut);
    const result = parseAfpResponse(html);
    if (result.found && result.afp) {
      return { type: "afp", afp: result.afp };
    }
    return null;
  } catch {
    return null;
  }
}

async function queryPguSafe(
  rut: string,
  nombre: string,
  email: string,
  client: SpensionesClient
): Promise<AffiliationSystem | null> {
  try {
    const html = await client.queryPgu({ rut, nombre, email });
    const result = parsePguResponse(html);
    if (result.found && result.isPguBeneficiary) {
      return { type: "pgu" };
    }
    return null;
  } catch {
    return null;
  }
}

function buildResponse(rut: string, system: AffiliationSystem): ConsultaResponse {
  const guide = getGuide(system);
  return {
    ok: true,
    data: {
      rut,
      system,
      ...(guide ? { guide } : {}),
      timestamp: new Date().toISOString(),
    },
  };
}

/** Unknown system — no guide, signal that more info is needed. */
function buildUnverifiedResponse(rut: string): ConsultaResponse {
  return {
    ok: true,
    needsMoreInfo: true,
    data: {
      rut,
      system: { type: "unknown" },
      timestamp: new Date().toISOString(),
    },
  };
}
