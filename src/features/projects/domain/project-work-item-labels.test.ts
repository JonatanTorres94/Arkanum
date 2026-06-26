import { describe, it, expect } from "vitest";
import { WORK_ITEM_STATUS_LABELS } from "./project-work-item-labels";
import { WORK_ITEM_STATUSES } from "./project-work-item.types";

describe("WORK_ITEM_STATUS_LABELS", () => {
  it("covers every status in WORK_ITEM_STATUSES — no missing keys", () => {
    for (const status of WORK_ITEM_STATUSES) {
      expect(WORK_ITEM_STATUS_LABELS[status]).toBeDefined();
      expect(WORK_ITEM_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });

  it("maps ready to 'Listo para iniciar'", () => {
    expect(WORK_ITEM_STATUS_LABELS.ready).toBe("Listo para iniciar");
  });

  it("maps done to 'Completado'", () => {
    expect(WORK_ITEM_STATUS_LABELS.done).toBe("Completado");
  });
});
