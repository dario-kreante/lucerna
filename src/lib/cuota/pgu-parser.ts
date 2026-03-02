import type { PguResult } from "./types";

/** Positive indicators that the person is a PGU beneficiary. */
const PGU_POSITIVE_PATTERNS = [
  /es\s+potencial\s+beneficiari/i,
  /beneficiario\/a\s+de\s+la\s+pensión\s+garantizada/i,
  /beneficiario.*pgu/i,
];

/** Negative indicators confirming the query worked but person is not eligible. */
const PGU_NEGATIVE_PATTERNS = [
  /no\s+cumple\s+con\s+los\s+requisitos/i,
  /no\s+es\s+beneficiari/i,
  /no\s+registra\s+beneficio/i,
];

/** Parse the HTML response from spensiones.cl PGU/APS query. */
export function parsePguResponse(html: string): PguResult {
  if (!html || html.length < 50) {
    return { found: false, isPguBeneficiary: false, raw: "" };
  }

  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

  // Check for error pages
  if (text.toLowerCase().includes("alert-danger") || text.toLowerCase().includes("error")) {
    // Only treat as error if it doesn't also contain result patterns
    const hasResultPattern = [...PGU_POSITIVE_PATTERNS, ...PGU_NEGATIVE_PATTERNS].some((p) =>
      p.test(text)
    );
    if (!hasResultPattern) {
      return { found: false, isPguBeneficiary: false, raw: text.slice(0, 500) };
    }
  }

  // Check negative patterns first (they're more specific and prevent false positives)
  for (const pattern of PGU_NEGATIVE_PATTERNS) {
    if (pattern.test(text)) {
      return { found: true, isPguBeneficiary: false, raw: text.slice(0, 500) };
    }
  }

  // Check positive patterns
  for (const pattern of PGU_POSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      return { found: true, isPguBeneficiary: true, raw: text.slice(0, 500) };
    }
  }

  // No recognizable patterns — treat as unknown/error
  return { found: false, isPguBeneficiary: false, raw: text.slice(0, 500) };
}
