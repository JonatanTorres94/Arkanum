import { describe, it, expect } from "vitest";
import { deriveLeadFollowUpState } from "./lead-follow-up-state";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TODAY = "2026-06-28";
const YESTERDAY = "2026-06-27";
const TOMORROW = "2026-06-29";
const LAST_WEEK = "2026-06-21";
const NEXT_WEEK = "2026-07-05";

function make(followUpDate: string | null, nextAction: string | null = null) {
  return { followUpDate, nextAction };
}

// ── missing ───────────────────────────────────────────────────────────────────

describe("missing", () => {
  it("returns missing when followUpDate and nextAction are null", () => {
    expect(deriveLeadFollowUpState(make(null), TODAY)).toBe("missing");
  });

  it("returns missing when followUpDate is empty and nextAction is null", () => {
    // An empty string from an uncleared date input should behave as missing.
    expect(deriveLeadFollowUpState(make(""), TODAY)).toBe("missing");
  });
});

// ── overdue ───────────────────────────────────────────────────────────────────

describe("overdue", () => {
  it("returns overdue for yesterday", () => {
    expect(deriveLeadFollowUpState(make(YESTERDAY), TODAY)).toBe("overdue");
  });

  it("returns overdue for a date last week", () => {
    expect(deriveLeadFollowUpState(make(LAST_WEEK), TODAY)).toBe("overdue");
  });

  it("returns overdue for a date in a different month", () => {
    expect(deriveLeadFollowUpState(make("2026-05-01"), TODAY)).toBe("overdue");
  });

  it("returns overdue for a date in a different year", () => {
    expect(deriveLeadFollowUpState(make("2025-12-31"), TODAY)).toBe("overdue");
  });
});

// ── today ─────────────────────────────────────────────────────────────────────

describe("today", () => {
  it("returns today when followUpDate equals today", () => {
    expect(deriveLeadFollowUpState(make(TODAY), TODAY)).toBe("today");
  });

  it("returns today for any date passed as today", () => {
    expect(deriveLeadFollowUpState(make("2026-12-31"), "2026-12-31")).toBe("today");
  });
});

// ── scheduled ─────────────────────────────────────────────────────────────────

describe("scheduled", () => {
  it("returns scheduled for tomorrow", () => {
    expect(deriveLeadFollowUpState(make(TOMORROW), TODAY)).toBe("scheduled");
  });

  it("returns scheduled for a date next week", () => {
    expect(deriveLeadFollowUpState(make(NEXT_WEEK), TODAY)).toBe("scheduled");
  });

  it("returns scheduled for a date in the next month", () => {
    expect(deriveLeadFollowUpState(make("2026-07-15"), TODAY)).toBe("scheduled");
  });

  it("returns scheduled for a date in the next year", () => {
    expect(deriveLeadFollowUpState(make("2027-01-01"), TODAY)).toBe("scheduled");
  });

  it("returns scheduled when nextAction exists without followUpDate", () => {
    expect(deriveLeadFollowUpState(make(null, "Llamar para coordinar reunión"), TODAY)).toBe("scheduled");
  });
});
