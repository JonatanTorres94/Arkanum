import { describe, it, expect, beforeEach } from "vitest";
import { synchronizeProjectLifecycleUseCase } from "./synchronize-project-lifecycle.use-case";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { Project, UpdateProjectInput } from "@/features/projects/domain/project.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id:          "p1",
    clientId:    "c1",
    name:        "Proyecto",
    description: null,
    status:      "testing",
    startDate:   "2026-01-01",
    targetDate:  null,
    notes:       null,
    createdAt:   "2026-01-01T00:00:00.000Z",
    updatedAt:   "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id:          "wi1",
    projectId:   "p1",
    title:       "Work item",
    description: null,
    category:    "task",
    status:      "done",
    priority:    "low",
    notes:       null,
    createdAt:   "2026-01-01T00:00:00.000Z",
    updatedAt:   "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ── Fakes ─────────────────────────────────────────────────────────────────────

class FakeProjectRepository implements Pick<ProjectRepository, "findById" | "update"> {
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
    if (this.project) {
      this.project = { ...this.project, status: input.status };
    }
  }

  // Unused stub methods.
  async create(): Promise<{ id: string }> { return { id: "" }; }
  async findAll(): Promise<Project[]> { return []; }
  async findByClientId(): Promise<Project[]> { return []; }
}

class FakeProjectWorkItemRepository
  implements Pick<ProjectWorkItemRepository, "findByProjectId">
{
  private items: ProjectWorkItem[];

  constructor(items: ProjectWorkItem[]) {
    this.items = items;
  }

  async findByProjectId(): Promise<ProjectWorkItem[]> {
    return this.items;
  }

  // Unused stub methods.
  async create(): Promise<{ id: string }> { return { id: "" }; }
  async findById(): Promise<ProjectWorkItem | null> { return null; }
  async update(): Promise<void> {}
  async updateStatus(): Promise<void> {}
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("synchronizeProjectLifecycleUseCase — lifecycle rules", () => {
  let projectRepo:  FakeProjectRepository;
  let workItemRepo: FakeProjectWorkItemRepository;

  // ─── Rule 1: planning → in_development ─────────────────────────────────────

  describe("Rule 1 — planning → in_development", () => {
    it("advances planning to in_development when a WI enters in_progress", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "in_progress" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(true);
      expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
    });

    it("initializes startDate when transitioning planning → in_development", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "in_progress" }),
      ]);

      await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(projectRepo.updateCalls[0].input.startDate).not.toBeNull();
    });

    it("does not overwrite an existing startDate", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: "2025-01-15" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "in_progress" }),
      ]);

      await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(projectRepo.updateCalls[0].input.startDate).toBe("2025-01-15");
    });

    it("does not advance if the only WI is in backlog (no in_progress)", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });
  });

  // ─── Rule 2: planning/in_development → testing ─────────────────────────────

  describe("Rule 2 — → testing when any WI enters testing", () => {
    it("advances in_development to testing when a WI enters testing", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "in_development", startDate: "2026-01-01" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "in_progress" }),
        makeWorkItem({ id: "wi2", status: "testing" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(true);
      expect(projectRepo.updateCalls[0].input.status).toBe("testing");
    });

    it("advances planning directly to testing when a WI is already in testing", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "testing" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(true);
      expect(projectRepo.updateCalls[0].input.status).toBe("testing");
    });

    it("initializes startDate when advancing directly from planning to testing", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "testing" }),
      ]);

      await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(projectRepo.updateCalls[0].input.startDate).not.toBeNull();
    });

    it("does not overwrite startDate when advancing in_development → testing", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "in_development", startDate: "2026-01-01" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "testing" }),
      ]);

      await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(projectRepo.updateCalls[0].input.startDate).toBe("2026-01-01");
    });

    it("applies both Rule 1 and Rule 2: planning → testing when WI in_progress and another in testing", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi1", status: "in_progress" }),
        makeWorkItem({ id: "wi2", status: "testing" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(true);
      // Rule 2 overrides Rule 1 — final status is testing.
      expect(projectRepo.updateCalls[0].input.status).toBe("testing");
    });
  });

  // ─── No regression from testing ────────────────────────────────────────────

  describe("No regression — testing project stays in testing", () => {
    beforeEach(() => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "testing" }));
    });

    it("stays in testing when escalation creates a new backlog item", async () => {
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-done",    status: "done" }),
        makeWorkItem({ id: "wi-backlog", status: "backlog" }), // from escalation
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("stays in testing when a WI moves to ready", async () => {
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-done",  status: "done" }),
        makeWorkItem({ id: "wi-ready", status: "ready" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("stays in testing when a WI moves back to in_progress", async () => {
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-done",     status: "done" }),
        makeWorkItem({ id: "wi-progress", status: "in_progress" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("stays in testing when all WIs are done", async () => {
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi1", status: "done" }),
        makeWorkItem({ id: "wi2", status: "done" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });
  });

  // ─── Protected statuses ─────────────────────────────────────────────────────

  describe("Protected statuses — no auto-change", () => {
    it("does not change a deployed project", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "deployed" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("does not change a paused project", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "paused" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "in_progress" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("does not change a cancelled project", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "cancelled" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "testing" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("does not change a maintenance project", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "maintenance" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "in_progress" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });
  });

  // ─── No-op cases ───────────────────────────────────────────────────────────

  describe("No-op — already in the correct state", () => {
    it("in_development project with only in_progress items — no change", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "in_development" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-progress", status: "in_progress" }),
        makeWorkItem({ id: "wi-new",      status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("empty work items — no change", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning" }));
      workItemRepo = new FakeProjectWorkItemRepository([]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
    });
  });

  // ─── Failure cases ──────────────────────────────────────────────────────────

  describe("Failure cases", () => {
    it("returns ok:false when project is not found", async () => {
      projectRepo  = new FakeProjectRepository(null);
      workItemRepo = new FakeProjectWorkItemRepository([]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(false);
    });

    it("returns ok:false when repository.update throws", async () => {
      const failingProjectRepo = {
        ...new FakeProjectRepository(makeProject({ status: "in_development" })),
        update: async () => { throw new Error("DB error"); },
      } as unknown as ProjectRepository;

      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "testing" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase(
        "p1", failingProjectRepo, workItemRepo
      );

      expect(result.ok).toBe(false);
    });
  });
});
