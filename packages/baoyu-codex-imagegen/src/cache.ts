import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, copyFile, stat, open, unlink } from "node:fs/promises";
import { openSync, closeSync, writeFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export async function cacheKey(prompt: string, aspect: string, refs: string[]): Promise<string> {
  const h = createHash("sha256");
  h.update(prompt);
  h.update("|");
  h.update(aspect);
  h.update("|");
  for (const r of [...refs].sort()) {
    h.update(r);
    h.update("\0");
    h.update(await readFile(r));
    h.update("\0");
  }
  return h.digest("hex").slice(0, 16);
}

export async function lookupCache(cacheDir: string, key: string): Promise<string | null> {
  const entry = path.join(cacheDir, `${key}.png`);
  try {
    const s = await stat(entry);
    if (s.size <= 1000) return null;
    const handle = await open(entry, "r");
    try {
      const signature = Buffer.alloc(PNG_SIGNATURE.length);
      const { bytesRead } = await handle.read(signature, 0, signature.length, 0);
      if (bytesRead === signature.length && signature.equals(PNG_SIGNATURE)) return entry;
    } finally {
      await handle.close();
    }
  } catch {}
  return null;
}

export async function storeCache(cacheDir: string, key: string, sourcePath: string): Promise<void> {
  await mkdir(cacheDir, { recursive: true });
  const entry = path.join(cacheDir, `${key}.png`);
  await copyFile(sourcePath, entry);
}

export class FileLock {
  private fd: number | null = null;
  private readonly token = randomUUID();
  constructor(private lockPath: string) {}

  async acquire(timeoutMs = 30_000): Promise<void> {
    const start = Date.now();
    await mkdir(path.dirname(this.lockPath), { recursive: true });
    while (Date.now() - start < timeoutMs) {
      try {
        this.fd = openSync(this.lockPath, "wx");
        writeFileSync(this.fd, JSON.stringify({ pid: process.pid, token: this.token, createdAt: Date.now() }));
        return;
      } catch (e: any) {
        if (e.code !== "EEXIST") throw e;
        if (await this.isStale()) {
          await this.removeStaleLock();
          continue;
        }
        await delay(200);
      }
    }
    throw new Error(`Failed to acquire lock at ${this.lockPath} within ${timeoutMs}ms`);
  }

  private async isStale(): Promise<boolean> {
    try {
      const s = await stat(this.lockPath);
      if (Date.now() - s.mtimeMs <= 10 * 60 * 1000) return false;
      try {
        const owner = JSON.parse(await readFile(this.lockPath, "utf8"));
        if (Number.isInteger(owner.pid) && isProcessAlive(owner.pid)) return false;
      } catch {}
      return true;
    } catch {
      return true;
    }
  }

  private async removeStaleLock(): Promise<void> {
    let snapshot;
    try {
      snapshot = await readFile(this.lockPath, "utf8");
    } catch {
      return;
    }
    if (!(await this.isStale())) return;
    try {
      if ((await readFile(this.lockPath, "utf8")) === snapshot) await unlink(this.lockPath);
    } catch {}
  }

  async release(): Promise<void> {
    if (this.fd != null) {
      try {
        closeSync(this.fd);
      } catch {}
      this.fd = null;
    }
    try {
      const owner = JSON.parse(await readFile(this.lockPath, "utf8"));
      if (owner.token === this.token) await unlink(this.lockPath);
    } catch {}
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error: any) {
    return error.code !== "ESRCH";
  }
}
