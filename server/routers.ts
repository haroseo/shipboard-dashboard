import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { commitFile, createIssue, createPullRequest, dispatchWorkflow, listCommits, listIssues, listPullRequests, listRepositories, listWorkflowRuns, updateIssue } from "./github";

const repoInput = z.object({ token: z.string().min(1), owner: z.string().min(1), repo: z.string().min(1) });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  github: router({
    repositories: protectedProcedure.input(z.object({ token: z.string().min(1) })).query(({ input }) => listRepositories(input.token)),
    commits: protectedProcedure.input(repoInput).query(({ input }) => listCommits(input)),
    commitFile: protectedProcedure.input(repoInput.extend({ path: z.string().min(1), message: z.string().min(1), content: z.string(), branch: z.string().default("main") })).mutation(({ input }) => commitFile(input)),
    issues: protectedProcedure.input(repoInput).query(({ input }) => listIssues(input)),
    createIssue: protectedProcedure.input(repoInput.extend({ title: z.string().min(1), body: z.string().optional() })).mutation(({ input }) => createIssue(input)),
    updateIssue: protectedProcedure.input(repoInput.extend({ issueNumber: z.number().int(), state: z.enum(["open", "closed"]) })).mutation(({ input }) => updateIssue(input)),
    pullRequests: protectedProcedure.input(repoInput).query(({ input }) => listPullRequests(input)),
    createPullRequest: protectedProcedure.input(repoInput.extend({ title: z.string().min(1), body: z.string().optional(), head: z.string().min(1), base: z.string().default("main") })).mutation(({ input }) => createPullRequest(input)),
    redeploy: protectedProcedure.input(repoInput.extend({ workflowId: z.string().min(1), ref: z.string().default("main") })).mutation(({ input }) => dispatchWorkflow(input).then(() => ({ status: "progress" as const }))),
    workflowRuns: protectedProcedure.input(repoInput.extend({ workflowId: z.string().min(1) })).query(({ input }) => listWorkflowRuns(input)),
  }),
});

export type AppRouter = typeof appRouter;
