# `codex-imagegen` Backend

从非 Codex runtime（例如 Claude Code）通过 Codex CLI 内置的 `image_gen` 工具生成图片。Wrapper 会启动 `codex exec --json`，并让用户已有的 Codex subscription 驱动图片生成：**不需要 `OPENAI_API_KEY`**。

该 backend 实现了本仓库多个 `SKILL.md` 中已经引用的 `preferred_image_backend: codex-imagegen` 配置键。

## Features

| Feature | Status |
|---------|--------|
| **Reliability**：retry + exponential backoff | 默认 2 次 retries |
| **Verification**：确认 `image_gen` 确实被调用（未被绕过） | 检查 `$CODEX_HOME/generated_images/{thread_id}/` |
| **Verification**：PNG magic-byte sanity check | ✓ |
| **Idempotency cache**：同一 prompt+aspect+refs 复用输出 | `--cache-dir` |
| **Concurrency control**：file lock 防止并行 `codex exec` 冲突 | Built-in |
| **Structured logging**：JSONL log file | `--log-file` |
| **Token usage returned** | 嵌入 result JSON |
| **`--ref` reference images** | 可重复传入 |
| **Unit tests** | 16 tests（parser / cache / validator） |
| **Error classification**：retryable vs non-retryable | 9 个 `error_kind` values |

## Why this backend

| Scenario | Conventional backend | This backend |
|----------|----------------------|--------------|
| 你已有 Codex subscription | OpenAI Images API 按图片计费会累积成本 | Subscription 已覆盖，边际 API 成本为零 |
| 没有 `OPENAI_API_KEY` | `baoyu-image-gen` 需要 API key | `codex login` 即可 |
| 想使用 GPT Image 2 | 只能通过 OpenAI API | Codex 的 `image_gen` *就是* GPT Image 2 |

## Prerequisites

```bash
npm install -g @openai/codex
codex login            # 使用你的 OpenAI account（subscription）登录
codex --version        # 确认 >= 0.130
```

运行 wrapper 需要 `bun`。macOS：

```bash
brew install oven-sh/bun/bun
```

如果 `bun` 不在 `PATH`，fallback 到 `npx -y bun packages/baoyu-codex-imagegen/src/main.ts …`。

## Usage

### Direct CLI

```bash
# Inline prompt
bun packages/baoyu-codex-imagegen/src/main.ts \
  --image /tmp/cat.png \
  --prompt "A friendly orange cat, watercolor"

# Prompt from file
bun packages/baoyu-codex-imagegen/src/main.ts \
  --image cover.png \
  --prompt-file prompts/01-cover.md \
  --aspect 16:9

# Verbose mode for debugging
bun packages/baoyu-codex-imagegen/src/main.ts -v --image dog.png --prompt "A corgi" --aspect 1:1
```

### Through `baoyu-image-gen`

```bash
${BUN_X} skills/baoyu-image-gen/scripts/main.ts \
  --provider codex-cli \
  --prompt "A friendly orange cat, watercolor" \
  --image /tmp/cat.png \
  --ar 1:1
```

`codex-cli` provider 会在内部启动 bundled `codex-imagegen` TS entrypoint，并通过 baoyu-image-gen 的标准 CLI + batch flow 暴露其 retry/cache 机制。

成功时，stdout 输出单行 JSON：

```json
{"status":"ok","path":"/tmp/cat.png","bytes":2567101,"elapsed_seconds":53}
```

失败时，exit code 非零，stderr 包含错误消息。

### Enabling within image skills

生成图片的 skills（例如 `baoyu-cover-image`、`baoyu-article-illustrator`）已经支持 `preferred_image_backend` preference。要把它们路由到该 backend，在对应 `EXTEND.md` 中设置：

```yaml
# ~/.baoyu-skills/baoyu-cover-image/EXTEND.md
preferred_image_backend: codex-imagegen
```

当 LLM 运行该 skill 时，它会读取 preference，并在 `CLAUDE.md` 中 `### codex-imagegen Backend` section 的指导下调用 `bun packages/baoyu-codex-imagegen/src/main.ts`。

> **Note**：该集成由 LLM 阅读 `CLAUDE.md` 进行中介，并不是 hard binding。如果某个 skill 没有自动路由到该 backend，在 prompt 中显式提及它即可。

## Parameters

| Flag | Required | Description |
|------|----------|-------------|
| `--image <path>` | ✓ | Output PNG path（建议绝对路径；相对路径按 cwd 解析） |
| `--prompt <text>` | one of | Prompt string（与 `--prompt-file` 互斥） |
| `--prompt-file <path>` | one of | 从文件读取 prompt（与 `--prompt` 互斥） |
| `--aspect <ratio>` | | Aspect ratio。默认 `1:1`。常见：`16:9`、`9:16`、`4:3`、`2.35:1` |
| `--ref <file>` | | Reference image path（可重复） |
| `--timeout <ms>` | | `codex exec` timeout，单位 ms。默认 `300000` |
| `--retries <n>` | | Retryable errors 的 retry count。默认 `2`（total attempts = retries + 1） |
| `--retry-delay <ms>` | | retries 间的 base delay（exponential backoff）。默认 `1500` |
| `--cache-dir <path>` | | 启用 idempotency cache（同一 prompt+aspect+refs 复用输出） |
| `--log-file <path>` | | Structured JSONL log path（append） |
| `-v` / `--verbose` | | 同步把 log entries 输出到 stderr |
| `-h` / `--help` | | 显示 usage |

## Structured Output

成功时，stdout 包含单行 JSON：

```json
{
  "status": "ok",
  "path": "/tmp/owl.png",
  "bytes": 1693831,
  "elapsed_seconds": 87,
  "thread_id": "019e40e8-daef-7c60-943d-5e7bb3f6cb3d",
  "attempts": 1,
  "cached": false,
  "usage": {
    "input": 110899,
    "cached_input": 83456,
    "output": 457,
    "reasoning": 47
  },
  "tool_calls": [
    {"tool": "shell", "status": "completed"},
    {"tool": "agent_message", "status": "completed"}
  ]
}
```

Cache hits 会返回 `elapsed_seconds: 0`、`cached: true`、`attempts: 0`。

失败时，exit code 为 `1`，JSON 包含 `error` 和 `error_kind`：

```json
{
  "status": "error",
  "error": "image_gen was not invoked: no PNG in ...",
  "error_kind": "no_image_gen_tool_use"
}
```

## Error Kinds

| `error_kind` | Retryable | Meaning |
|--------------|-----------|---------|
| `codex_not_installed` | ✗ | 找不到 `codex` CLI |
| `invalid_args` | ✗ | Argument parsing error |
| `prompt_file_missing` | ✗ | `--prompt-file` path 不存在 |
| `spawn_failed` | ✓ | `codex exec` 非零退出 |
| `timeout` | ✓ | 超过 `--timeout` |
| `no_image_gen_tool_use` | ✓ | Agent 没有调用 `image_gen`（走了其他路径） |
| `output_missing` | ✓ | Output file 未创建 |
| `invalid_png` | ✓ | Output 不是有效 PNG |
| `agent_refused` | ✓ | Event stream 中没有 `thread_id`（Codex 拒绝响应） |
| `lock_busy` | ✗ | Concurrency lock acquisition timed out |

## Measured Performance

| Metric | Value |
|--------|-------|
| First-run latency | 50–90 s |
| Cache-hit latency | < 0.3 s |
| Output dimensions | 1024×1024、1672×941（16:9）等，由 `image_gen` 选择 |
| Output format | PNG（RGB，8-bit） |
| Token usage per call | 约 110k input（约 80k cached）+ 约 500 output |
| Quota source | Codex subscription（不消耗 OpenAI API quota） |
| Default timeout | 300 s（5 min） |

## Limitations & Risks

1. **比 direct API 慢 5–10 倍**。`codex exec` 会 cold-start agent，加载内置 `image_gen` SKILL.md，并在调用工具前运行 reasoning。重复 prompts 可通过 cache hits 避免该成本。
2. **ToS gray area**。Codex 的 `image_gen` tool 设计用于交互式使用。通过 `codex exec` 从外部 agent 以编程方式调用，目前 OpenAI policies 没有明确覆盖。建议 guardrails：
   - 个人、低频使用是合理的。
   - 不建议用于 production automation 或高频 batch jobs。
   - 用户需自行确保用法符合适用 terms of service。
3. **Sandbox permissions**。Wrapper 传入 `--sandbox danger-full-access`，以便 spawned agent 能把渲染出的 PNG 从 `$CODEX_HOME/generated_images/` 移到用户指定 output path。这是必要的，因为 agent 必须 `cp`/`mv` 文件。
4. **Concurrency = 1**。File lock 会串行化并发调用，以避免 `codex exec` 冲突。Parallel calls 会排队。

## Troubleshooting

| Symptom | `error_kind` | Resolution |
|---------|--------------|------------|
| `command not found: codex` | `codex_not_installed` | `npm install -g @openai/codex` |
| `codex exec` fails | `spawn_failed` | 检查 `codex login` 状态；查看 `raw_log` path |
| Timeout | `timeout` | 慢网络可传 `--timeout 600000`（10 min） |
| Agent skipped `image_gen` | `no_image_gen_tool_use` | 会自动 retry；可考虑强化 prompt，抽象 prompt 容易让 agent 跑偏 |
| Output missing | `output_missing` | Agent 没有 `cp` 到 target path；检查 `raw_log`，在 `generated_images/` 下找到实际保存位置 |
| Lock held | `lock_busy` | 等待 in-flight request 完成；或 `rm ~/.cache/baoyu-codex-imagegen/codex-exec.lock` |
| Low image quality | — | 强化 prompt，尝试不同 aspect，或提供 `--ref` |

## Architecture

```text
packages/baoyu-codex-imagegen/
├── src/
│   ├── main.ts             # parseArgs → cache → lock → retry loop → emit JSON (`#!/usr/bin/env bun`)
│   ├── types.ts            # CliOptions, GenerateResult, GenError, ErrorKind
│   ├── spawn.ts            # spawn codex exec --json --sandbox danger-full-access
│   ├── parser.ts           # parse JSONL event stream → toolCalls, usage, thread_id
│   ├── validator.ts        # verify image_gen invocation + PNG magic + file size
│   ├── cache.ts            # cacheKey(sha256), FileLock, lookup/store
│   ├── logger.ts           # JsonLogger (verbose stderr + JSONL file)
│   ├── parser.test.ts
│   ├── cache.test.ts
│   └── validator.test.ts
├── package.json            # workspace package: `bin` → `src/main.ts`, no build step
└── README.md
```

运行 tests：

```bash
cd packages/baoyu-codex-imagegen && bun test
```

## Internal Flow

```mermaid
flowchart LR
    CC[Claude Code / any caller]
    WRAPPER[bun packages/baoyu-codex-imagegen/<br/>src/main.ts]
    CODEX["codex exec --json<br/>--sandbox danger-full-access"]
    AGENT[Codex agent]
    TOOL[image_gen built-in tool]
    DEFAULT["$CODEX_HOME/<br/>generated_images/{thread_id}/"]
    OUT[/specified OUTPUT path/]

    CC -->|exec wrapper| WRAPPER
    WRAPPER -->|stdin: instruction| CODEX
    CODEX --> AGENT
    AGENT -->|tool call| TOOL
    TOOL -->|writes file| DEFAULT
    AGENT -->|agent cp/mv| OUT
    WRAPPER -->|verify + parse| CC

    classDef cc fill:#1e40af,color:#fff,stroke:#93c5fd
    classDef cdx fill:#7c2d12,color:#fff,stroke:#fdba74
    class CC,WRAPPER cc
    class CODEX,AGENT,TOOL cdx
```

## Design Decisions

1. **Pure TypeScript entrypoint**：`src/main.ts` 携带 `#!/usr/bin/env bun` shebang，并且是唯一入口。没有 shell shim：调用方可以直接运行 `bun src/main.ts …`，在 `bun` 位于 `PATH` 时把文件作为 executable 运行，或 fallback 到 `npx -y bun src/main.ts …`。这与项目的 `skills/<skill>/scripts/main.ts` 约定一致。
2. **`--sandbox danger-full-access`**：这是必要的，spawned agent 才能把渲染后的 PNG 从 `$CODEX_HOME/generated_images/` `cp`/`mv` 到用户指定 path。标准 sandboxes 会阻止该操作。
3. **Parse the JSONL event stream**：最终 `agent_message` 和中间 `command_execution` events 让 wrapper 能验证真实发生了什么（是否调用 `image_gen`？`cp` 是否到达正确 destination？），比抓取 freeform stdout 可靠得多。
4. **Shared package, not a skill**：该 backend 是 CLI utility，skills 通过 `preferred_image_backend` 路由到它，`baoyu-image-gen --provider codex-cli` 也会在内部启动它。它放在 `packages/` 下，与其他 shared workspaces（`baoyu-md`、`baoyu-chrome-cdp`、`baoyu-fetch`）并列，因为它没有 `SKILL.md`，也不会被 agent 直接加载。
5. **File lock instead of internal queue**：保持实现小巧，并能跨多个 shell sessions 或 processes 处理并发调用同一个 wrapper 的情况。

## Related Files

| File | Role |
|------|------|
| `packages/baoyu-codex-imagegen/src/main.ts` | TypeScript CLI entrypoint（`#!/usr/bin/env bun`） |
| `packages/baoyu-codex-imagegen/src/` | TypeScript implementation |
| `packages/baoyu-codex-imagegen/package.json` | Workspace manifest |
| `skills/baoyu-image-gen/scripts/providers/codex-cli.ts` | Provider adapter，让 `baoyu-image-gen --provider codex-cli` 能启动该 wrapper |
| `docs/codex-imagegen-backend.md` | 本文档 |
| `CLAUDE.md` | 告诉 LLMs 如何调用该 backend |
| `.github/workflows/codex-imagegen-tests.yml` | CI unit tests |
