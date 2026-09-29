import { test, expect } from "bun:test";
import { runCodexExec } from "./spawn.ts";
import { GenError } from "./types.ts";

test("missing codex executable returns codex_not_installed", async () => {
  const previousPath = process.env.PATH;
  process.env.PATH = "";
  try {
    await runCodexExec({ instruction: "test", timeoutMs: 1000 });
    throw new Error("expected runCodexExec to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(GenError);
    expect((error as GenError).kind).toBe("codex_not_installed");
    expect((error as GenError).retryable).toBe(false);
  } finally {
    if (previousPath === undefined) delete process.env.PATH;
    else process.env.PATH = previousPath;
  }
});
