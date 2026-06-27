import { describe, it, expect } from "vitest";
import { reconcileProjectLifecycleAfterOperationalChange } from "./reconcile-project-lifecycle.use-case";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { Project, UpdateProjectInput } from "@/features/projects/domain/project.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

let wiCounter = 0;

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id:          "p1",
    clientId:    "c1",
    name:        "Proyecto",
    description: null,
    status:      "in_development",
    startDate:   "2026-01-01",
    targetDate:  null,
    notes:       null,
    createdAt:   "2026-01-01T00:00:00.000Z",
    updatedAt:   "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  wiCounter++;
  return {
    id:          `wi${wiCounter}`,
    projectId:   "p1",
    title:       `Work Item ${wiCounter}`,
    description: null,
    category:    "task",
    status:      "in_progress",
    priority:    "medium",
    notes:       null,
    createdAt:   "2026-01-01T00:00:00.000Z",
    updatedAt:   "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ── Fake repositories ─────────────────────────────────────────────────────────

class FakeProjectRepository implements ProjectRepository {
  private project: Project | null;
  updateCalls: { id: string; input: UpdateProjectInput }[] = [];

  constructor(project: Project | null) {
    this.project = project;
  }

  async findById(): Promise<Project | null> {
    return this.project;
  }

  async update(id: string, input: UpdateProjectInput): Promise<void> {
    this.updateCalls.push({ id, input });
    if (this.project) this.project = { ...this.project, status: input.status, startDate: input.startDate };
  }

  async create(): Promise<{ id: string }>        { return { id: "" }; }
  async findAll(): Promise<Project[]>             { return []; }
  async findByClientId(): Promise<Project[]>      { return []; }
}

class FakeProjectWorkItemRepository implements ProjectWorkItemRepository {
  private items: ProjectWorkItem[];

  constructor(items: ProjectWorkItem[] = []) {
    this.items = items;
  }

  async findByProjectId(): Promise<ProjectWorkItem[]> { return this.items; }
  async findById(): Promise<ProjectWorkItem | null>    { return null; }
  async create(): Promise<{ id: string }>             { return { id: "" }; }
  async update(): Promise<void>                       {}
  async updateStatus(): Promise<void>                 {}
}

// ── Reopen / activate by rework reason ───────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — reopen by rework reason", () => {
  it("testing + new_work_item → in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "testing" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "new_work_item"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
  });

  it("deployed + support_ticket_escalated → in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "deployed" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_ticket_escalated"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
  });

  it("maintenance + support_intervention → in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "maintenance" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "awaiting_support" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_intervention"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
  });

  it("planning + new_work_item (backlog WI) → in_development, startDate initialized", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "new_work_item"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
    expect(projectRepo.updateCalls[0].input.startDate).not.toBeNull();
  });

  it("testing + reopen → startDate preserved", async () => {
    const projectRepo = new FakeProjectRepository(
      makeProject({ status: "testing", startDate: "2026-03-01" })
    );
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_intervention"
    );

    expect(projectRepo.updateCalls[0].input.startDate).toBe("2026-03-01");
  });

  it("deployed + reopen → startDate preserved", async () => {
    const projectRepo = new FakeProjectRepository(
      makeProject({ status: "deployed", startDate: "2025-10-01" })
    );
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_ticket_escalated"
    );

    expect(projectRepo.updateCalls[0].input.startDate).toBe("2025-10-01");
  });

  it("testing + work_item_status_changed → no reopen (not a rework reason)", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "testing" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "done" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("in_development + new_work_item → not reopened (already in development)", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "new_work_item"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });
});

// ── NO_AUTO_MUTATION statuses ─────────────────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — no auto-mutation", () => {
  const protectedStatuses = ["paused", "cancelled", "discovery"] as const;

  for (const status of protectedStatuses) {
    it(`${status} + any rework reason → no change`, async () => {
      const projectRepo = new FakeProjectRepository(makeProject({ status }));
      const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "in_progress" })]);

      const result = await reconcileProjectLifecycleAfterOperationalChange(
        "p1", projectRepo, workItemRepo, "new_work_item"
      );

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });
  }
});

// ── Rule 1: planning → in_development ────────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — Rule 1 (planning → in_development)", () => {
  it("planning + in_progress WI + work_item_status_changed → in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "in_progress" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
    expect(projectRepo.updateCalls[0].input.startDate).not.toBeNull();
  });

  it("planning + backlog WI only + work_item_status_changed → stays planning", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "planning" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "backlog" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("planning + in_progress + existing startDate → startDate preserved", async () => {
    const projectRepo = new FakeProjectRepository(
      makeProject({ status: "planning", startDate: "2026-05-01" })
    );
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "in_progress" })]);

    await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(projectRepo.updateCalls[0].input.startDate).toBe("2026-05-01");
  });
});

// ── Rule 2: → testing ────────────────────────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — Rule 2 (→ testing)", () => {
  it("in_development + testing WI + work_item_status_changed → testing", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "testing" }),
      makeWorkItem({ status: "in_progress" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("testing");
  });

  it("planning + testing WI (no in_progress) → testing directly", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "testing" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("testing");
    expect(projectRepo.updateCalls[0].input.startDate).not.toBeNull();
  });
});

// ── Rule 3: in_development + all done → testing (BUG 1 FIX) ──────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — Rule 3 (in_development + all done → testing)", () => {
  it("in_development + all WIs done + work_item_status_changed → testing", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "done" }),
      makeWorkItem({ status: "done" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("testing");
  });

  it("in_development + done + cancelled (no active) + support_ticket_resolved → testing", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "done" }),
      makeWorkItem({ status: "cancelled" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_ticket_resolved"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("testing");
  });

  it("in_development + all cancelled + work_item_status_changed → stays in_development (no done WI)", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "cancelled" }),
      makeWorkItem({ status: "cancelled" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("in_development + active WI still exists + work_item_status_changed → stays in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "done" }),
      makeWorkItem({ status: "in_progress" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("in_development + backlog WI + done WIs → backlog blocks Rule 3, stays in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "done" }),
      makeWorkItem({ status: "backlog" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("in_development + ready WI + done WIs → ready blocks Rule 3, stays in_development", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "done" }),
      makeWorkItem({ status: "ready" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("in_development + all done + is rework reason → Rule 3 still fires", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "done" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_ticket_resolved"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("testing");
  });

  it("in_development + no WIs at all → no change (nothing done yet)", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });
});

// ── Reopen + Rule 3 interaction ───────────────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — reopen + Rule 3 interaction", () => {
  it("testing + new_work_item (backlog WI added) → in_development, not re-closed to testing", async () => {
    // The new backlog WI is "open" so Rule 3 must not immediately fire after reopen.
    const projectRepo = new FakeProjectRepository(makeProject({ status: "testing" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "done" }),   // previous done WI
      makeWorkItem({ status: "backlog" }), // newly added WI
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "new_work_item"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
  });
});

// ── No-op ─────────────────────────────────────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — no-op", () => {
  it("in_development + active WIs + non-rework reason → no write", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "in_development" }));
    const workItemRepo = new FakeProjectWorkItemRepository([
      makeWorkItem({ status: "in_progress" }),
      makeWorkItem({ status: "blocked" }),
    ]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });

  it("testing + support_ticket_closed → no change", async () => {
    const projectRepo = new FakeProjectRepository(makeProject({ status: "testing" }));
    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "done" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "support_ticket_closed"
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(projectRepo.updateCalls).toHaveLength(0);
  });
});

// ── Failure cases ─────────────────────────────────────────────────────────────

describe("reconcileProjectLifecycleAfterOperationalChange — failure cases", () => {
  it("project not found → ok:false", async () => {
    const projectRepo = new FakeProjectRepository(null);
    const workItemRepo = new FakeProjectWorkItemRepository([]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", projectRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(false);
  });

  it("repository.update throws → ok:false", async () => {
    const failingRepo = {
      ...new FakeProjectRepository(makeProject({ status: "planning" })),
      update: async () => { throw new Error("DB error"); },
    } as unknown as ProjectRepository;

    const workItemRepo = new FakeProjectWorkItemRepository([makeWorkItem({ status: "in_progress" })]);

    const result = await reconcileProjectLifecycleAfterOperationalChange(
      "p1", failingRepo, workItemRepo, "work_item_status_changed"
    );

    expect(result.ok).toBe(false);
  });
});
