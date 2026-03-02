import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseAfpResponse } from "./afp-parser";

const fixture = (name: string) =>
  readFileSync(join(__dirname, "__fixtures__", name), "utf-8");

describe("parseAfpResponse", () => {
  it("extracts AFP Habitat when person is affiliated", () => {
    const result = parseAfpResponse(fixture("afp-found.html"));
    expect(result.found).toBe(true);
    expect(result.afp).toBe("Habitat");
  });

  it("extracts AFP ProVida from variant fixture", () => {
    const result = parseAfpResponse(fixture("afp-found-provida.html"));
    expect(result.found).toBe(true);
    expect(result.afp).toBe("ProVida");
  });

  it("returns found=false when no AFP affiliation", () => {
    const result = parseAfpResponse(fixture("afp-not-found.html"));
    expect(result.found).toBe(false);
    expect(result.afp).toBeNull();
  });

  it("returns found=false for error page", () => {
    const result = parseAfpResponse(fixture("afp-error.html"));
    expect(result.found).toBe(false);
    expect(result.afp).toBeNull();
  });

  it("returns found=false for empty string", () => {
    const result = parseAfpResponse("");
    expect(result.found).toBe(false);
    expect(result.afp).toBeNull();
  });

  it("returns found=false for garbage HTML", () => {
    const result = parseAfpResponse("<html><body>Random</body></html>");
    expect(result.found).toBe(false);
    expect(result.afp).toBeNull();
  });

  it("normalizes AFP name case (AFP HABITAT → Habitat)", () => {
    const html = fixture("afp-found.html").replace("AFP Habitat", "AFP HABITAT");
    const result = parseAfpResponse(html);
    expect(result.found).toBe(true);
    expect(result.afp).toBe("Habitat");
  });

  it("recognizes all 7 AFP names", () => {
    const names = ["Capital", "Cuprum", "Habitat", "Modelo", "PlanVital", "ProVida", "Uno"];
    for (const name of names) {
      const html = fixture("afp-found.html").replace("AFP Habitat", `AFP ${name}`);
      const result = parseAfpResponse(html);
      expect(result.found).toBe(true);
      expect(result.afp).toBe(name);
    }
  });

  it("handles Plan Vital with space", () => {
    const html = fixture("afp-found.html").replace("AFP Habitat", "AFP Plan Vital");
    const result = parseAfpResponse(html);
    expect(result.found).toBe(true);
    expect(result.afp).toBe("PlanVital");
  });

  it("extracts correct AFP from real spensiones.cl response (not from AFP list)", () => {
    const result = parseAfpResponse(fixture("afp-found-real.html"));
    expect(result.found).toBe(true);
    expect(result.afp).toBe("ProVida");
    expect(result.hasAfc).toBe(true);
  });

  it("extracts AFP Capital from real format even with all AFPs listed", () => {
    const html = fixture("afp-found-real.html").replace(
      "incorporado(a) a AFP PROVIDA",
      "incorporado(a) a AFP CAPITAL"
    );
    const result = parseAfpResponse(html);
    expect(result.found).toBe(true);
    expect(result.afp).toBe("Capital");
  });

  it("extracts AFP PlanVital from real format (space variant)", () => {
    const html = fixture("afp-found-real.html").replace(
      "incorporado(a) a AFP PROVIDA",
      "incorporado(a) a AFP PLAN VITAL"
    );
    const result = parseAfpResponse(html);
    expect(result.found).toBe(true);
    expect(result.afp).toBe("PlanVital");
  });

  it("populates raw field for debugging", () => {
    const result = parseAfpResponse(fixture("afp-found.html"));
    expect(result.raw).toBeTruthy();
    expect(typeof result.raw).toBe("string");
  });
});
