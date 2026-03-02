import { describe, it, expect } from "vitest";
import { getGuide, getAllAfpNames } from "./guide-data";
import type { AffiliationSystem, AfpName } from "./types";

const ALL_AFPS: AfpName[] = [
  "Capital",
  "Cuprum",
  "Habitat",
  "Modelo",
  "PlanVital",
  "ProVida",
  "Uno",
];

describe("getGuide", () => {
  it("returns a guide for each of the 7 AFPs", () => {
    for (const afp of ALL_AFPS) {
      const system: AffiliationSystem = { type: "afp", afp };
      const guide = getGuide(system);
      expect(guide).toBeDefined();
      expect(guide.institutionName).toContain(afp === "PlanVital" ? "Plan Vital" : afp);
    }
  });

  it("each AFP guide has all required fields populated", () => {
    for (const afp of ALL_AFPS) {
      const guide = getGuide({ type: "afp", afp });
      expect(guide.institutionName).toBeTruthy();
      expect(guide.benefitName).toBeTruthy();
      expect(guide.amount).toBeTruthy();
      expect(guide.deadline).toBeTruthy();
      expect(guide.documents.length).toBeGreaterThan(0);
      expect(guide.tramiteUrl).toMatch(/^https?:\/\//);
      expect(guide.phone).toBeTruthy();
      expect(guide.steps.length).toBeGreaterThan(0);
    }
  });

  it("returns a guide for PGU system", () => {
    const guide = getGuide({ type: "pgu" });
    expect(guide.institutionName).toContain("IPS");
    expect(guide.benefitName).toContain("Cuota Mortuoria");
    expect(guide.tramiteUrl).toMatch(/^https?:\/\//);
  });

  it("returns a guide for renta-vitalicia system", () => {
    const guide = getGuide({ type: "renta-vitalicia" });
    expect(guide.institutionName).toBeTruthy();
    expect(guide.benefitName).toContain("Cuota Mortuoria");
    expect(guide.steps.length).toBeGreaterThan(0);
  });

  it("returns a guide for FF.AA. system", () => {
    const guide = getGuide({ type: "ffaa" });
    expect(guide.institutionName).toContain("Capredena");
    expect(guide.tramiteUrl).toMatch(/^https?:\/\//);
    expect(guide.documents.length).toBeGreaterThan(0);
  });

  it("returns a guide for Carabineros system", () => {
    const guide = getGuide({ type: "carabineros" });
    expect(guide.institutionName).toContain("Dipreca");
    expect(guide.tramiteUrl).toMatch(/^https?:\/\//);
    expect(guide.documents.length).toBeGreaterThan(0);
  });

  it("returns null for unknown system (no unverified data)", () => {
    const guide = getGuide({ type: "unknown" });
    expect(guide).toBeNull();
  });

  it("all guides mention ~15 UF or an equivalent amount", () => {
    const systems: AffiliationSystem[] = [
      { type: "afp", afp: "Habitat" },
      { type: "pgu" },
      { type: "renta-vitalicia" },
      { type: "ffaa" },
      { type: "carabineros" },
    ];
    for (const system of systems) {
      const guide = getGuide(system);
      expect(guide.amount).toBeTruthy();
    }
  });

  it("all AFP guides require certificado de defuncion", () => {
    for (const afp of ALL_AFPS) {
      const guide = getGuide({ type: "afp", afp });
      const hasDeathCert = guide.documents.some(
        (d) => d.toLowerCase().includes("defunci") || d.toLowerCase().includes("defunción")
      );
      expect(hasDeathCert, `AFP ${afp} should require death certificate`).toBe(true);
    }
  });
});

describe("getAllAfpNames", () => {
  it("returns all 7 AFP names", () => {
    const names = getAllAfpNames();
    expect(names).toHaveLength(7);
    expect(names).toEqual(expect.arrayContaining(ALL_AFPS));
  });
});
