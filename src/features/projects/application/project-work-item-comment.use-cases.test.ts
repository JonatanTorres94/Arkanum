import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProjectWorkItemCommentUseCase } from "./create-project-work-item-comment.use-case";
import { getProjectWorkItemCommentsUseCase } from "./get-project-work-item-comments.use-case";
import { getProjectWorkItemCommentsSupportVisibleUseCase } from "./get-project-work-item-comments-support-visible.use-case";
import type { ProjectWorkItemComment } from "@/features/projects/domain/project-work-item-comment.types";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";
import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";

function buildComment(overrides: Partial<ProjectWorkItemComment> = {}): ProjectWorkItemComment {
  return {
    id:               "comment-1",
    workItemId:       "wi-1",
    content:          "Test comment",
    visibleToSupport: false,
    createdBy:        "dev@example.com",
    createdAt:        "2026-06-26T00:00:00Z",
    ...overrides,
  };
}

function buildRepo(
  overrides: Partial<ProjectWorkItemCommentRepository> = {}
): ProjectWorkItemCommentRepository {
  return {
    findByWorkItemId: vi.fn().mockResolvedValue([]),
    findByWorkItemIdVisibleToSupport: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: "comment-1" }),
    ...overrides,
  };
}

// ─── createProjectWorkItemCommentUseCase ────────────────────────────────────

describe("createProjectWorkItemCommentUseCase", () => {
  it("returns ok:true with the new comment id on success", async () => {
    const repo = buildRepo({ create: vi.fn().mockResolvedValue({ id: "new-id" }) });
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "Hello", visibleToSupport: false },
      "dev@example.com",
      repo
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.id).toBe("new-id");
  });

  it("calls repository.create with the trimmed content", async () => {
    const create = vi.fn().mockResolvedValue({ id: "x" });
    const repo   = buildRepo({ create });
    await createProjectWorkItemCommentUseCase(
      "wi-abc",
      { content: "  Bug found  ", visibleToSupport: true },
      "user@test.com",
      repo
    );
    expect(create).toHaveBeenCalledWith(
      "wi-abc",
      { content: "Bug found", visibleToSupport: true },
      "user@test.com"
    );
  });

  it("returns ok:false when repository throws", async () => {
    const repo = buildRepo({ create: vi.fn().mockRejectedValue(new Error("DB failure")) });
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "x", visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it("accepts null as createdBy", async () => {
    const create = vi.fn().mockResolvedValue({ id: "id-1" });
    const repo   = buildRepo({ create });
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "anonymous", visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalledWith("wi-1", expect.any(Object), null);
  });

  // ── Validation guards ─────────────────────────────────────────────────────

  it("rejects empty content", async () => {
    const repo = buildRepo();
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "", visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(false);
    expect((repo.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only content", async () => {
    const repo = buildRepo();
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "   \t\n  ", visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/vacío/);
    expect((repo.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it(`rejects content exceeding ${COMMENT_MAX_LENGTH} characters`, async () => {
    const repo = buildRepo();
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "a".repeat(COMMENT_MAX_LENGTH + 1), visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/2000/);
    expect((repo.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it(`accepts content of exactly ${COMMENT_MAX_LENGTH} characters`, async () => {
    const create = vi.fn().mockResolvedValue({ id: "id-x" });
    const repo   = buildRepo({ create });
    const result = await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "a".repeat(COMMENT_MAX_LENGTH), visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalled();
  });

  it("rejects empty workItemId", async () => {
    const repo = buildRepo();
    const result = await createProjectWorkItemCommentUseCase(
      "   ",
      { content: "Valid content", visibleToSupport: false },
      null,
      repo
    );
    expect(result.ok).toBe(false);
    expect((repo.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("trims leading and trailing whitespace before persisting", async () => {
    const create = vi.fn().mockResolvedValue({ id: "id-trim" });
    const repo   = buildRepo({ create });
    await createProjectWorkItemCommentUseCase(
      "wi-1",
      { content: "  trimmed content  ", visibleToSupport: false },
      null,
      repo
    );
    const [, inputArg] = create.mock.calls[0] as [string, { content: string }, unknown];
    expect(inputArg.content).toBe("trimmed content");
  });
});

// ─── getProjectWorkItemCommentsUseCase ──────────────────────────────────────

describe("getProjectWorkItemCommentsUseCase", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all comments for a work item", async () => {
    const comments = [
      buildComment({ id: "c1", visibleToSupport: false }),
      buildComment({ id: "c2", visibleToSupport: true }),
    ];
    const repo = buildRepo({ findByWorkItemId: vi.fn().mockResolvedValue(comments) });
    const result = await getProjectWorkItemCommentsUseCase("wi-1", repo);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.comments).toHaveLength(2);
  });

  it("returns empty array when no comments exist", async () => {
    const repo = buildRepo({ findByWorkItemId: vi.fn().mockResolvedValue([]) });
    const result = await getProjectWorkItemCommentsUseCase("wi-1", repo);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.comments).toHaveLength(0);
  });

  it("returns ok:false when repository throws", async () => {
    const repo = buildRepo({ findByWorkItemId: vi.fn().mockRejectedValue(new Error("DB down")) });
    const result = await getProjectWorkItemCommentsUseCase("wi-1", repo);
    expect(result.ok).toBe(false);
  });

  it("returns both support-visible and non-visible comments", async () => {
    const comments = [
      buildComment({ id: "c1", visibleToSupport: true }),
      buildComment({ id: "c2", visibleToSupport: false }),
    ];
    const repo = buildRepo({ findByWorkItemId: vi.fn().mockResolvedValue(comments) });
    const result = await getProjectWorkItemCommentsUseCase("wi-1", repo);
    if (result.ok) {
      const flags = result.comments.map((c) => c.visibleToSupport);
      expect(flags).toContain(true);
      expect(flags).toContain(false);
    }
  });
});

// ─── getProjectWorkItemCommentsSupportVisibleUseCase ────────────────────────

describe("getProjectWorkItemCommentsSupportVisibleUseCase", () => {
  it("returns only support-visible comments", async () => {
    const comments = [
      buildComment({ id: "c1", visibleToSupport: true }),
      buildComment({ id: "c2", visibleToSupport: true }),
    ];
    const repo = buildRepo({ findByWorkItemIdVisibleToSupport: vi.fn().mockResolvedValue(comments) });
    const result = await getProjectWorkItemCommentsSupportVisibleUseCase("wi-1", repo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.comments).toHaveLength(2);
      result.comments.forEach((c) => expect(c.visibleToSupport).toBe(true));
    }
  });

  it("returns empty array when no support-visible comments exist", async () => {
    const repo = buildRepo({ findByWorkItemIdVisibleToSupport: vi.fn().mockResolvedValue([]) });
    const result = await getProjectWorkItemCommentsSupportVisibleUseCase("wi-1", repo);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.comments).toHaveLength(0);
  });

  it("returns ok:false when repository throws", async () => {
    const repo = buildRepo({
      findByWorkItemIdVisibleToSupport: vi.fn().mockRejectedValue(new Error("fail")),
    });
    const result = await getProjectWorkItemCommentsSupportVisibleUseCase("wi-1", repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it("never calls findByWorkItemId (uses the filtered variant)", async () => {
    const findAll      = vi.fn().mockResolvedValue([]);
    const findFiltered = vi.fn().mockResolvedValue([]);
    const repo = buildRepo({
      findByWorkItemId: findAll,
      findByWorkItemIdVisibleToSupport: findFiltered,
    });
    await getProjectWorkItemCommentsSupportVisibleUseCase("wi-1", repo);
    expect(findAll).not.toHaveBeenCalled();
    expect(findFiltered).toHaveBeenCalledWith("wi-1");
  });
});
