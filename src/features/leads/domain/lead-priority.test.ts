import { describe, it, expect } from "vitest";
import { deriveLeadPriority } from "./lead-priority";

// ── Fixtures ──────────────────────────────────────────────────────────────────

type Input = Parameters<typeof deriveLeadPriority>[0];

function make(overrides: Partial<Input> = {}): Input {
  return {
    urgency:          "Estoy explorando opciones",
    budget:           "No tenemos cifra definida aún",
    weeklyHoursLost:  null,
    ...overrides,
  };
}

// ── Alta ──────────────────────────────────────────────────────────────────────

describe("alta priority", () => {
  it("max urgency + high budget → alta", () => {
    expect(
      deriveLeadPriority(make({
        urgency: "Lo necesitamos cuanto antes",
        budget:  "Más de $5.000.000",
      }))
    ).toBe("alta");
  });

  it("max urgency + medium-high budget → alta", () => {
    expect(
      deriveLeadPriority(make({
        urgency: "Lo necesitamos cuanto antes",
        budget:  "$1.500.000 a $5.000.000",
      }))
    ).toBe("alta");
  });

  it("max urgency + medium budget + max hours → alta", () => {
    expect(
      deriveLeadPriority(make({
        urgency:         "Lo necesitamos cuanto antes",
        budget:          "$500.000 a $1.500.000",
        weeklyHoursLost: "Más de 20 horas",
      }))
    ).toBe("alta");
  });

  it("high urgency + high budget + any hours → alta", () => {
    expect(
      deriveLeadPriority(make({
        urgency:         "Este mes",
        budget:          "Más de $5.000.000",
        weeklyHoursLost: "10 a 20 horas",
      }))
    ).toBe("alta");
  });

  it("high urgency + medium-high budget + max hours → alta", () => {
    expect(
      deriveLeadPriority(make({
        urgency:         "Este mes",
        budget:          "$1.500.000 a $5.000.000",
        weeklyHoursLost: "Más de 20 horas",
      }))
    ).toBe("alta");
  });
});

// ── Media ─────────────────────────────────────────────────────────────────────

describe("media priority", () => {
  it("high urgency + no budget → media", () => {
    expect(
      deriveLeadPriority(make({
        urgency: "Este mes",
        budget:  "No tenemos cifra definida aún",
      }))
    ).toBe("media");
  });

  it("medium urgency + medium budget → media", () => {
    expect(
      deriveLeadPriority(make({
        urgency: "En los próximos 3 meses",
        budget:  "$500.000 a $1.500.000",
      }))
    ).toBe("media");
  });

  it("exploring + high budget → media", () => {
    expect(
      deriveLeadPriority(make({
        urgency: "Estoy explorando opciones",
        budget:  "Más de $5.000.000",
      }))
    ).toBe("media");
  });

  it("medium urgency + no budget + max hours → media", () => {
    expect(
      deriveLeadPriority(make({
        urgency:         "En los próximos 3 meses",
        budget:          "No tenemos cifra definida aún",
        weeklyHoursLost: "Más de 20 horas",
      }))
    ).toBe("media");
  });
});

// ── Baja ──────────────────────────────────────────────────────────────────────

describe("baja priority", () => {
  it("exploring + undefined budget → baja", () => {
    expect(
      deriveLeadPriority(make())
    ).toBe("baja");
  });

  it("exploring + low budget → baja", () => {
    expect(
      deriveLeadPriority(make({
        urgency: "Estoy explorando opciones",
        budget:  "Menos de $500.000",
      }))
    ).toBe("baja");
  });

  it("medium urgency + no budget + no hours → baja", () => {
    expect(
      deriveLeadPriority(make({
        urgency:         "En los próximos 3 meses",
        budget:          "No tenemos cifra definida aún",
        weeklyHoursLost: null,
      }))
    ).toBe("baja");
  });

  it("exploring + medium budget + no hours → baja", () => {
    expect(
      deriveLeadPriority(make({
        urgency:         "Estoy explorando opciones",
        budget:          "$500.000 a $1.500.000",
        weeklyHoursLost: null,
      }))
    ).toBe("baja");
  });
});
