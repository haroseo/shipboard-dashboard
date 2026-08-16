export type DeploymentStatus = "success" | "failure" | "progress";

export function mapWorkflowStatus(status: string | undefined, conclusion: string | null | undefined, fallback: DeploymentStatus = "progress"): DeploymentStatus {
  if (status === "completed") return conclusion === "success" ? "success" : "failure";
  if (status === "queued" || status === "in_progress") return "progress";
  return fallback;
}

export function buildUnifiedDiff(original: string, current: string): string[] {
  const before = original.split("\n");
  const after = current.split("\n");
  const lines = ["@@ -1," + before.length + " +1," + after.length + " @@"];
  const max = Math.max(before.length, after.length);
  for (let index = 0; index < max; index += 1) {
    const oldLine = before[index];
    const newLine = after[index];
    if (oldLine === newLine && oldLine !== undefined) lines.push(` ${oldLine}`);
    else {
      if (oldLine !== undefined) lines.push(`-${oldLine}`);
      if (newLine !== undefined) lines.push(`+${newLine}`);
    }
  }
  return lines;
}
