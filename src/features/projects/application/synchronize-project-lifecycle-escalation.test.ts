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

// ── Tests — escalation scenario (testing + backlog work item) ─────────────────

describe("synchronizeProjectLifecycleUseCase — escalation scenario", () => {
  let projectRepo:  FakeProjectRepository;
  let workItemRepo: FakeProjectWorkItemRepository;

  // The main regression scenario: escalation creates a backlog work item in a
  // testing project — lifecycle must immediately regress to in_development.
  describe("testing project + new backlog work item (escalation case)", () => {
    beforeEach(() => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "testing" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-done",   status: "done" }),
        makeWorkItem({ id: "wi-new",    status: "backlog" }), // new from escalation
      ]);
    });

    it("regresses project to in_development", async () => {
      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(true);
      expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
    });

    it("does not touch startDate (project was already started)", async () => {
      await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(projectRepo.updateCalls[0].input.startDate).toBe("2026-01-01");
    });
  });

  describe("testing project + new ready work item (escalation with different status)", () => {
    it("regresses to in_development for any OPEN status, not just backlog", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "testing" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-done",  status: "done" }),
        makeWorkItem({ id: "wi-ready", status: "ready" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      expect(projectRepo.updateCalls[0].input.status).toBe("in_development");
    });
  });

  describe("non-regressing cases", () => {
    it("planning project with new backlog item remains planning (no in_progress)", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "planning" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-new", status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("in_development project with new backlog item stays in_development", async () => {
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

    it("deployed project with new backlog item is not auto-changed", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "deployed" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-new", status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });

    it("paused project with new backlog item is not auto-changed", async () => {
      projectRepo  = new FakeProjectRepository(makeProject({ status: "paused" }));
      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ id: "wi-new", status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(projectRepo.updateCalls).toHaveLength(0);
    });
  });

  describe("lifecycle sync failure", () => {
    it("returns ok:false when project is not found", async () => {
      projectRepo  = new FakeProjectRepository(null);
      workItemRepo = new FakeProjectWorkItemRepository([]);

      const result = await synchronizeProjectLifecycleUseCase("p1", projectRepo, workItemRepo);

      expect(result.ok).toBe(false);
    });

    it("returns ok:false when repository.update throws", async () => {
      // Simulate a project repository that throws on update.
      const failingProjectRepo = {
        ...new FakeProjectRepository(makeProject({ status: "testing" })),
        update: async () => { throw new Error("DB error"); },
      } as unknown as ProjectRepository;

      workItemRepo = new FakeProjectWorkItemRepository([
        makeWorkItem({ status: "backlog" }),
      ]);

      const result = await synchronizeProjectLifecycleUseCase(
        "p1", failingProjectRepo, workItemRepo
      );

      expect(result.ok).toBe(false);
    });
  });
});
