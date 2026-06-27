import { describe, it, expect } from "vitest";
import { reopenProjectForDevelopmentUseCase } from "./reopen-project-for-development.use-case";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { Project, UpdateProjectInput } from "@/features/projects/domain/project.types";

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

// ── Fake repository ───────────────────────────────────────────────────────────

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
    if (this.project) this.project = { ...this.project, status: input.status };
  }

  async create(): Promise<{ id: string }> { return { id: "" }; }
  async findAll(): Promise<Project[]> { return []; }
  async findByClientId(): Promise<Project[]> { return []; }
}

// ── Support intervention trigger ──────────────────────────────────────────────

describe("reopenProjectForDevelopmentUseCase — support_intervention trigger", () => {
  it("testing + intervention → project updated to in_development", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "testing" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
  });

  it("testing + intervention → startDate preserved", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "testing", startDate: "2026-01-01" }));

    await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(repo.updateCalls[0].input.startDate).toBe("2026-01-01");
  });

  it("in_development + intervention → no-op (already in development)", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "in_development" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(repo.updateCalls).toHaveLength(0);
  });

  it("planning + intervention → in_development, startDate initialized when null", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "planning", startDate: null }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
    expect(repo.updateCalls[0].input.startDate).not.toBeNull();
  });

  it("planning + intervention + existing startDate → startDate preserved", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "planning", startDate: "2025-06-01" }));

    await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(repo.updateCalls[0].input.startDate).toBe("2025-06-01");
  });

  it("cancelled + intervention → no automatic mutation", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "cancelled" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(repo.updateCalls).toHaveLength(0);
  });

  it("paused + intervention → no automatic mutation", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "paused" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(repo.updateCalls).toHaveLength(0);
  });

  it("discovery + intervention → no automatic mutation", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "discovery" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(false);
    expect(repo.updateCalls).toHaveLength(0);
  });

  it("deployed + intervention → in_development (post-deploy rework allowed)", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "deployed", startDate: "2026-01-01" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
    expect(repo.updateCalls[0].input.startDate).toBe("2026-01-01");
  });

  it("maintenance + intervention → in_development (maintenance rework allowed)", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "maintenance", startDate: "2026-01-01" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
  });

  it("returns ok:false when project does not exist", async () => {
    const repo = new FakeProjectRepository(null);

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

    expect(result.ok).toBe(false);
  });

  it("returns ok:false when repository.update throws", async () => {
    const failingRepo = {
      ...new FakeProjectRepository(makeProject({ status: "testing" })),
      update: async () => { throw new Error("DB error"); },
    } as unknown as ProjectRepository;

    const result = await reopenProjectForDevelopmentUseCase("p1", failingRepo, "support_intervention");

    expect(result.ok).toBe(false);
  });
});

// ── New active work item trigger ──────────────────────────────────────────────

describe("reopenProjectForDevelopmentUseCase — new_active_work_item trigger", () => {
  it("testing + new in_progress WI → project updated to in_development", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "testing" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "new_active_work_item");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
  });

  it("testing + new blocked WI → project updated to in_development", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "testing" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "new_active_work_item");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
  });

  it("testing + new review WI → project updated to in_development", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "testing" }));

    const result = await reopenProjectForDevelopmentUseCase("p1", repo, "new_active_work_item");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changed).toBe(true);
    expect(repo.updateCalls[0].input.status).toBe("in_development");
  });

  it("testing + startDate preserved when present", async () => {
    const repo = new FakeProjectRepository(makeProject({ status: "testing", startDate: "2026-03-01" }));

    await reopenProjectForDevelopmentUseCase("p1", repo, "new_active_work_item");

    expect(repo.updateCalls[0].input.startDate).toBe("2026-03-01");
  });
});

// ── Ordinary sync preserves testing state (verified at call-site boundary) ────
// These tests document that the reopen use case is the ONLY mechanism for
// testing → in_development. Ordinary status changes do not reach this use case.

describe("reopenProjectForDevelopmentUseCase — does not affect non-eligible states", () => {
  const nonEligible = ["paused", "cancelled", "discovery"] as const;

  for (const status of nonEligible) {
    it(`${status} → no-op regardless of trigger`, async () => {
      const repo = new FakeProjectRepository(makeProject({ status }));

      const result = await reopenProjectForDevelopmentUseCase("p1", repo, "support_intervention");

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.changed).toBe(false);
      expect(repo.updateCalls).toHaveLength(0);
    });
  }
});
