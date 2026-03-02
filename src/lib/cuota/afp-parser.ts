import type { AfpName, AfpResult } from "./types";

/** Map of lowercase keywords → canonical AfpName. */
const AFP_NAME_MAP: Record<string, AfpName> = {
  "plan vital": "PlanVital",
  planvital: "PlanVital",
  provida: "ProVida",
  capital: "Capital",
  cuprum: "Cuprum",
  habitat: "Habitat",
  modelo: "Modelo",
  uno: "Uno",
};

/**
 * Normalize a raw AFP name string (e.g. "PROVIDA", "PLAN VITAL", "Habitat")
 * to the canonical AfpName type.
 *
 * Tries the full string first (handles "Plan Vital"), then falls back
 * to the first word only (handles "Habitat Tipo" from greedy captures).
 */
function normalizeAfpName(raw: string): AfpName | null {
  const lower = raw.toLowerCase().trim();
  // Try full string first (e.g. "Plan Vital")
  if (AFP_NAME_MAP[lower]) return AFP_NAME_MAP[lower];
  // Fallback to first word (e.g. "Habitat" from "Habitat Tipo")
  const firstWord = lower.split(/\s+/)[0];
  return AFP_NAME_MAP[firstWord] ?? null;
}

/** Parse the HTML response from spensiones.cl AFP affiliation query. */
export function parseAfpResponse(html: string): AfpResult {
  if (!html || html.length < 50) {
    return { found: false, afp: null, hasAfc: false, raw: "" };
  }

  // Strip HTML tags to get plain text, normalize whitespace
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const textLower = text.toLowerCase();

  // Check for "no se encontraron" or error patterns
  if (
    textLower.includes("no se encontraron") ||
    textLower.includes("error al procesar") ||
    textLower.includes("alert-danger")
  ) {
    return { found: false, afp: null, hasAfc: false, raw: text.slice(0, 500) };
  }

  const hasAfc =
    textLower.includes("afc") && !textLower.includes("no está afiliado");

  // Strategy 1: Real spensiones.cl format — "incorporado(a) a AFP XXXXX"
  // This is the definitive affiliation statement, immune to the AFP list below.
  const affiliationMatch = text.match(
    /incorporado\(a\)\s+a\s+AFP\s+([\w]+(?:\s+[\w]+)?)/i
  );
  if (affiliationMatch) {
    const afp = normalizeAfpName(affiliationMatch[1]);
    if (afp) {
      return { found: true, afp, hasAfc, raw: text.slice(0, 500) };
    }
  }

  // Strategy 2: Table format — "Institución Previsional" row with "AFP Xxxx"
  // Used in simplified responses or alternate page layouts.
  const tableMatch = text.match(
    /Instituci[oó]n\s+Previsional\s+AFP\s+([\w]+(?:\s+[\w]+)?)/i
  );
  if (tableMatch) {
    const afp = normalizeAfpName(tableMatch[1]);
    if (afp) {
      return { found: true, afp, hasAfc, raw: text.slice(0, 500) };
    }
  }

  return { found: false, afp: null, hasAfc: false, raw: text.slice(0, 500) };
}
