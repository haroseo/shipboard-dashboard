import { describe, expect, it } from "vitest";
import { formatRefreshTime, nextRefreshState } from "./refreshStatus";

describe("refresh status helpers", () => {
  it("transitions manual refresh state", () => {
    expect(nextRefreshState("idle", "start")).toBe("loading");
    expect(nextRefreshState("loading", "success")).toBe("success");
    expect(nextRefreshState("loading", "error")).toBe("error");
  });

  it("formats empty and populated refresh timestamps", () => {
    expect(formatRefreshTime(null)).toBe("Not refreshed yet");
    expect(formatRefreshTime("2026-01-01T00:00:00.000Z", "en-US")).toContain("2026");
  });
});
