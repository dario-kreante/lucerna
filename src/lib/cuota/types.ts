/** Canonical AFP names in the Chilean system */
export type AfpName =
  | "Capital"
  | "Cuprum"
  | "Habitat"
  | "Modelo"
  | "PlanVital"
  | "ProVida"
  | "Uno";

/** Result of the AFP affiliation query to spensiones.cl */
export interface AfpResult {
  found: boolean;
  afp: AfpName | null;
  hasAfc: boolean;
  raw: string;
}

/** Result of the PGU beneficiary query to spensiones.cl */
export interface PguResult {
  found: boolean;
  isPguBeneficiary: boolean;
  raw: string;
}

/** The system the deceased was affiliated with */
export type AffiliationSystem =
  | { type: "afp"; afp: AfpName }
  | { type: "pgu" }
  | { type: "renta-vitalicia" }
  | { type: "ffaa" }
  | { type: "carabineros" }
  | { type: "unknown" };

/** Input for the consulta-cuota API endpoint */
export interface ConsultaRequest {
  rut: string;
  nombre?: string;
  email?: string;
  manualSelection?:
    | "renta-vitalicia"
    | "ffaa"
    | "carabineros"
    | "help"
    | `afp:${AfpName}`;
}

/** API response shape */
export interface ConsultaResponse {
  ok: boolean;
  data?: ConsultaResult;
  error?: string;
  needsMoreInfo?: boolean;
}

/** Full consultation result */
export interface ConsultaResult {
  rut: string;
  system: AffiliationSystem;
  /** Guide is omitted when system is unknown — we never show unverified data. */
  guide?: InstitutionGuide;
  timestamp: string;
}

/** Cobro guide for a specific institution */
export interface InstitutionGuide {
  institutionName: string;
  benefitName: string;
  amount: string;
  deadline: string;
  documents: string[];
  tramiteUrl: string;
  phone: string;
  steps: string[];
}

/** HTTP client interface — dependency-injected for testability */
export interface SpensionesClient {
  queryAfp(rut: string): Promise<string>;
  queryPgu(params: { rut: string; nombre: string; email: string }): Promise<string>;
}
