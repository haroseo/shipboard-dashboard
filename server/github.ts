const API = "https://api.github.com";

type GitHubOptions = { token: string; owner: string; repo: string };

async function githubFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 240)}`);
  }
  return response.status === 204 ? ({} as T) : response.json() as Promise<T>;
}

export async function listRepositories(token: string) {
  return githubFetch<Array<{ id: number; full_name: string; default_branch: string; private: boolean }>>("/user/repos?sort=updated&per_page=50", token);
}

export async function listCommits({ token, owner, repo }: GitHubOptions) {
  return githubFetch<Array<{ sha: string; message: string; html_url: string; author?: { login?: string }; commit: { message: string; author?: { date?: string } } }>>(`/repos/${owner}/${repo}/commits?per_page=10`, token);
}

export async function commitFile({ token, owner, repo, path, message, content, branch }: GitHubOptions & { path: string; message: string; content: string; branch: string; sha?: string }) {
  let sha: string | undefined;
  try {
    const current = await githubFetch<{ sha: string }>(`/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`, token);
    sha = current.sha;
  } catch (error) {
    if (!String(error).includes("GitHub API 404")) throw error;
  }
  return githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: "PUT",
    body: JSON.stringify({ message, content: Buffer.from(content, "utf8").toString("base64"), branch, ...(sha ? { sha } : {}) }),
  });
}

export async function listIssues({ token, owner, repo }: GitHubOptions) {
  return githubFetch<Array<{ id: number; number: number; title: string; state: "open" | "closed"; html_url: string; labels: Array<{ name: string }> }>>(`/repos/${owner}/${repo}/issues?state=all&per_page=50`, token);
}

export async function createIssue({ token, owner, repo, title, body }: GitHubOptions & { title: string; body?: string }) {
  return githubFetch(`/repos/${owner}/${repo}/issues`, token, { method: "POST", body: JSON.stringify({ title, body }) });
}

export async function updateIssue({ token, owner, repo, issueNumber, state }: GitHubOptions & { issueNumber: number; state: "open" | "closed" }) {
  return githubFetch(`/repos/${owner}/${repo}/issues/${issueNumber}`, token, { method: "PATCH", body: JSON.stringify({ state }) });
}

export async function listPullRequests({ token, owner, repo }: GitHubOptions) {
  return githubFetch<Array<{ id: number; number: number; title: string; state: "open" | "closed"; html_url: string; head: { ref: string }; base: { ref: string } }>>(`/repos/${owner}/${repo}/pulls?state=all&per_page=50`, token);
}

export async function createPullRequest({ token, owner, repo, title, body, head, base }: GitHubOptions & { title: string; body?: string; head: string; base: string }) {
  return githubFetch(`/repos/${owner}/${repo}/pulls`, token, { method: "POST", body: JSON.stringify({ title, body, head, base }) });
}

export async function dispatchWorkflow({ token, owner, repo, workflowId, ref }: GitHubOptions & { workflowId: string; ref: string }) {
  return githubFetch(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, token, { method: "POST", body: JSON.stringify({ ref }) });
}

export async function listWorkflowRuns({ token, owner, repo, workflowId }: GitHubOptions & { workflowId: string }) {
  return githubFetch<{ workflow_runs: Array<{ id: number; status: "queued" | "in_progress" | "completed"; conclusion: "success" | "failure" | "cancelled" | null; html_url: string; created_at: string }> }>(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=10`, token);
}
