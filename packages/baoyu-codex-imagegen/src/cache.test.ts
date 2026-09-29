import { test, expect } from "bun:test";
import { mkdtemp, writeFile, readFile, rm, stat, unlink, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { cacheKey, lookupCache, storeCache, FileLock } from "./cache.ts";

const fakePng = () => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(2000)]);

test("cacheKey is deterministic, order-independent, and content-sensitive for refs", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cig-key-"));
  try {
    const a = path.join(dir, "a.png");
    const b = path.join(dir, "b.png");
    await writeFile(a, "first");
    await writeFile(b, "second");
    const k1 = await cacheKey("hello", "16:9", [a, b]);
    const k2 = await cacheKey("hello", "16:9", [b, a]);
    expect(k1).toBe(k2);
    await writeFile(a, "changed");
    expect(await cacheKey("hello", "16:9", [a, b])).not.toBe(k1);
    const k3 = await cacheKey("hello", "16:9", []);
    expect(k3).not.toBe(k1);
    const k4 = await cacheKey("hello", "1:1", []);
    expect(k4).not.toBe(k3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("lookupCache returns null on miss, path on hit", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cig-test-"));
  try {
    expect(await lookupCache(dir, "abc")).toBeNull();
    const fake = path.join(dir, "abc.png");
    await writeFile(fake, Buffer.alloc(2000));
    expect(await lookupCache(dir, "abc")).toBeNull();
    await writeFile(fake, fakePng());
    expect(await lookupCache(dir, "abc")).toBe(fake);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("storeCache copies source into cache", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cig-test-"));
  const src = path.join(dir, "src.png");
  try {
    await writeFile(src, fakePng());
    await storeCache(dir, "key1", src);
    const cached = await lookupCache(dir, "key1");
    expect(cached).not.toBeNull();
    const a = await readFile(src);
    const b = await readFile(cached!);
    expect(a.equals(b)).toBe(true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("FileLock prevents concurrent acquisition", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cig-lock-"));
  try {
    const lockPath = path.join(dir, "x.lock");
    const lock1 = new FileLock(lockPath);
    const lock2 = new FileLock(lockPath);
    await lock1.acquire(1000);
    let lock2Acquired = false;
    const p = lock2.acquire(500).then(() => (lock2Acquired = true)).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
    expect(lock2Acquired).toBe(false);
    await lock1.release();
    await p;
    expect(lock2Acquired).toBe(true);
    await lock2.release();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("FileLock does not steal an old lock from a live owner", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cig-lock-live-"));
  try {
    const lockPath = path.join(dir, "x.lock");
    const lock1 = new FileLock(lockPath);
    const lock2 = new FileLock(lockPath);
    await lock1.acquire(1000);
    const old = new Date(Date.now() - 11 * 60 * 1000);
    await utimes(lockPath, old, old);
    await expect(lock2.acquire(300)).rejects.toThrow(/Failed to acquire lock/);
    await lock1.release();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("FileLock release does not remove a replacement owner's lock", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "cig-lock-owner-"));
  try {
    const lockPath = path.join(dir, "x.lock");
    const lock1 = new FileLock(lockPath);
    const lock2 = new FileLock(lockPath);
    await lock1.acquire(1000);
    await unlink(lockPath);
    await lock2.acquire(1000);
    await lock1.release();
    expect((await stat(lockPath)).isFile()).toBe(true);
    await lock2.release();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
