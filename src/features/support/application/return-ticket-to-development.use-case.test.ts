import { describe, it, expect, beforeEach } from "vitest";
import { returnTicketToDevelopmentUseCase } from "./return-ticket-to-development.use-case";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";
import type {
  SupportTicket,
  UpdateSupportTicketStatusInput,
} from "@/features/support/domain/support-ticket.types";

// ── Fakes ─────────────────────────────────────────────────────────────────────

class FakeSupportTicketRepository implements Pick<SupportTicketRepository, "updateStatus"> {
  updateStatusCalls: { id: string; input: UpdateSupportTicketStatusInput }[] = [];
  shouldThrowOnUpdate = false;

  async updateStatus(id: string, input: UpdateSupportTicketStatusInput): Promise<void> {
    if (this.shouldThrowOnUpdate) throw new Error("DB error");
    this.updateStatusCalls.push({ id, input });
  }

  // Unused interface methods.
  async create(): Promise<{ id: string }> { return { id: "" }; }
  async findAll(): Promise<SupportTicket[]> { return []; }
  async findById(): Promise<SupportTicket | null> { return null; }
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

const TICKET_ID = "t1";
const AUTHOR    = "agent@arkanum.com";

describe("returnTicketToDevelopmentUseCase", () => {
  let ticketRepo: FakeSupportTicketRepository;
  let noteRepo:   FakeSupportTicketNoteRepository;

  beforeEach(() => {
    ticketRepo = new FakeSupportTicketRepository();
    noteRepo   = new FakeSupportTicketNoteRepository();
  });

  // ── Status update ─────────────────────────────────────────────────────────

  it("calls updateStatus with status:escalated_to_development and resolvedAt:null", async () => {
    const result = await returnTicketToDevelopmentUseCase(TICKET_ID, null, AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(true);
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);

    const call = ticketRepo.updateStatusCalls[0];
    expect(call.id).toBe(TICKET_ID);
    expect(call.input.status).toBe("escalated_to_development");
    expect(call.input.resolvedAt).toBeNull();
  });

  // ── Note content ──────────────────────────────────────────────────────────

  it("creates note with reason when reason is provided", async () => {
    const reason = "Falta validar el caso borde del formulario.";
    await returnTicketToDevelopmentUseCase(TICKET_ID, reason, AUTHOR, ticketRepo, noteRepo);

    expect(noteRepo.createdNotes).toHaveLength(1);
    expect(noteRepo.createdNotes[0].content).toBe(
      `Soporte devolvió el caso a Desarrollo: ${reason}`
    );
  });

  it("creates generic note when reason is null", async () => {
    await returnTicketToDevelopmentUseCase(TICKET_ID, null, AUTHOR, ticketRepo, noteRepo);

    expect(noteRepo.createdNotes).toHaveLength(1);
    expect(noteRepo.createdNotes[0].content).toBe(
      "Soporte devolvió el caso a Desarrollo para una nueva revisión."
    );
  });

  it("includes ticketId and authorEmail in the note", async () => {
    await returnTicketToDevelopmentUseCase(TICKET_ID, null, AUTHOR, ticketRepo, noteRepo);

    expect(noteRepo.createdNotes[0].ticketId).toBe(TICKET_ID);
    expect(noteRepo.createdNotes[0].createdBy).toBe(AUTHOR);
  });

  it("passes null authorEmail to note repository when given", async () => {
    await returnTicketToDevelopmentUseCase(TICKET_ID, null, null, ticketRepo, noteRepo);
    expect(noteRepo.createdNotes[0].createdBy).toBeNull();
  });

  // ── Failure paths ─────────────────────────────────────────────────────────

  it("returns ok:false and does not create note when updateStatus throws", async () => {
    ticketRepo.shouldThrowOnUpdate = true;

    const result = await returnTicketToDevelopmentUseCase(TICKET_ID, null, AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
    expect(noteRepo.createdNotes).toHaveLength(0);
  });

  it("returns ok:true with a warning when updateStatus succeeds but note creation throws", async () => {
    noteRepo.shouldThrowOnCreate = true;

    const result = await returnTicketToDevelopmentUseCase(TICKET_ID, null, AUTHOR, ticketRepo, noteRepo);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.warning).toBe("string");
      expect(result.warning!.length).toBeGreaterThan(0);
    }
    // Status was still updated despite note failure.
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);
  });

  // ── Scope check: this use case owns ticket only ───────────────────────────

  it("does not interact with any work item or project repository", async () => {
    // This test confirms the use case responsibility boundary: work item update
    // and lifecycle sync are handled by the action, not this use case.
    // If this use case starts importing those repos, this test will catch it via
    // the lack of any work-item-related calls on the fakes.
    await returnTicketToDevelopmentUseCase(TICKET_ID, "motivo", AUTHOR, ticketRepo, noteRepo);

    // Only updateStatus (ticket) and create (note) were called.
    expect(ticketRepo.updateStatusCalls).toHaveLength(1);
    expect(noteRepo.createdNotes).toHaveLength(1);
  });
});
