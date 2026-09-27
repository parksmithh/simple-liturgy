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

function git(args, cwd) {
  const result = spawnSync(
    "git",
    ["-c", `http.extraheader=AUTHORIZATION: bearer ${token}`, ...args],
    { cwd, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } },
  );
  const output = redact(`${result.stdout || ""}${result.stderr || ""}`);
  if (result.status !== 0) throw new Error(output.trim() || `git ${args[0]} failed`);
  return output;
}

const dest = await mkdtemp(join(tmpdir(), "simple-liturgy-staging-"));
try {
  const url = `https://github.com/${repository}.git`;
  git(["clone", "--depth", "1", "--branch", "main", url, dest], tmpdir());
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
