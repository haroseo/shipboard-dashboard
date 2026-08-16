export type RefreshState = "idle" | "loading" | "success" | "error";

export function formatRefreshTime(value: string | null, locale = "en-US"): string {
  if (!value) return "Not refreshed yet";
  return new Date(value).toLocaleString(locale);
}

export function nextRefreshState(current: RefreshState, event: "start" | "success" | "error"): RefreshState {
  if (event === "start") return "loading";
  if (event === "success") return "success";
  if (event === "error") return "error";
  return current;
}
