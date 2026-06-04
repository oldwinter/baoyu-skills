# ClawHub / OpenClaw Publishing

## OpenClaw Metadata

Skills 在 YAML front matter 中包含 `metadata.openclaw`：

```yaml
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#<skill-name>
    requires:          # only for skills with scripts
      anyBins:
        - bun
        - npx
```

## Publishing Commands

```bash
bash scripts/sync-clawhub.sh           # sync all skills
bash scripts/sync-clawhub.sh <skill>   # sync one skill
```

Release hooks 通过 `.releaserc.yml` 配置。本仓库不会暂存单独的 release directory：publish 会直接读取 skill directory，并验证 local package references 和 CLI bin targets 是否自包含。

每次 skill release 都必须保持该 skill `SKILL.md` 中的 `version:` 与将要发布的版本一致。`publish-skill.mjs` 和 `sync-clawhub.mjs` 都会拒绝 version mismatch，防止 registry payload 携带过期 skill metadata。

触及 `skills/<name>/**` 的 commits 必须使用 Conventional Commit subjects，例如 `fix(baoyu-post-to-wechat): handle WeChat editor focus`。CI 会针对 pushed 或 PR commit range 运行 `npm run verify:skill-release-commits`，防止 `Fix WeChat browser article publishing` 这类裸 subject 绕过 per-skill release versioning。

## Shared Workspace Packages

`packages/` 是 shared runtime code 的 source of truth。大多数 skills 通过 semver ranges 从 npm 消费 shared packages。`baoyu-url-to-markdown` 是例外：它把 `baoyu-fetch` runtime vendored 到 `skills/baoyu-url-to-markdown/scripts/lib/`，因此发布出的 skill 是自包含的，不依赖 `baoyu-fetch` npm package。

当前 packages：

- `baoyu-chrome-cdp`（Chrome CDP utilities），被 5 个 skills 使用：`baoyu-danger-gemini-web`、`baoyu-danger-x-to-markdown`、`baoyu-post-to-wechat`、`baoyu-post-to-weibo`、`baoyu-post-to-x`
- `baoyu-md`（shared Markdown rendering 和 placeholder pipeline），被 3 个 skills 使用：`baoyu-markdown-to-html`、`baoyu-post-to-wechat`、`baoyu-post-to-weibo`
- `baoyu-fetch`（URL-to-Markdown CLI），vendored 到 1 个 skill：`baoyu-url-to-markdown`

**How it works**：npm packages 从 `packages/` build，并发布到 public npm registry。Skills 通常用 `^<version>` specs 依赖这些 packages。Release prep 会运行 `node scripts/verify-shared-package-deps.mjs`，防止意外的 `file:` dependencies 回流。对 vendored skill runtimes，把复制后的代码保持在 skill directory 下，并在发布前运行 `node scripts/publish-skill.mjs --skill-dir <skill> --version <version> --dry-run`。

**Update workflow**：

1. 编辑 `packages/` 下的 package
2. 运行 package build，例如 `bun run --cwd packages/baoyu-md build`
3. 使用 `npm publish --access public` 发布变更后的 npm package
4. 如果 package version 变化，更新消费方 skill 的 `package.json` semver ranges
5. 运行 `node scripts/verify-shared-package-deps.mjs`

**Git hook**：运行一次 `node scripts/install-git-hooks.mjs` 启用 `pre-push` hook。当某个 skill 使用 local `file:` dependency 或 vendored workspace package 时，它会阻止 push。
