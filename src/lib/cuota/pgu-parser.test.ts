import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePguResponse } from "./pgu-parser";

const fixture = (name: string) =>
  readFileSync(join(__dirname, "__fixtures__", name), "utf-8");

describe("parsePguResponse", () => {
  it("detects PGU beneficiary", () => {
    const result = parsePguResponse(fixture("pgu-found.html"));
    expect(result.found).toBe(true);
    expect(result.isPguBeneficiary).toBe(true);
  });

  it("detects non-beneficiary", () => {
    const result = parsePguResponse(fixture("pgu-not-found.html"));
    expect(result.found).toBe(true);
    expect(result.isPguBeneficiary).toBe(false);
  });

  it("returns found=false on error page", () => {
    const result = parsePguResponse(fixture("pgu-error.html"));
    expect(result.found).toBe(false);
    expect(result.isPguBeneficiary).toBe(false);
  });

  it("handles empty string", () => {
    const result = parsePguResponse("");
    expect(result.found).toBe(false);
    expect(result.isPguBeneficiary).toBe(false);
  });

  it("handles garbage HTML", () => {
    const result = parsePguResponse("<div>Random content</div>");
    expect(result.found).toBe(false);
    expect(result.isPguBeneficiary).toBe(false);
  });

  it("populates raw field for debugging", () => {
    const result = parsePguResponse(fixture("pgu-found.html"));
    expect(result.raw).toBeTruthy();
  });
});
