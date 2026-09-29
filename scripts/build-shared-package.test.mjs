import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./build-shared-package.mjs", import.meta.url));

test("build rejects an output directory that is the package root", async (t) => {
  const packageDir = await fs.mkdtemp(path.join(os.tmpdir(), "baoyu-build-root-"));
  t.after(() => fs.rm(packageDir, { recursive: true, force: true }));

  const sentinel = path.join(packageDir, "keep.txt");
  await fs.writeFile(sentinel, "must survive");

  const result = spawnSync(
    process.execPath,
    [scriptPath, "--package-dir", packageDir, "--out-dir", "."],
    { encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--out-dir must resolve inside the package directory/);
  assert.equal(await fs.readFile(sentinel, "utf8"), "must survive");
});
