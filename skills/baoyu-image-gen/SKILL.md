---
name: baoyu-image-gen
description: 通过 OpenAI GPT Image 2、Azure OpenAI、Google、OpenRouter、DashScope、Z.AI GLM-Image、MiniMax、Jimeng、Seedream、Replicate 和 Agnes APIs 进行 AI image generation。支持 text-to-image、reference images、aspect ratios，以及从已保存 prompt files 批量生成。默认 sequential；当用户已有多个 prompts 或需要稳定多图吞吐时使用 batch parallel generation。用户要求生成、创建或绘制图片时使用。
version: 2.1.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-image-gen
    requires:
      anyBins:
        - bun
        - npx
---

# Image Generation（AI SDK）

基于官方 API 的 image generation。支持 OpenAI GPT Image 2、Azure OpenAI、Google、OpenRouter、DashScope（阿里通义万象）、Z.AI GLM-Image、MiniMax、Jimeng（即梦）、Seedream（豆包）、Replicate 和 Agnes。

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Script Directory

`{baseDir}` = 当前 SKILL.md 所在目录。下方所有 `scripts/...` paths 都相对于 `{baseDir}`。Main script：`{baseDir}/scripts/main.ts`。Batch payload helper：`{baseDir}/scripts/build-batch.ts`。解析 `${BUN_X}`：优先 `bun`；否则 `npx -y bun`；否则建议 `brew install oven-sh/bun/bun`。

## Step 0：Load Preferences ⛔ BLOCKING

任何 image generation 前都必须完成该步骤：EXTEND.md 存在前，generation 被阻塞。

按顺序检查以下 paths；第一个命中生效：

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-gen/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | User home |

- **Found** → load、parse、apply。如果 `default_model.[provider]` 为 null → 只询问 model。
- **Not found** → 使用 AskUserQuestion 运行 first-time setup（`references/config/first-time-setup.md`），收集 provider + model + quality + save location。保存 EXTEND.md 后继续。完成前不要生成图片。

Legacy compatibility：如果 `.baoyu-skills/baoyu-imagine/EXTEND.md` 存在且新路径不存在，runtime 会把它重命名为 `baoyu-image-gen`。如果两者都存在，runtime 不做改动并使用新路径。

**EXTEND.md keys**：default provider、default quality、default aspect ratio、default image size、OpenAI image API dialect、default models、batch worker cap、provider-specific batch limits。Schema：`references/config/preferences-schema.md`。

## Usage

最小可运行示例见下方；完整 per-provider invocations 和 batch mode 见 `references/usage-examples.md`。

### Identity-preserving reference prompts

当用户想从 reference images 保留真实人物/角色/物体时，**不要**用很长的通用描述替代 reference。优先使用简短、强约束的身份保持语言：

- "Use the person/object in the reference image(s) as the same identity. Do not redesign it or create a similar-looking new subject."
- "Only change scene, clothing, pose, lighting, rendering style, and composition. Keep the face/proportions/hair/key accessories/overall identity from the references."
- 如果使用多个 references，说明它们是同一 subject，并应共同定义 identity。

Pitfall：类似 "young East Asian woman, oval face, clear eyes..." 的长描述，可能导致模型合成一个符合描述的新人物，而不是保留 reference 中的人。

```bash
# Basic
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio and high quality
${BUN_X} {baseDir}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9 --quality 2k

# Prompt from files
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference image
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# Specific provider
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider dashscope --model qwen-image-2.0-pro

# OpenAI GPT Image 2
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openai --model gpt-image-2

# Codex CLI (uses logged-in Codex subscription — no OPENAI_API_KEY required; requires `codex` on PATH)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider codex-cli --ar 16:9

# Batch mode
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4

# Build a batch file from outline.md + prompts/ (e.g. baoyu-article-illustrator output)
${BUN_X} {baseDir}/scripts/build-batch.ts --outline outline.md --prompts prompts --output batch.json --images-dir attachments
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4
```

## Reference-Image Identity Preservation

当用户希望从 reference images 保留某个人/物：

- 优先使用少量精选现有 source references（通常 2-4 张），而不是很多图片；大型多 MB refs 可能让 streaming providers 不稳定。
- Prompt 要说明 references 是同一 subject，输出必须使用该 identity。避免长篇通用面部特征描述，否则模型可能合成一个相似的新人物。
- 除非用户明确要求，不要把新生成的 outputs 作为 references；generated refs 会放大 drift。
- 如果结果过于精修或网红感，减少 stylized refs，并添加明确 anti-beautification constraints（no face slimming、eye enlargement、heavy makeup、commercial travel shoot、over-smoothing）。
- 如果 subject 应该变年轻/变老，通过 clothing、posture、scene 和 styling 表达年龄，保留 face；不要要求模型改变 facial identity。

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | 从 files 读取 prompt（拼接） |
| `--image <path>` | Output image path（single-image mode 中 required） |
| `--batchfile <path>` | Multi-image generation 的 JSON batch file |
| `--jobs <count>` | Batch mode worker count（default: auto，max from config，built-in default 10） |
| `--provider google\|openai\|azure\|openrouter\|dashscope\|zai\|minimax\|jimeng\|seedream\|replicate\|codex-cli\|agnes` | 强制 provider（default: auto-detect；`codex-cli` 永不 auto-selected，必须通过 CLI 或 EXTEND.md pinned） |
| `--model <id>`, `-m` | Model ID：defaults 和 allowed values 见 provider references |
| `--ar <ratio>` | Aspect ratio（`16:9`、`1:1`、`4:3`、…） |
| `--size <WxH>` | 显式 size（例如 `1024x1024`；对 `gpt-image-2`，width/height 必须是 16 的倍数，max edge 3840px，ratio 不宽于 3:1） |
| `--quality normal\|2k` | Quality preset（default: `2k`） |
| `--imageSize 1K\|2K\|4K` | Google/OpenRouter 的 image size（default: from quality） |
| `--imageApiDialect openai-native\|ratio-metadata` | OpenAI-compatible endpoint dialect；对期望 aspect-ratio `size` + `metadata.resolution` 的 gateways 使用 `ratio-metadata` |
| `--ref <files...>` | Reference images。Google multimodal、OpenAI GPT Image edits、Azure OpenAI edits（仅 PNG/JPG）、OpenRouter multimodal models、Replicate supported families、MiniMax subject-reference、Seedream 5.0/4.5/4.0、DashScope `wan2.7-image-pro`/`wan2.7-image` 支持。Jimeng、Seedream 3.0、SeedEdit 3.0，以及 `wan2.7-image*` family 之外的 DashScope model 不支持 |
| `--n <count>` | 图片数量。Replicate 要求 `--n 1`（single-output save semantics） |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `GOOGLE_API_KEY` | Google API key |
| `DASHSCOPE_API_KEY` | DashScope API key |
| `ZAI_API_KEY`（alias `BIGMODEL_API_KEY`） | Z.AI API key |
| `MINIMAX_API_KEY` | MiniMax API key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `JIMENG_ACCESS_KEY_ID`, `JIMENG_SECRET_ACCESS_KEY` | Jimeng（即梦）Volcengine credentials |
| `ARK_API_KEY` | Seedream（豆包）Volcengine ARK API key |
| `AGNES_API_KEY` | Agnes API key |
| `<PROVIDER>_IMAGE_MODEL` | Per-provider model override（`OPENAI_IMAGE_MODEL`、`GOOGLE_IMAGE_MODEL`、`DASHSCOPE_IMAGE_MODEL`、`ZAI_IMAGE_MODEL`/`BIGMODEL_IMAGE_MODEL`、`MINIMAX_IMAGE_MODEL`、`OPENROUTER_IMAGE_MODEL`、`REPLICATE_IMAGE_MODEL`、`JIMENG_IMAGE_MODEL`、`SEEDREAM_IMAGE_MODEL`、`AGNES_IMAGE_MODEL`） |
| `AZURE_OPENAI_DEPLOYMENT`（alias `AZURE_OPENAI_IMAGE_MODEL`） | Azure default deployment |
| `<PROVIDER>_BASE_URL` | Per-provider endpoint override |
| `AZURE_API_VERSION` | Azure image API version（default `2025-04-01-preview`） |
| `JIMENG_REGION` | Jimeng region（default `cn-north-1`） |
| `OPENAI_IMAGE_API_DIALECT` | `openai-native` \| `ratio-metadata` |
| `OPENROUTER_HTTP_REFERER`, `OPENROUTER_TITLE` | Optional OpenRouter attribution |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | 覆盖 batch worker cap |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | Per-provider concurrency（例如 `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY`；codex-cli 使用 `BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY`） |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | Per-provider start-gap |
| `BAOYU_CODEX_IMAGEGEN_BIN` | 覆盖 `codex-cli` provider 的 codex-imagegen wrapper path（default: bundled `scripts/codex-imagegen/main.ts`；接受 `.ts` 或 legacy `.sh`/binary） |
| `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` | 为 `codex-cli` provider 启用 idempotency cache（默认关闭） |
| `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS` | `codex-cli` provider 每次 attempt 的 `codex exec` timeout（default: 300000 ms） |
| `BAOYU_CODEX_IMAGEGEN_RETRIES` | `codex-cli` provider 的 wrapper-side retry attempts on retryable errors（default: 2） |
| `BAOYU_CODEX_IMAGEGEN_LOG_FILE` | 为 `codex-cli` provider append JSONL diagnostic log |

**Load priority**：CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

### Codex/ChatGPT OAuth is not an OpenAI API key

`--provider openai --model gpt-image-2` 使用标准 OpenAI Images API（`/v1/images/generations` 或 `/v1/images/edits`），并要求 `OPENAI_API_KEY`。Codex 或 ChatGPT desktop login 是另一种 entitlement，不能直接替代 `OPENAI_API_KEY`；不要把 Codex OAuth token 粘贴到 `OPENAI_API_KEY`，也不要只把 `OPENAI_BASE_URL` 设为 Codex backend。

如果用户想在没有 OpenAI API key 的情况下使用 Codex subscription / GPT Image 2 entitlement，请路由到 Codex-native backend，而不是该 skill 的 `openai` provider：

- 在 Codex runtime 中：使用 native `imagegen` skill/tool。
- 在安装并登录了 `codex` CLI 的非 Codex runtimes 中：使用 `baoyu-image-gen --provider codex-cli`（preferred，它提供与其他 provider 一致的 retry / cache / batch flow）。Provider 会启动 bundled `scripts/codex-imagegen/main.ts`；同一代码的 upstream standalone 版本位于 `packages/baoyu-codex-imagegen/src/main.ts`。
- 在带 native `image_generate` tool 的 Hermes runtimes 中：将该 tool 作为 fallback，并说明 reference images 是直接传入，还是从提取出的视觉特征重建。

不要修改现有 `openai` provider，使其静默消费 Codex OAuth。First-class Codex-CLI path 是专用 `codex-cli` provider；它有自己的 auth（Codex login）、route（`codex exec`）、request shape 和 tests。见 `references/codex-oauth-vs-openai-api-key.md`。

## Model Resolution

对每个 provider 都应用以下优先级（高 → 低）：

1. CLI flag `--model <id>`
2. EXTEND.md `default_model.[provider]`
3. Env var `<PROVIDER>_IMAGE_MODEL`
4. Built-in default

对 OpenAI，built-in default 是 `gpt-image-2`。`gpt-image-1.5`、`gpt-image-1` 和 GPT Image snapshots 仍可通过 `--model` 或 `OPENAI_IMAGE_MODEL` 选择。

对 Azure，`--model` / `default_model.azure` 是 Azure deployment name。`AZURE_OPENAI_DEPLOYMENT` 是 preferred env var；`AZURE_OPENAI_IMAGE_MODEL` 保留为 backward-compatible alias。如果你的 Azure deployment 以底层 model 命名，就使用 `gpt-image-2`；否则使用 exact custom deployment name。

EXTEND.md 覆盖 env vars：如果 EXTEND.md 设置 `default_model.google: "gemini-3-pro-image"`，而 env var 设置 `GOOGLE_IMAGE_MODEL=gemini-3.1-flash-image`，EXTEND.md 生效。

**每次生成前显示 model info**：

- `Using [provider] / [model]`
- `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

## OpenAI-Compatible Gateway Dialects

`provider=openai` 表示 auth 和 routing entrypoint 兼容 OpenAI。它 **不保证** upstream image API 使用 OpenAI native semantics。当 gateway 期望不同 wire format 时，在 EXTEND.md、`OPENAI_IMAGE_API_DIALECT` 或 `--imageApiDialect` 中设置 `default_image_api_dialect`：

- `openai-native`：pixel `size`（`1536x1024`）和 native OpenAI quality fields
- `ratio-metadata`：aspect-ratio `size`（`16:9`）+ `metadata.resolution`（`1K|2K|4K`）+ `metadata.orientation`

OpenAI native API 或严格 clones 使用 `openai-native`；Gemini 或类似 models 前方的 compatibility gateways 可尝试 `ratio-metadata`。当前限制：`ratio-metadata` 只适用于 text-to-image；reference-image edits 仍需要 `openai-native` 或具备 first-class edit support 的 provider。

## Provider-Specific Guides

每个 provider 都有自身 quirks（model families、size rules、ref support、limits）。当用户选择某 provider 或要求 non-default behavior 时，读取对应 reference：

| Provider | Reference |
|----------|-----------|
| DashScope（Qwen-Image families、custom sizes） | `references/providers/dashscope.md` |
| Z.AI（GLM-Image、cogview-4） | `references/providers/zai.md` |
| MiniMax（image-01、subject-reference） | `references/providers/minimax.md` |
| OpenRouter（multimodal models、`/chat/completions` flow） | `references/providers/openrouter.md` |
| Replicate（nano-banana、Seedream、Wan） | `references/providers/replicate.md` |
| Codex CLI（wraps bundled `scripts/codex-imagegen/`；Codex login，不需要 `OPENAI_API_KEY`） | `references/providers/codex-cli.md` |
| Agnes（`agnes-image-2.1-flash`、支持 reference image） | `references/providers/agnes.md` |

## Provider Selection

1. 提供了 `--ref` 且没有 `--provider` → auto-select Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax → Agnes（MiniMax 的 subject reference 更偏向 character/portrait consistency）
2. 指定了 `--provider` → 使用它（如果有 `--ref`，必须是 google/openai/azure/openrouter/replicate/seedream/minimax/codex-cli/agnes）
3. 只有一个 API key 存在 → 使用该 provider
4. 多个 keys → 默认优先级：Google → OpenAI → Azure → OpenRouter → DashScope → Z.AI → MiniMax → Replicate → Jimeng → Seedream → Agnes
5. `codex-cli` **永不 auto-selected**：需在 EXTEND.md 设置 `default_provider: codex-cli` 或传 `--provider codex-cli`。它通过 bundled `scripts/codex-imagegen/main.ts` TS entrypoint（用 `bun` 运行）启动 `codex exec`，并使用用户的 Codex subscription（不需要 `OPENAI_API_KEY`）。要求 `codex` 在 `PATH` 中且已有有效 `codex login`。

## Quality Presets

| Preset | Google imageSize | OpenAI size | OpenRouter size | Replicate resolution | Use case |
|--------|------------------|-------------|-----------------|----------------------|----------|
| `normal` | 1K | 1024px target | 1K | 1K | Quick previews |
| `2k`（default） | 2K | 2048px target | 2K | 2K | Covers、illustrations、infographics |

Google/OpenRouter `imageSize` 可用 `--imageSize 1K|2K|4K` 覆盖。

对 OpenAI native `gpt-image-2`，`normal` 映射到 `quality=medium` 和接近请求 aspect ratio 的低延迟 valid size；`2k` 映射到 `quality=high` 和 2048px-class sizes，例如 `2048x2048`、`2048x1152` 或 `1152x2048`。要使用 valid custom 或 4K outputs，请显式传 `--size`，例如 `3840x2160`。

## Aspect Ratios

Supported：`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`2.35:1`。

- Google multimodal：`imageConfig.aspectRatio`
- OpenAI：`gpt-image-2` 会为请求 ratio 使用最接近的 valid custom size；旧 GPT Image 和 DALL·E models 使用最接近的 supported fixed size
- OpenRouter：`imageGenerationOptions.aspect_ratio`；如果只给出 `--size <WxH>`，则推断 ratio
- Replicate：行为取决于 model；`google/nano-banana*` 使用 `aspect_ratio`，`bytedance/seedream-*` 使用 Replicate 文档中的 ratios，Wan 2.7 把 `--ar` 映射为具体 `size`
- MiniMax：官方 `aspect_ratio` values；如果给了 `--size <WxH>` 但没有 `--ar`，对 `image-01` 发送 `width`/`height`

## Generation Mode

**Default**：sequential。**Batch parallel**：当 `--batchfile` 包含 2+ pending tasks 时自动启用。

| Situation | Prefer | Why |
|-----------|--------|-----|
| 一张图，或 1-2 张简单图片 | Sequential | Coordination overhead 更低，更易 debug |
| 多张图，且已有 saved prompt files | Batch（`--batchfile`） | 复用 finalized prompts，应用 shared throttling/retries，吞吐更可预测 |
| 每张图仍需要自己的 reasoning / prompt writing / style exploration | Subagents | 工作仍是探索性，每张图都需要独立分析 |
| Input 是 `outline.md` + `prompts/`（例如 baoyu-article-illustrator output） | Batch：用 `{baseDir}/scripts/build-batch.ts` 组装 payload | Outline + prompt files 已包含所需一切 |

Rule of thumb：一旦 prompt files 已保存，任务变成“generate all of these”，优先 batch 而不是 subagents。只有当 generation 与 per-image thinking 或 divergent creative exploration 绑定时，才使用 subagents。

**Parallel behavior**：

- Default worker count 自动计算，受 config 限制，built-in default 10
- Provider-specific throttling 只在 batch mode 生效；defaults 为吞吐优化，同时避免 RPM bursts
- 可用 `--jobs <count>` 覆盖
- 每张图最多 retry 3 attempts
- Final output 包含 success count、failure count 和 per-image failure reasons

## Error Handling

- Missing API key → 输出带 setup instructions 的 error
- Generation failure → 每张图最多 auto-retry 3 attempts
- Invalid aspect ratio → warning，并使用 default 继续
- Reference images 与 unsupported provider/model 搭配 → error，并给出 fix hint

### Codex image2 fallback

如果 `--provider openai --model gpt-image-2` 因缺少 `OPENAI_API_KEY` 失败，但当前 runtime 有 native image-generation backend，或 repo-level `codex-imagegen` wrapper 可用，请使用该路径，而不是让用户等待。明确说明 fallback 是真正的 reference-image generation，还是只从提取的 visual traits 重建 text prompt。见 `references/codex-image2-fallback.md`。

## References

| File | Content |
|------|---------|
| `references/usage-examples.md` | 跨 providers 和 batch mode 的扩展 CLI examples |
| `references/codex-oauth-vs-openai-api-key.md` | 为什么 Codex/ChatGPT OAuth image2 entitlement 不能通过 baoyu-image-gen 的标准 OpenAI API-key provider 使用 |
| `references/codex-image2-fallback.md` | 当 OpenAI API credentials 缺失但 Codex/native image generation 可用时的实际 fallback behavior |
| `references/providers/dashscope.md` | DashScope families、sizes、limits |
| `references/providers/zai.md` | Z.AI GLM-image / cogview-4 |
| `references/providers/minimax.md` | MiniMax image-01 + subject reference |
| `references/providers/openrouter.md` | OpenRouter multimodal flow |
| `references/providers/replicate.md` | Replicate supported families + guardrails |
| `references/providers/agnes.md` | Agnes (agnes-image-2.1-flash) sizing, refs, and limits |
| `references/config/preferences-schema.md` | EXTEND.md schema |
| `references/config/first-time-setup.md` | First-time setup flow |

## Extension Support

通过 EXTEND.md 自定义配置。路径和 schema 见 Step 0。
