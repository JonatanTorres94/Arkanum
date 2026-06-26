import { describe, it, expect, beforeEach } from "vitest";
import { resolveTicketAfterDevelopmentUseCase } from "./resolve-ticket-after-development.use-case";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";
import type {
  SupportTicket,
  UpdateSupportTicketStatusInput,
} from "@/features/support/domain/support-ticket.types";

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

// ── Fakes ─────────────────────────────────────────────────────────────────────

class FakeSupportTicketRepository implements Pick<SupportTicketRepository, "findById" | "updateStatus"> {
  private ticket: SupportTicket | null;
  updateStatusCalls: { id: string; input: UpdateSupportTicketStatusInput }[] = [];
  shouldThrowOnUpdate = false;

  constructor(ticket: SupportTicket | null) {
    this.ticket = ticket;
  }

  async findById(): Promise<SupportTicket | null> {
    return this.ticket;
  }

  async updateStatus(id: string, input: UpdateSupportTicketStatusInput): Promise<void> {
    if (this.shouldThrowOnUpdate) throw new Error("DB error");
    this.updateStatusCalls.push({ id, input });
    // Reflect the update so a subsequent findById sees the new status.
    if (this.ticket) {
      this.ticket = { ...this.ticket, status: input.status, resolvedAt: input.resolvedAt };
    }
  }

  // Unused interface methods — only included to satisfy the type when passed as full interface.
  async create(): Promise<{ id: string }> { return { id: "" }; }
  async findAll(): Promise<SupportTicket[]> { return []; }
  async findByClientId(): Promise<SupportTicket[]> { return []; }
  async findByEscalatedWorkItemId(): Promise<SupportTicket | null> { return null; }
  async updateDetails(): Promise<void> {}
  async escalate(): Promise<void> {}
}

class FakeSupportTicketNoteRepository implements SupportTicketNoteRepository {
  createdNotes: { ticketId: string; content: string; createdBy: string | null }[] = [];
  shouldThrowOnCreate = false;

  async findByTicketId(): Promise<[]> { return []; }

  async create(ticketId: string, content: string, createdBy: string | null): Promise<{ id: string }> {
    if (this.shouldThrowOnCreate) throw new Error("DB error");
    this.createdNotes.push({ ticketId, content, createdBy });
    return { id: "note-1" };
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

const EXPECTED_NOTE = "Soporte validó el trabajo completado por Desarrollo y resolvió el ticket.";
const AUTHOR        = "agent@arkanum.com";

describe("resolveTicketAfterDevelopmentUseCase", () => {
  let ticketRepo: FakeSupportTicketRepository;
  let noteRepo:   FakeSupportTicketNoteRepository;

  beforeEach(() => {
    noteRepo = new FakeSupportTicketNoteRepository();
  });

  // ── Ticket not found ──────────────────────────────────────────────────────

  it("returns ok:false when ticket does not exist", async () => {
    ticketRepo = new FakeSupportTicketRepository(null);
    const result = await resolveTicketAfterDevelopmentUseCase("t-missing", AUTHOR, ticketRepo, noteRepo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Ticket no encontrado.");
  });

  // ── Terminal ticket rejection ─────────────────────────────────────────────

  it("returns ok:false for a closed ticket", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "closed" }));
    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);
    expect(result.ok).toBe(false);
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("returns ok:false for a cancelled ticket", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "cancelled" }));
    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);
    expect(result.ok).toBe(false);
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("returns ok:true without calling updateStatus when ticket is already resolved", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "resolved" }));
    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);
    expect(result.ok).toBe(true);
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("does not add a second note on repeated calls (idempotent)", async () => {
    const ticket = makeTicket({ status: "new" });
    ticketRepo   = new FakeSupportTicketRepository(ticket);

    await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);
    // Second call sees ticket.status === "resolved" (fake updates the in-memory record).
    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(true);
    // Only the first call created a note.
    expect(noteRepo.createdNotes).toHaveLength(1);
  });

  // ── Successful resolution ────────────────────────────────────────────────

  it("calls updateStatus with status:resolved and a non-null ISO resolvedAt", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(true);
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);

    const call = ticketRepo.updateStatusCalls[0];
    expect(call.input.status).toBe("resolved");
    expect(typeof call.input.resolvedAt).toBe("string");
    // Verify it's a valid ISO date — not just "truthy".
    expect(() => new Date(call.input.resolvedAt!)).not.toThrow();
    expect(new Date(call.input.resolvedAt!).toISOString()).toBe(call.input.resolvedAt);
  });

  it("creates the exact validation note content", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);

    expect(noteRepo.createdNotes).toHaveLength(1);
    expect(noteRepo.createdNotes[0].content).toBe(EXPECTED_NOTE);
    expect(noteRepo.createdNotes[0].ticketId).toBe("t1");
    expect(noteRepo.createdNotes[0].createdBy).toBe(AUTHOR);
  });

  it("passes null authorEmail to the note repository when given", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    await resolveTicketAfterDevelopmentUseCase("t1", null, ticketRepo, noteRepo);
    expect(noteRepo.createdNotes[0].createdBy).toBeNull();
  });

  // ── Failure paths ─────────────────────────────────────────────────────────

  it("returns ok:false and does not attempt note creation when updateStatus throws", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    ticketRepo.shouldThrowOnUpdate = true;

    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(false);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("returns ok:true with a warning when updateStatus succeeds but note creation throws", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    noteRepo.shouldThrowOnCreate = true;

    const result = await resolveTicketAfterDevelopmentUseCase("t1", AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.warning).toBe("string");
      expect(result.warning!.length).toBeGreaterThan(0);
    }
    // Ticket was still resolved despite note failure.
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);
  });
});
