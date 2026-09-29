import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./publish-skill.mjs", import.meta.url));

async function makeFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "baoyu-publish-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const skillDir = path.join(root, "demo");
  const configPath = path.join(root, "config.json");
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), "---\nname: demo\nversion: 1.0.0\n---\n");
  return { skillDir, configPath };
}

test("publish rejects non-loopback plaintext registries before making a request", async (t) => {
  const { skillDir, configPath } = await makeFixture(t);
  await fs.writeFile(configPath, JSON.stringify({ token: "secret" }));
  const result = spawnSync(process.execPath, [scriptPath, "--skill-dir", skillDir, "--version", "1.0.0", "--registry", "http://example.invalid"], {
    encoding: "utf8",
    env: { ...process.env, CLAWHUB_CONFIG_PATH: configPath },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Registry URL must use HTTPS/);
});

test("publish reports malformed existing configuration", async (t) => {
  const { skillDir, configPath } = await makeFixture(t);
  await fs.writeFile(configPath, "{broken");
  const result = spawnSync(process.execPath, [scriptPath, "--skill-dir", skillDir, "--version", "1.0.0"], {
    encoding: "utf8",
    env: { ...process.env, CLAWHUB_CONFIG_PATH: configPath },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Failed to parse ClawHub config/);
  assert.doesNotMatch(result.stderr, /Not logged in/);
});
