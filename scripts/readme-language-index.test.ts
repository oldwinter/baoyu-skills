import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UPSTREAM_ENGLISH = "https://github.com/JimLiu/baoyu-skills/blob/main/README.md";

function readRepoFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

test("README.md is the Chinese source and points English to upstream", () => {
  const readme = readRepoFile("README.md");

  assert.match(readme, /^# baoyu-skills\n\n中文 \| \[上游英文原文\]\(/);
  assert.ok(readme.includes(`[上游英文原文](${UPSTREAM_ENGLISH})`));
  assert.doesNotMatch(readme, /\[English\]\(\.\/README\.md\)/);
  assert.ok(readme.includes("npx skills add oldwinter/baoyu-skills"));
});

test("README.zh.md is a language index, not a second Chinese skill list", () => {
  const index = readRepoFile("README.zh.md");
  const readme = readRepoFile("README.md");

  assert.ok(index.length < 2_000, "README.zh.md should stay an index, not a full copy");
  assert.ok(index.length < readme.length / 10, "README.zh.md must be much shorter than README.md");
  assert.ok(index.includes("[中文说明](./README.md)"));
  assert.ok(index.includes(`[English (upstream)](${UPSTREAM_ENGLISH})`));
  assert.doesNotMatch(index, /\[English\]\(\.\/README\.md\)/);
  assert.ok(index.includes("不再平行维护第二份中文全文"));
  assert.ok(index.includes("npx skills add oldwinter/baoyu-skills"));
  assert.doesNotMatch(index, /^## 技能清单/m);
});

test("maintenance docs do not require dual-writing README.zh.md", () => {
  const claude = readRepoFile("CLAUDE.md");
  const comic = readRepoFile("docs/comic-style-maintenance.md");
  const release = readRepoFile(".claude/skills/release-skills/SKILL.md");

  assert.doesNotMatch(claude, /README\.md` \+ `README\.zh\.md/);
  assert.ok(claude.includes("不要再双写技能清单"));
  assert.doesNotMatch(comic, /两份 README/);
  assert.doesNotMatch(comic, /README\.md` \+ `README\.zh\.md/);
  assert.doesNotMatch(release, /git add README\.md README\.zh\.md/);
});
