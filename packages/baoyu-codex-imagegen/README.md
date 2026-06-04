# baoyu-codex-imagegen

从非 Codex runtime（例如 Claude Code）通过 Codex CLI 内置的 `image_gen` 工具生成图片。Wrapper 会启动 `codex exec --json`，并使用用户已有的 Codex subscription 驱动图片生成：**不需要 `OPENAI_API_KEY`**。

该 package 实现了 `baoyu-skills` plugin 中多处引用的 `preferred_image_backend: codex-imagegen` 配置键，也是 `baoyu-image-gen --provider codex-cli` 背后的 engine。

## Layout

```text
packages/baoyu-codex-imagegen/
├── src/
│   ├── main.ts             # CLI orchestrator (executable via `#!/usr/bin/env bun`)
│   ├── spawn.ts            # codex exec child-process wrapper
│   ├── parser.ts           # JSONL event-stream parser
│   ├── validator.ts        # Output PNG / image_gen-invocation verification
│   ├── cache.ts            # SHA256 idempotency cache + file lock
│   ├── logger.ts           # Structured JSONL logging
│   ├── types.ts            # Shared types and `GenError`
│   └── *.test.ts           # Bun unit tests
└── package.json            # `bin` points to `src/main.ts`
```

## Prerequisites

```bash
npm install -g @openai/codex
codex login            # 使用你的 OpenAI account（subscription）登录
codex --version        # 确认 >= 0.130
```

运行 wrapper 需要 `bun`：

```bash
brew install oven-sh/bun/bun
```

如果 `bun` 不在 `PATH`，可 fallback 到 `npx -y bun src/main.ts …`。

## Usage

```bash
# Inline prompt (executes via shebang once bun is on PATH)
./src/main.ts \
  --image /tmp/cat.png \
  --prompt "A friendly orange cat, watercolor"

# Or invoke bun explicitly
bun src/main.ts \
  --image cover.png \
  --prompt-file prompts/01-cover.md \
  --aspect 16:9 \
  --cache-dir ~/.cache/baoyu-codex-imagegen

# Without bun installed
npx -y bun src/main.ts --image cover.png --prompt "..."
```

Stdout 输出单行 JSON：

```json
{"status":"ok","path":"…","bytes":1234567,"elapsed_seconds":62,"thread_id":"…","attempts":1,"cached":false,"usage":{…}}
```

失败时：

```json
{"status":"error","path":"…","bytes":0,"error":"…","error_kind":"timeout"}
```

`error_kind` values：`codex_not_installed`、`invalid_args`、`prompt_file_missing`、`spawn_failed`、`timeout`、`no_image_gen_tool_use`、`output_missing`、`invalid_png`、`agent_refused`、`lock_busy`。

## Options

| Flag | Description |
|---|---|
| `--image <path>` | Output PNG path（required） |
| `--prompt <text>` | Prompt text |
| `--prompt-file <path>` | 从文件读取 prompt（与 `--prompt` 互斥） |
| `--aspect <ratio>` | Aspect ratio（`1:1`、`16:9`、`9:16`、`4:3`、`2.35:1`）。Default：`1:1` |
| `--ref <file>` | Reference image（可重复） |
| `--timeout <ms>` | Codex exec timeout，单位 ms。Default：`300000` |
| `--retries <n>` | Retryable errors 的 retry attempts。Default：`2` |
| `--retry-delay <ms>` | Base retry delay（exponential）。Default：`1500` |
| `--cache-dir <path>` | 启用 idempotency cache。默认禁用。 |
| `--log-file <path>` | Append structured JSONL log |
| `-v, --verbose` | Verbose stderr logging |
| `-h, --help` | Show help |

## Test

```bash
cd packages/baoyu-codex-imagegen
bun test
```

## Trade-offs

- 比直接调用 OpenAI API 慢 5–10 倍（cache hits 除外）
- 使用你的 Codex subscription：通过 `codex exec` 编程调用时，适用范围与交互式使用相同
- 需要 `codex` CLI 和有效 login session

完整背景见 [`docs/codex-imagegen-backend.md`](../../docs/codex-imagegen-backend.md)。
