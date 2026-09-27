#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncStagingTree } from "./sync-staging-tree.mjs";

const token = process.env.STAGING_REPO_TOKEN || "";
const repository = process.env.STAGING_REPOSITORY || "parksmithh/simple-liturgy-staging";

if (!token) {
  console.error("STAGING_REPO_TOKEN is not set. Refusing to publish.");
  process.exit(1);
}
if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
  console.error("STAGING_REPOSITORY must be owner/name.");
  process.exit(1);
}

function redact(text) {
  return text.split(token).join("***");
}

function runGit(args, cwd) {
  const result = spawnSync(
    "git",
    ["-c", `http.extraheader=AUTHORIZATION: bearer ${token}`, ...args],
    { cwd, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } },
  );
  return {
    status: result.status ?? 1,
    output: redact(`${result.stdout || ""}${result.stderr || ""}`),
  };
}

function git(args, cwd) {
  const result = runGit(args, cwd);
  if (result.status !== 0) throw new Error(result.output.trim() || `git ${args[0]} failed`);
  return result.output;
}

const dest = await mkdtemp(join(tmpdir(), "simple-liturgy-staging-"));
try {
  const url = `https://github.com/${repository}.git`;
  const clone = runGit(["clone", "--depth", "1", "--branch", "main", url, dest], tmpdir());
  if (clone.status !== 0) {
    const empty = /Remote branch main not found|empty repository/i.test(clone.output);
    if (!empty) throw new Error(clone.output.trim() || "git clone failed");
    await rm(dest, { recursive: true, force: true });
    git(["init", "-b", "main", dest], tmpdir());
    git(["remote", "add", "origin", url], dest);
  }
  await syncStagingTree(process.cwd(), dest);
  git(["config", "user.name", "github-actions[bot]"], dest);
  git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], dest);
  git(["add", "-A", "--", ".", ":!.github/workflows"], dest);
  const stagedWorkflows = git(["diff", "--cached", "--name-only", "--", ".github/workflows"], dest).trim();
  if (stagedWorkflows) throw new Error(`Refusing to push workflow changes:\n${stagedWorkflows}`);
  const dirtyWorkflows = git(["status", "--porcelain", "--", ".github/workflows"], dest).trim();
  if (dirtyWorkflows) throw new Error(`Refusing to leave workflow changes:\n${dirtyWorkflows}`);
  const staged = git(["diff", "--cached", "--name-only"], dest).trim();
  if (!staged) {
    console.log("staging tree is already current");
  } else {
    const sha = process.env.GITHUB_SHA || "unknown";
    git(["commit", "-m", `Publish staging-${sha}`], dest);
    git(["push", "origin", "HEAD:main"], dest);
    console.log(`pushed staging-${sha}`);
  }
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
} finally {
  await rm(dest, { recursive: true, force: true });
}
