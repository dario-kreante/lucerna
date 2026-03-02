import type { AffiliationSystem, AfpName, InstitutionGuide } from "./types";

/** Common documents required across most institutions. */
const COMMON_DOCS = [
  "Certificado de defunción (original o copia autorizada)",
  "Cédula de identidad del solicitante (quien cobra)",
  "Certificado de nacimiento o matrimonio que acredite parentesco con el fallecido/a",
];

/** AFP-specific guide data. */
const AFP_GUIDES: Record<AfpName, InstitutionGuide> = {
  Capital: {
    institutionName: "AFP Capital",
    benefitName: "Cuota Mortuoria AFP Capital",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP Capital del fallecido/a",
    ],
    tramiteUrl: "https://www.afpcapital.cl/Paginas/cuota-mortuoria.aspx",
    phone: "600 226 7000",
    steps: [
      "Reunir los documentos indicados",
      "Acudir a una sucursal de AFP Capital o iniciar el trámite en línea",
      "Presentar la solicitud de cuota mortuoria con los documentos",
      "Esperar la resolución (hasta 10 días hábiles)",
      "Recibir el pago por transferencia o cheque",
    ],
  },
  Cuprum: {
    institutionName: "AFP Cuprum",
    benefitName: "Cuota Mortuoria AFP Cuprum",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP Cuprum del fallecido/a",
    ],
    tramiteUrl: "https://www.cuprum.cl/cuota-mortuoria",
    phone: "600 226 8000",
    steps: [
      "Reunir los documentos indicados",
      "Ingresar a cuprum.cl o acudir a una sucursal",
      "Completar formulario de solicitud de cuota mortuoria",
      "Adjuntar documentación requerida",
      "Esperar la resolución y pago (hasta 10 días hábiles)",
    ],
  },
  Habitat: {
    institutionName: "AFP Habitat",
    benefitName: "Cuota Mortuoria AFP Habitat",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP Habitat del fallecido/a",
    ],
    tramiteUrl: "https://www.afphabitat.cl/cuota-mortuoria",
    phone: "600 200 1010",
    steps: [
      "Reunir los documentos indicados",
      "Ingresar a afphabitat.cl o acudir a una sucursal",
      "Completar formulario de solicitud de cuota mortuoria",
      "Adjuntar documentación requerida",
      "Esperar la resolución y pago (hasta 10 días hábiles)",
    ],
  },
  Modelo: {
    institutionName: "AFP Modelo",
    benefitName: "Cuota Mortuoria AFP Modelo",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP Modelo del fallecido/a",
    ],
    tramiteUrl: "https://www.afpmodelo.cl/cuota-mortuoria",
    phone: "600 020 0100",
    steps: [
      "Reunir los documentos indicados",
      "Ingresar a afpmodelo.cl o acudir a una sucursal",
      "Completar formulario de solicitud de cuota mortuoria",
      "Adjuntar documentación requerida",
      "Esperar la resolución y pago (hasta 10 días hábiles)",
    ],
  },
  PlanVital: {
    institutionName: "AFP Plan Vital",
    benefitName: "Cuota Mortuoria AFP Plan Vital",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP Plan Vital del fallecido/a",
    ],
    tramiteUrl: "https://www.planvital.cl/cuota-mortuoria",
    phone: "600 700 6000",
    steps: [
      "Reunir los documentos indicados",
      "Ingresar a planvital.cl o acudir a una sucursal",
      "Completar formulario de solicitud de cuota mortuoria",
      "Adjuntar documentación requerida",
      "Esperar la resolución y pago (hasta 10 días hábiles)",
    ],
  },
  ProVida: {
    institutionName: "AFP ProVida",
    benefitName: "Cuota Mortuoria AFP ProVida",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP ProVida del fallecido/a",
    ],
    tramiteUrl: "https://www.provida.cl/cuota-mortuoria",
    phone: "600 200 7200",
    steps: [
      "Reunir los documentos indicados",
      "Ingresar a provida.cl o acudir a una sucursal",
      "Completar formulario de solicitud de cuota mortuoria",
      "Adjuntar documentación requerida",
      "Esperar la resolución y pago (hasta 10 días hábiles)",
    ],
  },
  Uno: {
    institutionName: "AFP Uno",
    benefitName: "Cuota Mortuoria AFP Uno",
    amount: "Hasta 15 UF (~$570.000 CLP)",
    deadline: "Hasta 12 meses desde el fallecimiento",
    documents: [
      ...COMMON_DOCS,
      "Comprobante de gastos funerarios (boleta o factura)",
      "Certificado de afiliación AFP Uno del fallecido/a",
    ],
    tramiteUrl: "https://www.afpuno.cl/cuota-mortuoria",
    phone: "600 226 0100",
    steps: [
      "Reunir los documentos indicados",
      "Ingresar a afpuno.cl o acudir a una sucursal",
      "Completar formulario de solicitud de cuota mortuoria",
      "Adjuntar documentación requerida",
      "Esperar la resolución y pago (hasta 10 días hábiles)",
    ],
  },
};

const PGU_GUIDE: InstitutionGuide = {
  institutionName: "Instituto de Previsión Social (IPS)",
  benefitName: "Cuota Mortuoria PGU / Pensión Básica Solidaria",
  amount: "Hasta 15 UF (~$570.000 CLP)",
  deadline: "Hasta 12 meses desde el fallecimiento",
  documents: [
    ...COMMON_DOCS,
    "Comprobante de gastos funerarios (boleta o factura)",
    "Certificado de beneficiario PGU/PBS del fallecido/a (si lo tiene)",
  ],
  tramiteUrl: "https://www.ips.gob.cl/cuota-mortuoria",
  phone: "600 440 0040",
  steps: [
    "Reunir los documentos indicados",
    "Acudir a una sucursal del IPS (ChileAtiende) o iniciar trámite en línea",
    "Solicitar la cuota mortuoria de pensionado PGU",
    "Presentar documentación requerida",
    "Esperar la resolución y pago (hasta 15 días hábiles)",
  ],
};

const RENTA_VITALICIA_GUIDE: InstitutionGuide = {
  institutionName: "Compañía de Seguros (Renta Vitalicia)",
  benefitName: "Cuota Mortuoria Renta Vitalicia",
  amount: "Hasta 15 UF (~$570.000 CLP)",
  deadline: "Hasta 12 meses desde el fallecimiento",
  documents: [
    ...COMMON_DOCS,
    "Comprobante de gastos funerarios (boleta o factura)",
    "Póliza o certificado de renta vitalicia del fallecido/a",
  ],
  tramiteUrl: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-47702.html",
  phone: "600 446 0044",
  steps: [
    "Identificar la compañía de seguros que administra la renta vitalicia",
    "Contactar directamente a la compañía de seguros",
    "Reunir los documentos indicados",
    "Presentar la solicitud de cuota mortuoria en la compañía",
    "Esperar la resolución y pago según los plazos de la compañía",
  ],
};

const FFAA_GUIDE: InstitutionGuide = {
  institutionName: "Capredena (FF.AA.)",
  benefitName: "Cuota Mortuoria Fuerzas Armadas",
  amount: "Hasta 15 UF (~$570.000 CLP)",
  deadline: "Hasta 12 meses desde el fallecimiento",
  documents: [
    ...COMMON_DOCS,
    "Comprobante de gastos funerarios (boleta o factura)",
    "Certificado de afiliación Capredena del fallecido/a",
    "Hoja de servicio o certificado de retiro (si aplica)",
  ],
  tramiteUrl: "https://www.capredena.gob.cl/cuota-mortuoria",
  phone: "600 122 0011",
  steps: [
    "Reunir los documentos indicados",
    "Acudir a una oficina de Capredena",
    "Presentar solicitud de cuota mortuoria",
    "Adjuntar documentación requerida",
    "Esperar la resolución y pago",
  ],
};

const CARABINEROS_GUIDE: InstitutionGuide = {
  institutionName: "Dipreca (Carabineros / PDI)",
  benefitName: "Cuota Mortuoria Carabineros / PDI",
  amount: "Hasta 15 UF (~$570.000 CLP)",
  deadline: "Hasta 12 meses desde el fallecimiento",
  documents: [
    ...COMMON_DOCS,
    "Comprobante de gastos funerarios (boleta o factura)",
    "Certificado de afiliación Dipreca del fallecido/a",
    "Hoja de servicio o certificado de retiro (si aplica)",
  ],
  tramiteUrl: "https://www.dipreca.cl/cuota-mortuoria",
  phone: "600 360 7676",
  steps: [
    "Reunir los documentos indicados",
    "Acudir a una oficina de Dipreca",
    "Presentar solicitud de cuota mortuoria",
    "Adjuntar documentación requerida",
    "Esperar la resolución y pago",
  ],
};

/**
 * Get the cobro guide for a given affiliation system.
 * Returns null for unknown — we never show unverified data.
 */
export function getGuide(system: AffiliationSystem): InstitutionGuide | null {
  switch (system.type) {
    case "afp":
      return AFP_GUIDES[system.afp];
    case "pgu":
      return PGU_GUIDE;
    case "renta-vitalicia":
      return RENTA_VITALICIA_GUIDE;
    case "ffaa":
      return FFAA_GUIDE;
    case "carabineros":
      return CARABINEROS_GUIDE;
    case "unknown":
      return null;
  }
}

/** Get the list of all AFP names. */
export function getAllAfpNames(): AfpName[] {
  return Object.keys(AFP_GUIDES) as AfpName[];
}
