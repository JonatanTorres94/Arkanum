import { describe, it, expect, beforeEach } from "vitest";
import { closeTicketAfterDevelopmentCancellationUseCase } from "./close-ticket-after-development-cancellation.use-case";
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
    status: "escalated_to_development",
    priority: "low",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    resolvedAt: null,
    escalatedWorkItemId: "wi1",
    escalatedAt: "2026-01-01T00:00:00.000Z",
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
    if (this.ticket) {
      this.ticket = { ...this.ticket, status: input.status, resolvedAt: input.resolvedAt };
    }
  }

  // Unused stub methods.
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

const TICKET_ID    = "t1";
const AUTHOR       = "agent@arkanum.com";
const EXPECTED_NOTE = "Soporte cerró el ticket después de la cancelación del trabajo de Desarrollo.";

describe("closeTicketAfterDevelopmentCancellationUseCase", () => {
  let ticketRepo: FakeSupportTicketRepository;
  let noteRepo:   FakeSupportTicketNoteRepository;

  beforeEach(() => {
    noteRepo = new FakeSupportTicketNoteRepository();
  });

  // ── Ticket not found ──────────────────────────────────────────────────────

  it("returns ok:false when ticket does not exist", async () => {
    ticketRepo = new FakeSupportTicketRepository(null);
    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Ticket no encontrado.");
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  // ── Terminal ticket rejection ─────────────────────────────────────────────

  it("returns ok:false for a resolved ticket", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "resolved" }));
    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );
    expect(result.ok).toBe(false);
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("returns ok:false for a cancelled ticket", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "cancelled" }));
    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );
    expect(result.ok).toBe(false);
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("returns ok:true without calling updateStatus when ticket is already closed", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "closed" }));
    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );
    expect(result.ok).toBe(true);
    expect(ticketRepo.updateStatusCalls).toHaveLength(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("does not add a second note on repeated calls (idempotent)", async () => {
    const ticket = makeTicket({ status: "escalated_to_development" });
    ticketRepo   = new FakeSupportTicketRepository(ticket);

    await closeTicketAfterDevelopmentCancellationUseCase(TICKET_ID, AUTHOR, ticketRepo, noteRepo);
    // Second call sees ticket.status === "closed" (fake updates in-memory record).
    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );

    expect(result.ok).toBe(true);
    expect(noteRepo.createdNotes).toHaveLength(1);
  });

  // ── Successful closure ────────────────────────────────────────────────────

  it("calls updateStatus with status:closed and resolvedAt:null", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );

    expect(result.ok).toBe(true);
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);

    const call = ticketRepo.updateStatusCalls[0];
    expect(call.id).toBe(TICKET_ID);
    expect(call.input.status).toBe("closed");
    expect(call.input.resolvedAt).toBeNull();
  });

  it("creates the exact closure note", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    await closeTicketAfterDevelopmentCancellationUseCase(TICKET_ID, AUTHOR, ticketRepo, noteRepo);

    expect(noteRepo.createdNotes).toHaveLength(1);
    expect(noteRepo.createdNotes[0].content).toBe(EXPECTED_NOTE);
    expect(noteRepo.createdNotes[0].ticketId).toBe(TICKET_ID);
    expect(noteRepo.createdNotes[0].createdBy).toBe(AUTHOR);
  });

  it("passes null authorEmail to the note repository when given", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    await closeTicketAfterDevelopmentCancellationUseCase(TICKET_ID, null, ticketRepo, noteRepo);
    expect(noteRepo.createdNotes[0].createdBy).toBeNull();
  });

  // ── Failure paths ─────────────────────────────────────────────────────────

  it("returns ok:false and does not attempt note creation when updateStatus throws", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    ticketRepo.shouldThrowOnUpdate = true;

    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );

    expect(result.ok).toBe(false);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("returns ok:true with a warning when updateStatus succeeds but note creation throws", async () => {
    ticketRepo = new FakeSupportTicketRepository(makeTicket({ status: "new" }));
    noteRepo.shouldThrowOnCreate = true;

    const result = await closeTicketAfterDevelopmentCancellationUseCase(
      TICKET_ID, AUTHOR, ticketRepo, noteRepo
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.warning).toBe("string");
      expect(result.warning!.length).toBeGreaterThan(0);
    }
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);
    expect(ticketRepo.updateStatusCalls[0].input.status).toBe("closed");
  });
});
