import { describe, it, expect, vi } from "vitest";
import { handleConsultaCuota } from "../../lib/cuota/consulta-handler";

describe("handleConsultaCuota", () => {
  it("returns 400 when RUT is missing", async () => {
    const result = await handleConsultaCuota({});
    expect(result.status).toBe(400);
    expect(result.body.error).toContain("RUT");
  });

  it("returns 400 when RUT is invalid", async () => {
    const result = await handleConsultaCuota({ rut: "12.345.678-0" });
    expect(result.status).toBe(400);
    expect(result.body.error).toContain("válido");
  });

  it("returns 400 when RUT is too short", async () => {
    const result = await handleConsultaCuota({ rut: "1" });
    expect(result.status).toBe(400);
  });

  it("returns 200 with needsMoreInfo for valid RUT when no affiliation found", async () => {
    // Empty responses → cascade falls to unknown → needsMoreInfo
    const result = await handleConsultaCuota(
      { rut: "12.345.678-5" },
      {
        queryAfp: vi.fn().mockResolvedValue(""),
        queryPgu: vi.fn().mockResolvedValue(""),
      }
    );
    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.needsMoreInfo).toBe(true);
    expect(result.body.data).toBeDefined();
    expect(result.body.data?.guide).toBeUndefined();
  });

  it("returns 200 with manual selection and no API calls", async () => {
    const mockClient = {
      queryAfp: vi.fn().mockResolvedValue(""),
      queryPgu: vi.fn().mockResolvedValue(""),
    };
    const result = await handleConsultaCuota(
      { rut: "12.345.678-5", manualSelection: "ffaa" },
      mockClient
    );
    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.data?.system.type).toBe("ffaa");
    expect(mockClient.queryAfp).not.toHaveBeenCalled();
  });

  it("handles unexpected errors gracefully with needsMoreInfo", async () => {
    const result = await handleConsultaCuota(
      { rut: "12.345.678-5" },
      {
        queryAfp: vi.fn().mockImplementation(() => {
          throw new Error("unexpected crash");
        }),
        queryPgu: vi.fn().mockResolvedValue(""),
      }
    );
    // Should still return 200 with needsMoreInfo (cascade handles errors)
    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.needsMoreInfo).toBe(true);
  });
});
