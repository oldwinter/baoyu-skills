# Testing Strategy

本仓库包含许多 scripts，但它们并不共享单一 runtime 或 dependency graph。最低风险的测试策略是先从稳定的 Node-based library code 开始，再向 CLI 和 skill-specific smoke tests 扩展。

## Current Baseline

- Root test runner：`node:test`
- Entry point：`npm test`
- Coverage command：`npm run test:coverage`
- CI trigger：GitHub Actions，在 `push`、`pull_request` 和 manual dispatch 时运行

这样可以避免在一个已经混合 plain Node scripts、Bun-based skill packages、npm-published shared packages 和 browser automation 的仓库中引入 Jest/Vitest。

## Rollout Plan

### Phase 1：Stable library coverage

优先覆盖 `scripts/lib/` 下的 pure functions。

- `scripts/lib/release-files.mjs`
- `scripts/verify-shared-package-deps.mjs`

Goals：

- 验证 file filtering 和 release packaging rules
- 捕捉重新引入 local `file:` dependencies 或 vendored workspace packages 的回归
- 保持 tests deterministic，且不依赖 network、Bun 或 browser

### Phase 2：Root CLI integration tests

为已经支持 dry-run 或 local-only flows 的 root CLIs 添加基于 temp-directory 的 integration tests。

- `scripts/verify-shared-package-deps.mjs`
- `scripts/publish-skill.mjs --dry-run`
- `scripts/sync-clawhub.mjs` argument handling 和 local skill discovery

Goals：

- 断言常见流程的 exit codes 和 stdout
- 覆盖 CLI argument parsing，且不访问 external services

### Phase 3：Skill script smoke tests

为选定的 `skills/*/scripts/` packages 添加 opt-in smoke tests，优先选择：

- 接受 local input files
- 输出 deterministic
- 不要求 authenticated browser sessions

Examples：

- markdown transforms
- file conversion helpers
- local content analyzers

默认 CI 路径中不要包含 browser automation、login flows 和 live API publishing scripts，除非它们被显式 mock。

### Phase 4：Coverage gates

当稳定 Node 路径有足够广度后，在 CI 中加入 coverage thresholds。

Recommended order：

1. 先只报告
2. 为 `scripts/lib/**` 添加 line/function thresholds
3. 等 skill-level smoke tests 可靠后再扩展 include patterns

## Conventions For New Tests

- 优先使用 temp directories，而不是 committed fixtures；除非 fixture 会被大量复用
- 先测试 exported functions，再测试 CLI wrappers
- 默认 CI 避免 network、browser 和 credential dependencies
- 保持 tests isolated，使其可以用 plain `node --test` 运行
