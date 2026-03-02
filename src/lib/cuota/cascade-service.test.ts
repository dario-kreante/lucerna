import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { consultaCuota } from "./cascade-service";
import type { SpensionesClient, ConsultaRequest } from "./types";

const fixture = (name: string) =>
  readFileSync(join(__dirname, "__fixtures__", name), "utf-8");

/** Creates a mock SpensionesClient with configurable responses. */
function mockClient(overrides: Partial<SpensionesClient> = {}): SpensionesClient {
  return {
    queryAfp: vi.fn().mockResolvedValue(""),
    queryPgu: vi.fn().mockResolvedValue(""),
    ...overrides,
  };
}

describe("consultaCuota", () => {
  it("returns AFP guide when AFP query finds affiliation", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("afp");
    if (result.data?.system.type === "afp") {
      expect(result.data.system.afp).toBe("Habitat");
    }
    expect(result.data?.guide.institutionName).toContain("Habitat");
    // Should NOT have called PGU since AFP was found
    expect(client.queryPgu).not.toHaveBeenCalled();
  });

  it("cascades to PGU when AFP returns no affiliation", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-not-found.html")),
      queryPgu: vi.fn().mockResolvedValue(fixture("pgu-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5", nombre: "Juan Pérez", email: "j@e.cl" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("pgu");
    expect(result.data?.guide.institutionName).toContain("IPS");
    expect(client.queryPgu).toHaveBeenCalledWith({
      rut: "123456785",
      nombre: "Juan Pérez",
      email: "j@e.cl",
    });
  });

  it("returns needsMoreInfo when both AFP and PGU return nothing", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-not-found.html")),
      queryPgu: vi.fn().mockResolvedValue(fixture("pgu-not-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5", nombre: "Test", email: "t@t.cl" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.needsMoreInfo).toBe(true);
    expect(result.data?.system.type).toBe("unknown");
    expect(result.data?.guide).toBeUndefined();
  });

  it("skips PGU if nombre/email not provided and returns needsMoreInfo", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-not-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.needsMoreInfo).toBe(true);
    expect(result.data?.system.type).toBe("unknown");
    expect(result.data?.guide).toBeUndefined();
    expect(client.queryPgu).not.toHaveBeenCalled();
  });

  it("returns manual selection guide for renta-vitalicia", async () => {
    const client = mockClient();
    const req: ConsultaRequest = { rut: "12.345.678-5", manualSelection: "renta-vitalicia" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("renta-vitalicia");
    // Should NOT call any API
    expect(client.queryAfp).not.toHaveBeenCalled();
    expect(client.queryPgu).not.toHaveBeenCalled();
  });

  it("returns manual selection guide for ffaa", async () => {
    const client = mockClient();
    const req: ConsultaRequest = { rut: "12.345.678-5", manualSelection: "ffaa" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("ffaa");
    expect(client.queryAfp).not.toHaveBeenCalled();
  });

  it("returns manual selection guide for carabineros", async () => {
    const client = mockClient();
    const req: ConsultaRequest = { rut: "12.345.678-5", manualSelection: "carabineros" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("carabineros");
  });

  it("returns AFP guide for manual AFP selection", async () => {
    const client = mockClient();
    const req: ConsultaRequest = { rut: "12.345.678-5", manualSelection: "afp:Habitat" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("afp");
    if (result.data?.system.type === "afp") {
      expect(result.data.system.afp).toBe("Habitat");
    }
    expect(result.data?.guide.institutionName).toContain("Habitat");
    expect(client.queryAfp).not.toHaveBeenCalled();
  });

  it("returns correct guide for each AFP manual selection", async () => {
    const afps = ["Capital", "Cuprum", "Habitat", "Modelo", "PlanVital", "ProVida", "Uno"] as const;
    for (const afp of afps) {
      const client = mockClient();
      const req: ConsultaRequest = { rut: "12.345.678-5", manualSelection: `afp:${afp}` };
      const result = await consultaCuota(req, client);
      expect(result.data?.system).toEqual({ type: "afp", afp });
    }
  });

  it("handles 'help' manual selection as needsMoreInfo without guide", async () => {
    const client = mockClient();
    const req: ConsultaRequest = { rut: "12.345.678-5", manualSelection: "help" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.needsMoreInfo).toBe(true);
    expect(result.data?.system.type).toBe("unknown");
    expect(result.data?.guide).toBeUndefined();
    // Should NOT call any API
    expect(client.queryAfp).not.toHaveBeenCalled();
  });

  it("gracefully handles AFP network error and cascades to PGU", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockRejectedValue(new Error("Network error")),
      queryPgu: vi.fn().mockResolvedValue(fixture("pgu-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5", nombre: "Test", email: "t@t.cl" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.data?.system.type).toBe("pgu");
  });

  it("gracefully handles both AFP and PGU network errors with needsMoreInfo", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockRejectedValue(new Error("Network error")),
      queryPgu: vi.fn().mockRejectedValue(new Error("Network error")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5", nombre: "Test", email: "t@t.cl" };
    const result = await consultaCuota(req, client);

    expect(result.ok).toBe(true);
    expect(result.needsMoreInfo).toBe(true);
    expect(result.data?.system.type).toBe("unknown");
    expect(result.data?.guide).toBeUndefined();
  });

  it("cleans the RUT before passing to client", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5" };
    await consultaCuota(req, client);

    expect(client.queryAfp).toHaveBeenCalledWith("123456785");
  });

  it("populates timestamp in result", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5" };
    const result = await consultaCuota(req, client);

    expect(result.data?.timestamp).toBeTruthy();
    // Should be a valid ISO date
    expect(new Date(result.data!.timestamp).getTime()).not.toBeNaN();
  });

  it("includes cleaned RUT in result", async () => {
    const client = mockClient({
      queryAfp: vi.fn().mockResolvedValue(fixture("afp-found.html")),
    });
    const req: ConsultaRequest = { rut: "12.345.678-5" };
    const result = await consultaCuota(req, client);

    expect(result.data?.rut).toBe("123456785");
  });
});
