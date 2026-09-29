import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./verify-skill-release-commits.mjs", import.meta.url));

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("new-branch push validates every event commit", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "baoyu-release-push-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "test@example.com"]);
  git(root, ["config", "user.name", "Test"]);
  await fs.mkdir(path.join(root, "skills", "demo"), { recursive: true });
  await fs.writeFile(path.join(root, "skills", "demo", "SKILL.md"), "demo\n");
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "Invalid skill subject"]);
  const first = git(root, ["rev-parse", "HEAD"]);
  await fs.writeFile(path.join(root, "README.md"), "docs\n");
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "docs: add readme"]);
  const second = git(root, ["rev-parse", "HEAD"]);
  const eventPath = path.join(root, "event.json");
  await fs.writeFile(eventPath, JSON.stringify({ before: "0".repeat(40), after: second, commits: [{ id: first }, { id: second }] }));

  const result = spawnSync(process.execPath, [scriptPath], { cwd: root, encoding: "utf8", env: { ...process.env, GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: second } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid skill subject/);
  assert.match(result.stderr, /Conventional Commit/);
});
