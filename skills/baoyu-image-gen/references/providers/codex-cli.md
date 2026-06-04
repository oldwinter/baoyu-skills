# Codex CLI (`--provider codex-cli`)

当用户选择 `--provider codex-cli`、设置 `default_provider: codex-cli`，或请求“无需 OpenAI API key 的 Codex image generation”时阅读。此 provider 是围绕 bundled `scripts/codex-imagegen/main.ts`（从 `packages/baoyu-codex-imagegen` 同步）的轻量 baoyu-image-gen wrapper；它会启动 `codex exec --json --sandbox danger-full-access`，并把请求路由到 Codex CLI 内置 `image_gen` tool。Codex CLI 使用**用户自己的 Codex / ChatGPT subscription**，不会读取或发送 `OPENAI_API_KEY`。

## Prerequisites

```bash
npm install -g @openai/codex
codex login            # 使用用户的 OpenAI / Codex 账号登录
codex --version        # 确认 >= 0.130
```

底层 wrapper（`scripts/codex-imagegen/main.ts`，带 `#!/usr/bin/env bun`）需要 `bun`。如果 runtime 中缺少 `bun`，可用 `npx -y bun` 作为 fallback。

## Selection

- **绝不自动选择。** `detectProvider` 只有在显式固定时才会选择 `codex-cli`：传入 `--provider codex-cli`，或在 EXTEND.md 中设置 `default_provider: codex-cli`。
- 以下情况选择此 provider：
  - 用户有 Codex subscription，并明确不想管理 OpenAI API key。
  - 你需要 Codex 特定的 `image_gen` 行为或质量。
- 当 latency 重要时避免使用此 provider：Codex CLI 通常比直接 OpenAI / Google API 调用慢 5–10 倍（cache hits 除外）。

## Supported flags

| Flag | Behavior |
|------|----------|
| `--prompt <text>` / `--promptfiles <files>` | Required。写入 temp file，并作为 `--prompt-file` 传给 wrapper。 |
| `--image <path>` | Required。最终输出 PNG 位置。 |
| `--ar <ratio>` | 映射到 wrapper 的 `--aspect`。Codex 支持：`1:1`（默认）、`16:9`、`9:16`、`4:3`、`2.35:1`。 |
| `--ref <files...>` | 映射到 wrapper 的重复 `--ref`。Codex 的 `image_gen` 接受 reference images，用于 style/composition guidance。 |
| `--n` | 必须是 `1`。如果 `n > 1`，`validateArgs` 会抛错，因为 Codex `image_gen` 每次调用只返回一张图。 |
| `--imageApiDialect` | 不适用。如果设为非默认值则抛错。 |
| `--size`, `--imageSize`, `--quality` | 静默忽略；Codex 根据 aspect ratio 选择 pixel dimensions。 |
| `--model`, `-m` | 仅作为逻辑标签。Wrapper 不向 Codex 转发 model selector；底层 engine 是 Codex 当前 `image_gen` 使用的任意模型。默认标签：`codex-image-gen`。 |

## Environment variables

| Variable | Effect |
|----------|--------|
| `BAOYU_CODEX_IMAGEGEN_BIN` | 覆盖 wrapper 路径。默认：相对此 skill 安装位置解析 bundled `scripts/codex-imagegen/main.ts`。接受 `.ts` 文件（用 `bun` 启动）或 legacy `.sh`/binary（直接启动）。 |
| `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` | 启用 wrapper 的 idempotency cache。默认禁用；高价值复用可设为例如 `~/.cache/baoyu-codex-imagegen`。 |
| `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS` | 每次 `codex exec` attempt 的 timeout（ms）。默认：`300000`（5 min）。慢网络或大 prompt 时可调高。 |
| `BAOYU_CODEX_IMAGEGEN_RETRIES` | Wrapper 侧对 retryable errors 的重试次数。默认：`2`（总共 3 次 attempts）。 |
| `BAOYU_CODEX_IMAGEGEN_LOG_FILE` | 追加 structured JSONL diagnostic log。排查 timeouts 或 `agent_refused` errors 时有用。 |
| `BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY` | `codex-cli` provider 的 batch-mode concurrency。默认：`1`；Codex exec 是重型单进程 workflow，提高这个值通常帮助不大。 |
| `BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS` | Batch-mode 最小启动间隔。默认：`2000` ms。 |

## Error model

Wrapper 会在 stdout 输出单行 JSON。失败时：

```json
{"status":"error","path":"...","bytes":0,"error":"...","error_kind":"..."}
```

Provider 会将每个 wrapper error 重新抛为 `Invalid codex-cli result (<error_kind>): <message>`。`"Invalid "` 前缀会触发 `isRetryableGenerationError`，在 baoyu-image-gen 外层 retry loop 中将其标记为**不可重试**；wrapper 已经按 `BAOYU_CODEX_IMAGEGEN_RETRIES` 在内部重试过，因此从 main.ts 再启动 Codex 只会成倍增加 latency，而不会改变结果。

预期 `error_kind` 值：

| Kind | Cause | Action |
|------|-------|--------|
| `codex_not_installed` | `PATH` 上没有 `codex` 或不可读 | `npm install -g @openai/codex`，然后 `codex login`。 |
| `invalid_args` | Spawn invocation 中的 programmer error | 检查 provider source；通常是 path-injection guard 触发。 |
| `prompt_file_missing` | Temp prompt file 在调用中途消失 | 重试一次；检查 `$TMPDIR` 权限。 |
| `spawn_failed` | OS / process-launch failure | 验证 `bun` 或 `npx` 已安装；检查 filesystem permissions。 |
| `timeout` | `codex exec` 超过 `--timeout` | 调高 `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS`；检查网络。 |
| `no_image_gen_tool_use` | Codex agent 没有调用 `image_gen` 就回答了 | 通常是暂时性问题，可重试；如果持续出现，优化 prompt。 |
| `output_missing` / `invalid_png` | Agent 报告成功，但文件不存在或不是有效 PNG | 重试；检查磁盘空间。 |
| `agent_refused` | Codex agent 拒绝（policy 或 content） | 调整 prompt；将拒绝原因告知用户。 |
| `lock_busy` | 另一个 `codex-imagegen` invocation 持有 file lock | 等待，或为并发调用方设置不同 `--cache-dir`。 |

## Trade-offs

- 慢：比直接 OpenAI API latency 慢 5–10 倍（cache hits 除外）。
- 受与交互式 `codex exec` 使用相同的 TOS 约束；从 baoyu-image-gen 程序化调用属于同一 usage class。
- 有状态：需要 `codex login` 仍然有效；session 过期可能表现为 `codex_not_installed` 或 `agent_refused`。

## See also

- `references/codex-oauth-vs-openai-api-key.md` — 为什么 Codex OAuth 不能与 `OPENAI_API_KEY` 互换。
- `references/codex-image2-fallback.md` — 何时从失败的 `openai` provider 调用回退到 `codex-cli`。
