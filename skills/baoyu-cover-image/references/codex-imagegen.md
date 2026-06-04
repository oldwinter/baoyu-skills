# `codex-imagegen` Wrapper Invocation

仅当 [Image Generation Tools](../SKILL.md#image-generation-tools) 规则解析到 `codex-imagegen` 时加载此 reference，也就是当前 runtime 没有暴露原生 `imagegen` skill，但 `PATH` 上有 `codex` CLI 且已完成有效 `codex login`。

## Preferred path: route through `baoyu-image-gen`

如果当前 runtime 中可用 `baoyu-image-gen` skill，**始终**通过它调用，而不是直接调用 wrapper。它会以与其他 provider 一致的方式处理 retry/cache/batch/EXTEND.md preferences。

```bash
${BUN_X} <baoyu-image-gen-base>/scripts/main.ts \
  --provider codex-cli \
  --image <ABSOLUTE_output> \
  --promptfiles <ABSOLUTE_prompts/01-cover-[slug].md> \
  --ar <ratio> \
  [--ref <ABSOLUTE_file>]...
```

像解析任何 sibling skill 一样解析 `<baoyu-image-gen-base>`：通过 runtime 的 skill registry（`Skill` tool、plugin marketplace，或 `$HOME/.baoyu-skills/baoyu-image-gen/`）。

## Fallback: spawn the wrapper directly

仅当当前 runtime 未安装 `baoyu-image-gen` 时使用。必须在 runtime 中发现 wrapper 位置，不要从此 skill 硬编码 `../../packages/...`：

1. **Honor explicit override**：如果 `$BAOYU_CODEX_IMAGEGEN_BIN` 已设置且指向真实文件，使用该路径。它可以是 `.ts`（启动 `bun <path>`）或 `.sh`/binary（直接启动）。
2. **Search the plugin root**：从此 skill 目录向上查找 `packages/baoyu-codex-imagegen/src/main.ts`。如果找到，那就是 wrapper，用 `bun` 启动。
3. **Last resort**：告诉用户此 runtime 中 `codex-imagegen` 不可用，并询问是否安装 `baoyu-skills` plugin（或设置 `BAOYU_CODEX_IMAGEGEN_BIN`）或选择其他 backend。

定位后，调用形态如下：

```bash
bun <WRAPPER>/main.ts \
  --image <ABSOLUTE_output> \
  --prompt-file <ABSOLUTE_prompts/01-cover-[slug].md> \
  --aspect <ratio> \
  [--ref <ABSOLUTE_file>]... \
  [--timeout <ms>] \
  [--cache-dir ~/.cache/baoyu-codex-imagegen] \
  [--log-file <ABSOLUTE_jsonl_log_path>]
```

如果缺少 `bun`，可用 `npx -y bun <WRAPPER>/main.ts ...` 作为 fallback。

## Parameter notes

- **所有 filesystem inputs** 在相对路径时会自动按 `process.cwd()` 解析，但 agent 应传 absolute paths，以抵抗 cwd drift。
- **`--timeout`** 默认每次 `codex exec` attempt 为 `300000`（5 min）。慢网络或大 prompt 时可调高（例如 `--timeout 600000` 表示 10 min）。
- **`--cache-dir`** 默认关闭。可为可重复运行启用，以跳过相同 prompt+aspect+refs 的冗余生成。
- **Authentication**：wrapper 使用用户的 Codex subscription，不读取或发送 `OPENAI_API_KEY`。

## Stdout contract

单行 JSON：

- Success: `{"status":"ok","path":"...","bytes":N,"elapsed_seconds":N,"thread_id":"...","attempts":N,"cached":bool,...}`
- Failure: `{"status":"error","path":"...","bytes":0,"error":"...","error_kind":"..."}`

`error_kind` values: `codex_not_installed`, `invalid_args`, `prompt_file_missing`, `spawn_failed`, `timeout`, `no_image_gen_tool_use`, `output_missing`, `invalid_png`, `agent_refused`, `lock_busy`.

遇到 retryable errors（timeout, spawn_failed, no_image_gen_tool_use, output_missing, invalid_png, agent_refused）时，询问用户是重试还是回退到其他 backend。

## Batch semantics

- Codex `image_gen` 每次调用返回**一张图**（仅 `n=1`）。Multi-image jobs 必须为每张图分发一次 wrapper call。
- Wrapper 不接受 `--sessionId` flag。Chain/scene consistency 必须来自 `--ref` reference images。
- `--size` 和 `--quality` 会被静默忽略；Codex 根据 `--aspect` 选择 pixel dimensions。
