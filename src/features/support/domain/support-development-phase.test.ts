import { describe, it, expect } from "vitest";
import { deriveDevelopmentPhase } from "./support-development-phase";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";
import type { SupportTicket } from "./support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

// Open statuses that map to development_in_progress (excludes awaiting_support).
const OPEN_EXCLUDING_AWAITING = OPEN_WORK_ITEM_STATUSES.filter((s) => s !== "awaiting_support");

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
  return {
    id: "t1",
    clientId: "c1",
    projectId: null,
    title: "Ticket",
    description: null,
    notes: null,
    reportedBy: null,
    source: "manual",
    category: "bug_report",
    status: "new",
    priority: "low",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    resolvedAt: null,
    escalatedWorkItemId: null,
    escalatedAt: null,
    escalatedBy: null,
    ...overrides,
  };
}

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id: "wi1",
    projectId: "p1",
    title: "Work item",
    description: null,
    category: "task",
    status: "backlog",
    priority: "low",
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("deriveDevelopmentPhase", () => {
  describe("not_escalated", () => {
    it("returns not_escalated when ticket has no escalatedWorkItemId", () => {
      const ticket = makeTicket({ escalatedWorkItemId: null });
      expect(deriveDevelopmentPhase(ticket, null)).toBe("not_escalated");
    });

    it("returns not_escalated when ticket references a work item but workItem is null (missing reference)", () => {
      const ticket = makeTicket({ escalatedWorkItemId: "wi-missing" });
      expect(deriveDevelopmentPhase(ticket, null)).toBe("not_escalated");
    });
  });

  describe("support_action_required", () => {
    it("returns support_action_required when work item status is awaiting_support", () => {
      const ticket   = makeTicket({ escalatedWorkItemId: "wi1" });
      const workItem = makeWorkItem({ status: "awaiting_support" });
      expect(deriveDevelopmentPhase(ticket, workItem)).toBe("support_action_required");
    });
  });

  describe("development_in_progress — uses OPEN_WORK_ITEM_STATUSES minus awaiting_support", () => {
    for (const status of OPEN_EXCLUDING_AWAITING) {
      it(`returns development_in_progress when work item status is "${status}"`, () => {
        const ticket   = makeTicket({ escalatedWorkItemId: "wi1" });
        const workItem = makeWorkItem({ status });
        expect(deriveDevelopmentPhase(ticket, workItem)).toBe("development_in_progress");
      });
    }
  });

  describe("pending_support_validation", () => {
    it("returns pending_support_validation when work item is done", () => {
      const ticket   = makeTicket({ escalatedWorkItemId: "wi1" });
      const workItem = makeWorkItem({ status: "done" });
      expect(deriveDevelopmentPhase(ticket, workItem)).toBe("pending_support_validation");
    });
  });

  describe("development_cancelled", () => {
    it("returns development_cancelled when work item is cancelled", () => {
      const ticket   = makeTicket({ escalatedWorkItemId: "wi1" });
      const workItem = makeWorkItem({ status: "cancelled" });
      expect(deriveDevelopmentPhase(ticket, workItem)).toBe("development_cancelled");
    });
  });
});
