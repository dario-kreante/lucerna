import { describe, it, expect } from "vitest";
import { cleanRut, validateRut, formatRut } from "./formatters";

describe("cleanRut", () => {
  it("strips dots and dash from formatted RUT", () => {
    expect(cleanRut("12.345.678-5")).toBe("123456785");
  });

  it("strips whitespace", () => {
    expect(cleanRut(" 12.345.678-5 ")).toBe("123456785");
  });

  it("normalizes lowercase k to uppercase K", () => {
    expect(cleanRut("12.345.670-k")).toBe("12345670K");
  });

  it("passes through already-clean RUT", () => {
    expect(cleanRut("123456785")).toBe("123456785");
  });

  it("returns empty string for empty input", () => {
    expect(cleanRut("")).toBe("");
  });

  it("strips non-numeric non-K characters", () => {
    expect(cleanRut("12abc345K")).toBe("12345K");
  });
});

describe("validateRut", () => {
  it("validates a correct RUT with dots and dash", () => {
    expect(validateRut("12.345.678-5")).toBe(true);
  });

  it("validates a correct RUT without formatting", () => {
    expect(validateRut("123456785")).toBe(true);
  });

  it("rejects an incorrect check digit", () => {
    expect(validateRut("12.345.678-0")).toBe(false);
  });

  it("validates RUT ending in K (12.345.670-K)", () => {
    expect(validateRut("12.345.670-K")).toBe(true);
  });

  it("validates RUT ending in lowercase k", () => {
    expect(validateRut("12.345.670-k")).toBe(true);
  });

  it("validates a real RUT (16.998.654-1)", () => {
    expect(validateRut("16.998.654-1")).toBe(true);
    expect(validateRut("169986541")).toBe(true);
  });

  it("rejects too-short input", () => {
    expect(validateRut("1")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateRut("")).toBe(false);
  });
});

describe("formatRut", () => {
  it("formats a clean RUT with dots and dash", () => {
    expect(formatRut("123456785")).toBe("12.345.678-5");
  });

  it("formats a short RUT correctly", () => {
    expect(formatRut("76543210")).toBe("7.654.321-0");
  });

  it("returns single char as-is", () => {
    expect(formatRut("1")).toBe("1");
  });
});
