# Chrome Profile

所有 CDP skills 共用同一个 profile directory。不要为每个 skill 创建独立 profile。

覆盖方式：`BAOYU_CHROME_PROFILE_DIR` env var（优先级高于所有默认值）。

| Platform | Default Path |
|----------|--------------|
| macOS | `~/Library/Application Support/baoyu-skills/chrome-profile` |
| Linux | `$XDG_DATA_HOME/baoyu-skills/chrome-profile`（fallback 为 `~/.local/share/`） |
| Windows | `%APPDATA%/baoyu-skills/chrome-profile` |
| WSL | Windows home `/.local/share/baoyu-skills/chrome-profile` |

新增 skills：只使用 `BAOYU_CHROME_PROFILE_DIR`，不要使用 `X_BROWSER_PROFILE_DIR` 这类 per-skill env vars。

## Implementation Pattern

```typescript
function getDefaultProfileDir(): string {
  const override = process.env.BAOYU_CHROME_PROFILE_DIR?.trim();
  if (override) return path.resolve(override);
  const base = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'baoyu-skills', 'chrome-profile');
}
```
