import { describe, it, expect } from "vitest";
import { assessProjectLifecycle } from "./project-lifecycle";
import type { Project } from "./project.types";
import type { ProjectWorkItem } from "./project-work-item.types";

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

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id:          "wi1",
    projectId:   "p1",
    title:       "Work item",
    description: null,
    category:    "task",
    status:      "backlog",
    priority:    "low",
    notes:       null,
    createdAt:   "2026-01-01T00:00:00.000Z",
    updatedAt:   "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("assessProjectLifecycle", () => {
  describe("consistent — no warnings", () => {
    it("returns consistent when planning with only backlog items", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "backlog" })]
      );
      expect(result.consistent).toBe(true);
      expect(result.inconsistencies).toHaveLength(0);
    });

    it("returns consistent when planning with only ready items", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "ready" })]
      );
      expect(result.consistent).toBe(true);
    });

    it("returns consistent when in_development with in_progress items and startDate set", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: "2026-01-01" }),
        [makeWorkItem({ status: "in_progress" })]
      );
      expect(result.consistent).toBe(true);
    });

    it("returns consistent when testing with testing items and startDate set", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "testing", startDate: "2026-01-01" }),
        [makeWorkItem({ status: "testing" })]
      );
      expect(result.consistent).toBe(true);
    });

    it("returns consistent when deployed with all done items", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "deployed", startDate: "2026-01-01" }),
        [makeWorkItem({ status: "done" })]
      );
      expect(result.consistent).toBe(true);
    });

    it("returns consistent when there are no work items", () => {
      const result = assessProjectLifecycle(makeProject({ status: "planning" }), []);
      expect(result.consistent).toBe(true);
    });
  });

  // ─── planning_while_execution_exists ────────────────────────────────────────

  describe("planning_while_execution_exists", () => {
    it("flags planning project with in_progress WI", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "in_progress" })]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "planning_while_execution_exists");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("warning");
      expect(inc?.suggestedStatus).toBe("in_development");
    });

    it("flags planning project with blocked WI", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "blocked" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "planning_while_execution_exists");
      expect(inc).toBeDefined();
    });

    it("suggests in_development when at least one WI is in_progress", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "in_progress" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "planning_while_execution_exists");
      expect(inc?.suggestedStatus).toBe("in_development");
    });

    it("suggests null when only done items exist (no in_progress)", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "done" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "planning_while_execution_exists");
      expect(inc?.suggestedStatus).toBeNull();
    });
  });

  // ─── planning_while_testing_exists ──────────────────────────────────────────

  describe("planning_while_testing_exists", () => {
    it("flags planning project when a WI is in testing", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "testing" })]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "planning_while_testing_exists");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("warning");
      expect(inc?.suggestedStatus).toBe("testing");
    });

    it("does not also emit planning_while_execution_exists when testing WI present (testing takes priority)", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "testing" })]
      );
      const reasons = result.inconsistencies.map((i) => i.reason);
      expect(reasons).not.toContain("planning_while_execution_exists");
      expect(reasons).toContain("planning_while_testing_exists");
    });
  });

  // ─── in_development_while_testing_exists ────────────────────────────────────

  describe("in_development_while_testing_exists", () => {
    it("flags in_development project when a WI is in testing", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: "2026-01-01" }),
        [
          makeWorkItem({ id: "wi1", status: "in_progress" }),
          makeWorkItem({ id: "wi2", status: "testing" }),
        ]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "in_development_while_testing_exists");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("warning");
      expect(inc?.suggestedStatus).toBe("testing");
    });
  });

  // ─── ahead_of_execution ──────────────────────────────────────────────────────

  describe("ahead_of_execution", () => {
    it("flags testing project when no WI is in a real execution state", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "testing", startDate: "2026-01-01" }),
        [
          makeWorkItem({ id: "wi1", status: "backlog" }),
          makeWorkItem({ id: "wi2", status: "ready" }),
        ]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "ahead_of_execution");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("info");
      expect(inc?.suggestedStatus).toBeNull();
    });

    it("does not flag when testing project has at least one done WI", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "testing", startDate: "2026-01-01" }),
        [makeWorkItem({ status: "done" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "ahead_of_execution");
      expect(inc).toBeUndefined();
    });
  });

  // ─── completed_with_active_work ──────────────────────────────────────────────

  describe("completed_with_active_work", () => {
    it("flags deployed project with active WIs", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "deployed" }),
        [makeWorkItem({ status: "in_progress" })]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "completed_with_active_work");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("warning");
    });

    it("does not flag deployed project when all WIs are done", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "deployed" }),
        [makeWorkItem({ status: "done" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "completed_with_active_work");
      expect(inc).toBeUndefined();
    });
  });

  // ─── execution_status_missing_start_date ─────────────────────────────────────

  describe("execution_status_missing_start_date", () => {
    it("flags in_development project with no startDate", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: null }),
        [makeWorkItem({ status: "in_progress" })]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "execution_status_missing_start_date");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("info");
    });

    it("flags testing project with no startDate", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "testing", startDate: null }),
        [makeWorkItem({ status: "testing" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "execution_status_missing_start_date");
      expect(inc).toBeDefined();
    });

    it("does not flag in_development project when startDate is set", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: "2026-01-01" }),
        [makeWorkItem({ status: "in_progress" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "execution_status_missing_start_date");
      expect(inc).toBeUndefined();
    });

    it("does not flag planning or other non-execution statuses", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning", startDate: null }),
        [makeWorkItem({ status: "backlog" })]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "execution_status_missing_start_date");
      expect(inc).toBeUndefined();
    });
  });

  // ─── all_work_items_cancelled ────────────────────────────────────────────────

  describe("all_work_items_cancelled", () => {
    it("flags when all WIs are cancelled", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: "2026-01-01" }),
        [
          makeWorkItem({ id: "wi1", status: "cancelled" }),
          makeWorkItem({ id: "wi2", status: "cancelled" }),
        ]
      );
      expect(result.consistent).toBe(false);
      const inc = result.inconsistencies.find((i) => i.reason === "all_work_items_cancelled");
      expect(inc).toBeDefined();
      expect(inc?.severity).toBe("warning");
    });

    it("does not flag when at least one WI is not cancelled", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: "2026-01-01" }),
        [
          makeWorkItem({ id: "wi1", status: "cancelled" }),
          makeWorkItem({ id: "wi2", status: "done" }),
        ]
      );
      const inc = result.inconsistencies.find((i) => i.reason === "all_work_items_cancelled");
      expect(inc).toBeUndefined();
    });
  });

  // ─── Top-level convenience fields ───────────────────────────────────────────

  describe("top-level suggestedStatus and severity", () => {
    it("suggestedStatus comes from the most severe (warning) inconsistency", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "in_development", startDate: null }),
        [makeWorkItem({ status: "testing" })]
      );
      // in_development_while_testing_exists (warning) + execution_status_missing_start_date (info)
      expect(result.suggestedStatus).toBe("testing");
      expect(result.severity).toBe("warning");
    });

    it("suggestedStatus is null when consistent", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "backlog" })]
      );
      expect(result.suggestedStatus).toBeNull();
      expect(result.severity).toBeNull();
    });

    it("warnings array is backward-compatible (one message per inconsistency)", () => {
      const result = assessProjectLifecycle(
        makeProject({ status: "planning" }),
        [makeWorkItem({ status: "in_progress" })]
      );
      expect(result.warnings.length).toBe(result.inconsistencies.length);
      expect(typeof result.warnings[0].message).toBe("string");
    });
  });
});
