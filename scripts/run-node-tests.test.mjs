import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { collectTestFiles } from "./run-node-tests.mjs";

test("test discovery ignores generated output directories", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "baoyu-test-discovery-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.writeFile(path.join(root, "src", "source.test.mjs"), "");
  for (const directory of ["build", "coverage", "dist", "out"]) {
    await fs.mkdir(path.join(root, directory), { recursive: true });
    await fs.writeFile(path.join(root, directory, "stale.test.mjs"), "");
  }
  assert.deepEqual(await collectTestFiles(root), [path.join(root, "src", "source.test.mjs")]);
});
