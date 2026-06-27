import { describe, it, expect } from "vitest";
import { escalateSupportTicketUseCase } from "./escalate-support-ticket.use-case";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type {
  SupportTicket,
  EscalateSupportTicketInput,
} from "@/features/support/domain/support-ticket.types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
  return {
    id:                  "t1",
    clientId:            "c1",
    projectId:           "p1",
    title:               "Ticket",
    description:         null,
    notes:               null,
    reportedBy:          null,
    source:              "manual",
    category:            "bug_report",
    status:              "triage",
    priority:            "medium",
    createdAt:           "2026-01-01T00:00:00.000Z",
    updatedAt:           "2026-01-01T00:00:00.000Z",
    resolvedAt:          null,
    escalatedWorkItemId: null,
    escalatedAt:         null,
    escalatedBy:         null,
    ...overrides,
  };
}

const ESCALATION_INPUT: EscalateSupportTicketInput = {
  escalatedWorkItemId: "wi-123",
  escalatedAt:         "2026-06-27T12:00:00.000Z",
  escalatedBy:         "admin@example.com",
};

// ── Fake repository ───────────────────────────────────────────────────────────

class FakeSupportTicketRepository implements Pick<SupportTicketRepository, "findById" | "escalate"> {
  private ticket: SupportTicket | null;
  escalateCalls: { id: string; input: EscalateSupportTicketInput }[] = [];

  constructor(ticket: SupportTicket | null) {
    this.ticket = ticket;
  }

  async findById(): Promise<SupportTicket | null> {
    return this.ticket;
  }

  async escalate(id: string, input: EscalateSupportTicketInput): Promise<void> {
    this.escalateCalls.push({ id, input });
  }

  // Unused interface methods — satisfy Pick type via cast in tests
  async create(): Promise<{ id: string }>                                     { return { id: "" }; }
  async findAll(): Promise<SupportTicket[]>                                   { return []; }
  async findByClientId(): Promise<SupportTicket[]>                            { return []; }
  async findByEscalatedWorkItemId(): Promise<SupportTicket | null>            { return null; }
  async updateStatus(): Promise<void>                                         {}
  async updateDetails(): Promise<void>                                        {}
}

// ── Terminal status guard ─────────────────────────────────────────────────────

describe("escalateSupportTicketUseCase — terminal status guard", () => {
  it("resolved ticket → returns error, does not call repository.escalate", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "resolved" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/resuelto|cerrado|cancelado/i);
    }
    expect(repo.escalateCalls).toHaveLength(0);
  });

  it("closed ticket → returns error, does not call repository.escalate", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "closed" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(false);
    expect(repo.escalateCalls).toHaveLength(0);
  });

  it("cancelled ticket → returns error, does not call repository.escalate", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "cancelled" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(false);
    expect(repo.escalateCalls).toHaveLength(0);
  });

  it("triage ticket → escalates successfully", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "triage" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(true);
    expect(repo.escalateCalls).toHaveLength(1);
    expect(repo.escalateCalls[0].input.escalatedWorkItemId).toBe("wi-123");
  });

  it("new ticket → escalates successfully", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(true);
    expect(repo.escalateCalls).toHaveLength(1);
  });

  it("waiting_internal ticket → escalates successfully", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "waiting_internal" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(true);
    expect(repo.escalateCalls).toHaveLength(1);
  });

  it("action_required ticket → escalates successfully", async () => {
    const repo = new FakeSupportTicketRepository(makeTicket({ status: "action_required" }));

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(true);
    expect(repo.escalateCalls).toHaveLength(1);
  });
});

// ── Not-found guard ───────────────────────────────────────────────────────────

describe("escalateSupportTicketUseCase — ticket not found", () => {
  it("ticket not found → returns error, does not call escalate", async () => {
    const repo = new FakeSupportTicketRepository(null);

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, repo as unknown as SupportTicketRepository);

    expect(result.ok).toBe(false);
    expect(repo.escalateCalls).toHaveLength(0);
  });
});

// ── Repository failure ────────────────────────────────────────────────────────

describe("escalateSupportTicketUseCase — repository failure", () => {
  it("repository.escalate throws → returns ok:false", async () => {
    const failingRepo = {
      ...new FakeSupportTicketRepository(makeTicket({ status: "triage" })),
      escalate: async () => { throw new Error("DB error"); },
    } as unknown as SupportTicketRepository;

    const result = await escalateSupportTicketUseCase("t1", ESCALATION_INPUT, failingRepo);

    expect(result.ok).toBe(false);
  });
});
