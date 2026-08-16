import { describe, expect, it } from "vitest";
import { buildUnifiedDiff, mapWorkflowStatus } from "./deployment";

describe("deployment helpers", () => {
  it("maps GitHub Actions states to dashboard labels", () => {
    expect(mapWorkflowStatus("completed", "success")).toBe("success");
    expect(mapWorkflowStatus("completed", "failure")).toBe("failure");
    expect(mapWorkflowStatus("in_progress", null)).toBe("progress");
    expect(mapWorkflowStatus("queued", null)).toBe("progress");
  });

  it("builds a unified diff from the current editor content", () => {
    const diff = buildUnifiedDiff("one\ntwo", "one\nthree");
    expect(diff).toContain(" one");
    expect(diff).toContain("-two");
    expect(diff).toContain("+three");
  });
});
