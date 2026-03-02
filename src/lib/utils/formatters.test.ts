import { describe, it, expect } from "vitest";
import { validateRut, formatRut } from "./formatters";

describe("validateRut", () => {
  it("validates a correct RUT", () => {
    expect(validateRut("12.345.678-5")).toBe(true);
  });
});
