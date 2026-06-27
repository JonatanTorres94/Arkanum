import { describe, it, expect } from "vitest";
import { reconcileProjectLifecycleAfterOperationalChange } from "./reconcile-project-lifecycle.use-case";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { Project, UpdateProjectInput } from "@/features/projects/domain/project.types";
import type {
  ProjectWorkItem,
  CreateProjectWorkItemInput,
  UpdateProjectWorkItemStatusInput,
} from "@/features/projects/domain/project-work-item.types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id:          "p1",
    clientId:    "c1",
    name:        "Proyecto",
    description: null,
    status:      "planning",
    startDate:   null,
    targetDate:  null,
    notes:       null,
    createdAt:   "2026-01-01T00:00:00.000Z",
    updatedAt:   "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeWorkItem(id: string, overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id,
    projectId:   "p1",
    title:       `Work Item ${id}`,
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

// ── Mutable fakes (shared state across reconcile calls) ───────────────────────

class MutableProjectRepository implements ProjectRepository {
  project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  async findById(): Promise<Project | null>         { return this.project; }
  async update(_id: string, input: UpdateProjectInput): Promise<void> {
    this.project = { ...this.project, status: input.status, startDate: input.startDate };
  }
  async create(): Promise<{ id: string }>           { return { id: "" }; }
  async findAll(): Promise<Project[]>               { return [this.project]; }
  async findByClientId(): Promise<Project[]>        { return [this.project]; }
}

class MutableProjectWorkItemRepository implements ProjectWorkItemRepository {
  private items = new Map<string, ProjectWorkItem>();

  seed(wis: ProjectWorkItem[]): void {
    for (const wi of wis) this.items.set(wi.id, wi);
  }

  add(wi: ProjectWorkItem): void {
    this.items.set(wi.id, wi);
  }

  setStatus(id: string, status: ProjectWorkItem["status"]): void {
    const item = this.items.get(id);
    if (item) this.items.set(id, { ...item, status });
  }

  async findByProjectId(): Promise<ProjectWorkItem[]> { return [...this.items.values()]; }
  async findById(id: string): Promise<ProjectWorkItem | null> { return this.items.get(id) ?? null; }
  async create(input: CreateProjectWorkItemInput): Promise<{ id: string }> {
    const id = `wi-${this.items.size + 1}`;
    this.items.set(id, {
      id,
      projectId:   input.projectId,
      title:       input.title,
      description: input.description,
      category:    input.category,
      status:      input.status,
      priority:    input.priority,
      notes:       input.notes,
      createdAt:   "2026-01-01T00:00:00.000Z",
      updatedAt:   "2026-01-01T00:00:00.000Z",
    });
    return { id };
  }
  async update(): Promise<void>                       {}
  async updateStatus(id: string, input: UpdateProjectWorkItemStatusInput): Promise<void> {
    this.setStatus(id, input.status);
  }
}

// Helper for concise reconcile calls
function reconcile(
  projectRepo: MutableProjectRepository,
  wiRepo:      MutableProjectWorkItemRepository,
  reason:      Parameters<typeof reconcileProjectLifecycleAfterOperationalChange>[3]
) {
  return reconcileProjectLifecycleAfterOperationalChange("p1", projectRepo, wiRepo, reason);
}

// ── Full lifecycle chain ───────────────────────────────────────────────────────

describe("Project lifecycle workflow — planning → in_development → testing", () => {
  it("creates WI in_progress → reconcile → in_development; marks WI done → reconcile → testing", async () => {
    const projectRepo = new MutableProjectRepository(makeProject({ status: "planning" }));
    const wiRepo      = new MutableProjectWorkItemRepository();

    // Step 1: WI created with in_progress status.
    wiRepo.add(makeWorkItem("wi-1", { status: "in_progress" }));
    await reconcile(projectRepo, wiRepo, "new_work_item");
    expect(projectRepo.project.status).toBe("in_development"); // Rule 1

    // Step 2: WI transitions to done; no other open WIs.
    wiRepo.setStatus("wi-1", "done");
    await reconcile(projectRepo, wiRepo, "work_item_status_changed");
    expect(projectRepo.project.status).toBe("testing"); // Rule 3 (Bug 1 fix)
  });

  it("multiple WIs: stays in_development until ALL open WIs are done", async () => {
    const projectRepo = new MutableProjectRepository(makeProject({ status: "in_development" }));
    const wiRepo      = new MutableProjectWorkItemRepository();
    wiRepo.seed([
      makeWorkItem("wi-1", { status: "in_progress" }),
      makeWorkItem("wi-2", { status: "in_progress" }),
    ]);

    // Mark one done — still has open WI.
    wiRepo.setStatus("wi-1", "done");
    await reconcile(projectRepo, wiRepo, "work_item_status_changed");
    expect(projectRepo.project.status).toBe("in_development"); // wi-2 still open

    // Mark the second done — no more open WIs.
    wiRepo.setStatus("wi-2", "done");
    await reconcile(projectRepo, wiRepo, "work_item_status_changed");
    expect(projectRepo.project.status).toBe("testing"); // Rule 3
  });
});

// ── Reopen + Rule 3 interaction ───────────────────────────────────────────────

describe("Project lifecycle workflow — reopen (support escalation) → in_development → testing", () => {
  it("testing + escalation adds backlog WI → in_development; WI done → testing", async () => {
    const projectRepo = new MutableProjectRepository(makeProject({ status: "testing" }));
    const wiRepo      = new MutableProjectWorkItemRepository();
    wiRepo.seed([makeWorkItem("wi-existing", { status: "done" })]);

    // Escalation creates a new backlog WI and triggers reconcile.
    wiRepo.add(makeWorkItem("wi-new", { status: "backlog" }));
    await reconcile(projectRepo, wiRepo, "support_ticket_escalated");
    expect(projectRepo.project.status).toBe("in_development"); // reopen rule

    // Backlog WI is "open" (OPEN_WORK_ITEM_STATUSES includes backlog) — Rule 3 does NOT fire.
    // Verify: explicitly call reconcile again while backlog WI exists.
    await reconcile(projectRepo, wiRepo, "work_item_status_changed");
    expect(projectRepo.project.status).toBe("in_development"); // backlog prevents Rule 3

    // WI moves to done — no more open WIs.
    wiRepo.setStatus("wi-new", "done");
    await reconcile(projectRepo, wiRepo, "work_item_status_changed");
    expect(projectRepo.project.status).toBe("testing"); // Rule 3 fires
  });
});

// ── Protected statuses never auto-mutated ────────────────────────────────────

describe("Project lifecycle workflow — protected statuses", () => {
  it.each(["paused", "cancelled", "discovery"] as const)(
    "%s project is never mutated regardless of WI state",
    async (protectedStatus) => {
      const projectRepo = new MutableProjectRepository(makeProject({ status: protectedStatus }));
      const wiRepo      = new MutableProjectWorkItemRepository();
      wiRepo.seed([
        makeWorkItem("wi-1", { status: "in_progress" }),
        makeWorkItem("wi-2", { status: "done" }),
      ]);

      await reconcile(projectRepo, wiRepo, "work_item_status_changed");
      await reconcile(projectRepo, wiRepo, "new_work_item");
      await reconcile(projectRepo, wiRepo, "support_ticket_escalated");
      expect(projectRepo.project.status).toBe(protectedStatus);
    }
  );
});
