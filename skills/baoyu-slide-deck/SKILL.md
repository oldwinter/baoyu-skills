---
name: baoyu-slide-deck
description: 根据内容生成专业 slide deck images。先创建带 style instructions 的 outlines，再生成单张 slide images。当用户要求 "create slides"、"make a presentation"、"generate deck"、"slide deck" 或 "PPT" 时使用。
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-slide-deck
    requires:
      anyBins:
        - bun
        - npx
---

# Slide Deck Generator

将内容转换为专业 slide deck images。此 deck 面向**阅读和分享**（slides 自解释、scroll flow 有逻辑、适合社交媒体），而不是现场演讲；下面所有 layout 和 density 决策都基于这个假设。

## User Input Tools

当此 skill 需要向用户提问时，遵循以下工具选择规则（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等价工具。
2. **Fallback**：如果没有这类工具，输出带编号的纯文本消息，请用户针对每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，将所有适用问题合并到一次调用中；如果只支持单问题，则按优先级逐个询问。

下面具体提到的 `AskUserQuestion` 都是示例；在其他 runtimes 中请替换为本地等价工具。

## Image Generation Tools

当此 skill 需要渲染图片时，按以下顺序解析 backend：

1. **当前请求覆盖**：如果用户在当前消息中指定某个 backend，就使用它。
2. **已保存偏好**：如果 `EXTEND.md` 将 `preferred_image_backend` 设为当前可用的 backend，就使用它。
3. **Auto-select**（当偏好为 `auto`、未设置，或固定的 backend 不可用时）：
   - **Codex (`imagegen`)**：先检查 available-skills / tool inventory。如果列表中存在名为 `imagegen` 的 skill，说明你正在 Codex 中运行，且必须使用它：通过 `Skill` tool 以 `skill: "imagegen"` 调用，传入已保存 prompt 文件的内容（以及 Codex `imagegen` 自身参数要求的输出路径和 aspect ratio）。Codex `imagegen` 是该 runtime 的官方 raster backend，优先级高于任何非原生 skill（如 `baoyu-image-gen`），除非用户已经明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**：如果当前 runtime 没有暴露原生 `imagegen` skill，但 `codex` CLI 在 `PATH` 中且已有有效 `codex login`，则通过 `baoyu-image-gen --provider codex-cli` 路由（优先），或者在 baoyu-image-gen 不可用时直接调用 bundled wrapper。细节、参数和 runtime-discovery 流程见 [references/codex-imagegen.md](references/codex-imagegen.md)，只有选中此分支时才加载该文件。
   - **Cursor (`GenerateImage`)**：如果 runtime 暴露原生 `GenerateImage` tool，说明你正在 Cursor 中运行。它和 Codex `imagegen` 一样，优先级高于任何非原生 skill。两个硬性注意点：(a) 它没有 aspect-ratio 参数，必须在传给 `description` 的 prompt 文本中明确目标宽高比/尺寸；(b) 它不接收输出目录，会保存到 tool 管理的位置，因此生成后要把文件复制/移动到 skill 期望的输出路径（例如 `outputs/.../NN-xxx.png`）。Reference images 放在 `reference_image_paths`。
   - **其他 runtime-native tools**：如果 runtime 暴露了其他原生图片工具（如 Hermes `image_generate`），按同样方式使用。
   - 否则，如果只安装了一个 non-native backend（如 `baoyu-image-gen`），就使用它。
   - 否则（有多个 non-native backends 且没有 runtime-native tool），向用户询问一次，并与其他初始问题合并。
4. **如果没有任何可用 backend**，告知用户并询问如何继续.

**⛔ 绝不要用 SVG、HTML、canvas 或其他代码化渲染替代 raster image generation。** Codex `imagegen` 自身描述说明，它应在 "when the output should be a bitmap asset rather than repo-native code or vector." 时使用。如果无法通过步骤 3 解析出 raster backend，就进入步骤 4 并询问用户；不要静默输出 SVG、写 inline `<svg>` 标记，或生成 HTML/CSS art 作为替代。即使文章或章节看起来像 "diagram-like" 也一样：调用此规则的 consumer skill 已经判断它需要 raster image。

**⛔ 绝不要通过覆盖已生成 bitmap 来修复渲染文字。** 不要用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他程序化 overlay 去遮盖、重写、擦除、描边或替换已生成 slide image 中的 slide titles、bullets 或任何其他文本。如果文字错误或不清楚，请用修正后的 prompt 重新生成、简化 slide 上的文本，或询问用户保留哪个不完美候选。

设置 `preferred_image_backend: ask` 会强制每次运行都执行步骤 3 的询问，不受可用 backends 影响。用户可通过下面的 `## Changing Preferences` 章节修改固定 backend。

**Prompt 文件要求（硬性）**：调用任何 backend 之前，必须先将每张图片完整、最终版 prompt 写入 `prompts/` 下的独立文件（命名：`NN-slide-[slug].md`）。该文件是可复现记录，也允许你在不重新生成 prompts 的情况下切换 backends。

上面的具体工具名（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）都是示例；请在相同规则下替换为本地等价工具。

## Batch Generation Policy

当前生成组的每个 prompt 文件都已保存并验证后，默认批量生成 slide images。

优先级顺序：

1. 如果所选 backend 有原生 batch / multi-task 接口，使用它。每个 task 必须保留自己的 prompt 文件、输出路径、aspect ratio、session ID 和 direct reference images。
2. 如果没有原生 batch 接口，但 runtime 可以发起 parallel tool calls，则每次最多派发 `generation_batch_size` 张 slide images。默认：`4`。当前消息中的显式用户请求（如 `--batch-size 4` 或“并行4张一起生成”）会覆盖 EXTEND.md。
3. 如果原生 batch 和 parallel tool calls 都不可用，则顺序生成。

规则：

- 所有已选 slide prompt 文件都落盘前，绝不启动第一批生成。
- 失败项重试一次，不重新生成成功项。
- 不要仅为并行图片渲染而使用 subagents。subagents 只用于独立 prompt 迭代或创意探索。
- 只有在所有已选 slide images 都生成后，才 merge PPTX/PDF。

## Confirmation Policy

默认行为：**生成前确认**。

- 将显式 skill invocation、文件路径、匹配到的 signals/presets 和 `EXTEND.md` defaults 都视为**推荐输入**。它们都不授权跳过确认。
- 用户完成 Step 2 前，不要开始 Step 3 或后续步骤。
- 只有当前请求明确要求时才跳过确认，例如："直接生成"、"不用确认"、"跳过确认"、"按默认出幻灯片" 或等价表达。
- 如果用户明确跳过确认，在生成前的下一条面向用户更新中说明假定的 style / audience / slide-count / language / backend。

## Language

问题、进度报告、错误消息和完成摘要都使用用户语言。技术 tokens（style names、file paths、code）保留 English。

## Script Directory

`{baseDir}` = 此 SKILL.md 所在目录。解析 `${BUN_X}`：优先 `bun`；否则 `npx -y bun`；否则建议 `brew install oven-sh/bun/bun`。

| Script | 用途 |
|--------|---------|
| `scripts/merge-to-pptx.ts` | 将 slides 合并为 PowerPoint |
| `scripts/merge-to-pdf.ts` | 将 slides 合并为 PDF |

## Options

| Option | 说明 |
|--------|-------------|
| `--style <name>` | Preset（见下方 Presets）、`custom` 或自定义 style name |
| `--audience <type>` | beginners / intermediate / experts / executives / general |
| `--lang <code>` | 输出语言（en、zh、ja 等） |
| `--slides <N>` | 目标 slide count（推荐 8-25，最多 30） |
| `--ref <files...>` | 应用于每张 slide 的 reference images（style / palette / composition / subject） |
| `--batch-size <n>` | 本次运行临时 slide image generation batch size。默认来自 EXTEND.md 的 `generation_batch_size`，否则为 4。限制在 1-8。 |
| `--outline-only` | outline 后停止 |
| `--prompts-only` | prompts 后停止（跳过 image generation） |
| `--images-only` | 跳到 Step 7；需要已有 `prompts/` |
| `--regenerate <N>` | 重新生成指定 slide(s)：`3` 或 `2,5,8` |

## Style System

17 个 presets 覆盖 technical / educational / lifestyle / editorial use cases。每个 preset 都由四个 dimensions（texture / mood / typography / density）组合而成。如果用户在 Round 1 选择 "Custom dimensions"，confirmation 的 Round 2 会对每个 dimension 各问一个问题；选项和原文 copy 位于 `references/confirmation.md`。

### Presets (17)

| Preset | Dimensions | 适合 |
|--------|------------|----------|
| `blueprint` (Default) | grid + cool + technical + balanced | Architecture、system design |
| `chalkboard` | organic + warm + handwritten + balanced | Education、tutorials |
| `corporate` | clean + professional + geometric + balanced | Investor decks、proposals |
| `minimal` | clean + neutral + geometric + minimal | Executive briefings |
| `sketch-notes` | organic + warm + handwritten + balanced | Educational、tutorials |
| `hand-drawn-edu` | organic + macaron + handwritten + balanced | Educational diagrams、process explainers |
| `watercolor` | organic + warm + humanist + minimal | Lifestyle、wellness |
| `dark-atmospheric` | clean + dark + editorial + balanced | Entertainment、gaming |
| `notion` | clean + neutral + geometric + dense | Product demos、SaaS |
| `bold-editorial` | clean + vibrant + editorial + balanced | Product launches、keynotes |
| `editorial-infographic` | clean + cool + editorial + dense | Tech explainers、research |
| `fantasy-animation` | organic + vibrant + handwritten + minimal | Educational storytelling |
| `intuition-machine` | clean + cool + technical + dense | Technical docs、academic |
| `pixel-art` | pixel + vibrant + technical + balanced | Gaming、developer talks |
| `scientific` | clean + cool + technical + dense | Biology、chemistry、medical |
| `vector-illustration` | clean + vibrant + humanist + balanced | Creative、children's content |
| `vintage` | paper + warm + editorial + balanced | Historical、heritage |

每个 preset 的规格：`references/styles/<preset>.md`。Preset → dimension mapping：`references/dimensions/presets.md`。

### Dimensions（选择 "Custom dimensions" 时）

| Dimension | Options | 用途 |
|-----------|---------|---------|
| **Texture** | clean, grid, organic, pixel, paper | Background treatment |
| **Mood** | professional, warm, cool, vibrant, dark, neutral, macaron | Color temperature |
| **Typography** | geometric, humanist, handwritten, editorial, technical | Headline/body styling |
| **Density** | minimal, balanced, dense | 每张 slide 的信息量 |

完整 per-dimension specs：`references/dimensions/*.md`。

### Auto-Selection

将 content signals 匹配到 preset。选择第一条 signal keywords 出现在源内容中的行；如果没有匹配，则 fallback 到 `blueprint`。

| 源内容中的 Signals | Preset |
|-------------------|--------|
| tutorial, learn, education, guide, beginner | `sketch-notes` |
| hand-drawn, infographic, diagram, process, onboarding | `hand-drawn-edu` |
| classroom, teaching, school, chalkboard | `chalkboard` |
| architecture, system, data, analysis, technical | `blueprint` |
| creative, children, kids, cute | `vector-illustration` |
| briefing, academic, research, bilingual | `intuition-machine` |
| executive, minimal, clean, simple | `minimal` |
| saas, product, dashboard, metrics | `notion` |
| investor, quarterly, business, corporate | `corporate` |
| launch, marketing, keynote, magazine | `bold-editorial` |
| entertainment, music, gaming, atmospheric | `dark-atmospheric` |
| explainer, journalism, science communication | `editorial-infographic` |
| story, fantasy, animation, magical | `fantasy-animation` |
| gaming, retro, pixel, developer | `pixel-art` |
| biology, chemistry, medical, scientific | `scientific` |
| history, heritage, vintage, expedition | `vintage` |
| lifestyle, wellness, travel, artistic | `watercolor` |

### Slide Count Heuristic

| Source length | 推荐 slides |
|---------------|--------------------|
| < 1000 words | 5-10 |
| 1000-3000 words | 10-18 |
| 3000-5000 words | 15-25 |
| > 5000 words | 20-30（考虑拆分） |

## Reference Images

用户可以提供 reference images 来指导 style、palette、layout 或 subject。

**接收方式**：通过 `--ref <files...>` 接收，或在用户于对话中提供文件路径 / 粘贴图片时接收。
- 文件路径 → 复制到 `{slide-deck-dir}/refs/NN-ref-{slug}.{ext}`
- 粘贴图片但无路径 → 询问路径，或作为文本 fallback 口头提取 style traits

**Usage modes**（每个 reference）：

| Usage | Effect |
|-------|--------|
| `direct` | 将文件作为每张 slide 的 reference image 传给 backend |
| `style` | 提取 style traits（line treatment、texture、mood）并追加到每张 slide 的 prompt body |
| `palette` | 提取 hex colors 并追加到每张 slide 的 prompt body |

在每张 slide 的 prompt frontmatter 中记录 refs：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

生成时，验证文件存在。如果 `usage: direct` 且 backend 接受 refs（如 `baoyu-image-gen --ref`），每张 slide 都传入该文件。否则将提取出的 `style`/`palette` traits 嵌入 prompt 文本。

## File Layout

```
slide-deck/{topic-slug}/
├── source-{slug}.{ext}
├── outline.md
├── prompts/NN-slide-{slug}.md
├── NN-slide-{slug}.png
├── {topic-slug}.pptx
└── {topic-slug}.pdf
```

**Slug**：从 topic 提取的 2-4 个词，kebab-case。"Introduction to Machine Learning" → `intro-machine-learning`。

**Backup rule**（适用于所有步骤）：如果即将写入的文件已存在，写新文件前先将旧文件重命名为 `<name>-backup-YYYYMMDD-HHMMSS.<ext>`。这会保护用户编辑，并允许 rollback。

## Workflow

复制此检查清单，并在完成时勾选：

```
- [ ] Step 1: Setup & analyze
- [ ] Step 2: Confirmation ⚠️ REQUIRED (Round 1; Round 2 only if "Custom dimensions")
- [ ] Step 3: Generate outline
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts
- [ ] Step 6: Review prompts (conditional)
- [ ] Step 7: Generate images
- [ ] Step 8: Merge to PPTX/PDF
- [ ] Step 9: Output summary
```

### Step 1: Setup & Analyze

**1.1 加载 EXTEND.md**：按顺序检查这些路径；第一个命中者生效：

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-slide-deck/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-slide-deck/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-slide-deck/EXTEND.md` | User home |

如果找到，读取、解析并打印摘要（style / audience / language / review / generation batch size）。如果没有找到，使用 defaults 继续；first-time setup 对此 skill 不是 blocking。Schema：`references/config/preferences-schema.md`。

**1.2 分析 content**：遵循 `references/analysis-framework.md`：classify content、detect language、记录用于 style selection 的 signals、根据长度估算 slide count（见上方 Style System 中的 **Slide Count Heuristic**）、生成 topic slug。将 source 保存为 `source.md`（如果已有文件，遵守 backup rule）。

**1.3 检查现有 output**：Step 2 前 ⚠️ REQUIRED。如果 `slide-deck/{topic-slug}/` 已存在，询问如何继续；四个选项（regenerate outline / regenerate images / backup and regenerate / exit）的原文 copy 位于 `references/confirmation.md`。

将发现保存到 `analysis.md`：topic、audience、signals、recommended style and slide count、language detection。

### Step 2: Confirmation ⚠️ REQUIRED

**Hard gate**：根据 [Confirmation Policy](#confirmation-policy)，此步骤是 mandatory；用户在这里确认前（或在当前请求中用 "直接生成" / 等价表达明确 opt out 前），不能开始 Steps 3+。

**Round 1（始终执行）**：在一次 `AskUserQuestion` 调用中批量询问五个问题：style、audience、slide count、review-outline?、review-prompts?。原文选项在 `references/confirmation.md`。

提问前展示摘要：
- Content type + topic
- Detected language
- Recommended style（基于 signals）
- Recommended slide count（基于长度）

**Round 2（仅当 Round 1 选择 "Custom dimensions" 时）**：批量询问四个问题：texture、mood、typography、density。原文选项在 `references/confirmation.md`。四个答案会替换 preset。

**确认后**：用最终选择更新 `analysis.md`，并存储来自 Q4/Q5 的 `skip_outline_review` / `skip_prompt_review` flags。

### Step 3: Generate Outline

解析 style：preset → `references/styles/{preset}.md`；custom dimensions → 组合 `references/dimensions/` 中的文件。根据 resolved style 构建 `STYLE_INSTRUCTIONS`，应用已确认的 audience + language + slide count，遵循 `references/outline-template.md`，并保存为 `outline.md`。

如果使用 `--outline-only`，在此停止。如果 `skip_outline_review` 为 true，跳过 Step 4。

### Step 4: Review Outline (Conditional)

展示逐 slide 表格（`# | Title | Type | Layout`），同时展示总数和 resolved style。询问：proceed / edit outline first / regenerate；原文在 `references/confirmation.md`。

如果选择 "Edit outline first"，告诉用户编辑 `outline.md`，并在准备好后再次询问。如果选择 "Regenerate outline"，回到 Step 3。

### Step 5: Generate Prompts

对 outline 中的每张 slide：
1. 读取 `references/base-prompt.md`
2. 从 outline 中提取 `STYLE_INSTRUCTIONS`（不要重新读取 style file）
3. 添加该 slide 的内容
4. 如果指定了 `Layout:`，加入 `references/layouts.md` 中的 guidance
5. 保存到 `prompts/NN-slide-{slug}.md`（适用 backup rule）

如果使用 `--prompts-only`，在此停止。如果 `skip_prompt_review` 为 true，跳过 Step 6。

### Step 6: Review Prompts (Conditional)

展示 prompts index（`# | Filename | Slide Title`），并询问：proceed / edit prompts first / regenerate；原文在 `references/confirmation.md`。分支逻辑与 Step 4 相同。

### Step 7: Generate Images

1. 通过顶部 Image Generation Tools 规则解析 image backend；如果安装了多个则询问一次。
   - **`codex-imagegen` 调用**：当规则解析到 `codex-imagegen` 时，调用契约见 [references/codex-imagegen.md](references/codex-imagegen.md)（优先 `baoyu-image-gen --provider codex-cli` 路径、runtime wrapper discovery、参数说明、stdout schema、batch 语义；每次调用 n=1，因此 slide batches 必须为每张 slide 派发一次 wrapper 调用）。
2. 确认每个 `prompts/NN-slide-{slug}.md` 都存在（硬性要求；无论 backend 是什么，prompt files 都是可复现记录）。
3. Session ID：`slides-{topic-slug}-{timestamp}`；仅当 backend 支持 sessions 时传入。
4. 为选中的 slides 构建 task list，每个 task 包含 slide 的 prompt file、输出 PNG path、aspect ratio、session ID 和已验证 direct references。
5. 按 `## Batch Generation Policy` 批量派发 slide images：backend native batch 优先，其次 runtime parallel tool calls，顺序生成只作为 fallback。派发前对 PNG files 应用 backup rule。以 `Generated X/N` 报告进度。报错前只重试失败项一次。

`--regenerate N` 只针对指定 slides 跳到此步骤。`--images-only` 从这里开始，使用现有 prompts。

### Step 8: Merge

```bash
${BUN_X} {baseDir}/scripts/merge-to-pptx.ts <slide-deck-dir>
${BUN_X} {baseDir}/scripts/merge-to-pdf.ts <slide-deck-dir>
```

### Step 9: Summary

```
Slide Deck Complete!
Topic: [topic]
Style: [preset or "custom: texture+mood+typography+density"]
Location: [directory]
Slides: N

- 01-slide-cover.png
- ...
- NN-slide-back-cover.png

Outline: outline.md
PPTX: {topic-slug}.pptx
PDF: {topic-slug}.pdf
```

## Slide Modification

| Action | 方法 |
|--------|-----|
| Edit | **先**更新 `prompts/NN-slide-{slug}.md`，再 `--regenerate N` |
| Add | 在目标位置创建新 prompt，生成 image，后续 `NN` 重新编号（slugs 不变），更新 `outline.md`，重新 merge |
| Delete | 删除 PNG + prompt，后续重新编号，更新 `outline.md`，重新 merge |

重新生成 image 前始终先更新 prompt 文件；这会让 prompts 目录保持 source of truth，并使变更可复现。重新编号时只改变 `NN`；slugs 保持稳定，因此 references 仍有效。

文本修正策略：

- 如果 slide 的 title、bullets 或任何其他已渲染文本拼写错误、乱码、难以阅读或视觉效果弱，不要用代码 patch bitmap。
- 对 text-correction regenerations，写入新的 prompt 文件和新的输出路径，以保留有问题的候选图供对比。
- Post-processing 仅限 crop、resize、compression 或 format conversion，不得改变文本或主构图。

完整细节见 `references/modification-guide.md`。

## References

| File | 内容 |
|------|---------|
| `references/confirmation.md` | 每次 confirmation 的 AskUserQuestion 原文选项 copy |
| `references/analysis-framework.md` | Content analysis framework |
| `references/outline-template.md` | Outline structure |
| `references/base-prompt.md` | Image generation 的 base prompt body |
| `references/layouts.md` | Layout options |
| `references/design-guidelines.md` | Audience、typography、color selection |
| `references/content-rules.md` | Content guidelines |
| `references/modification-guide.md` | Edit/add/delete workflows |
| `references/styles/<preset>.md` | Per-preset specifications |
| `references/dimensions/*.md` | Per-dimension specifications |
| `references/config/preferences-schema.md` | EXTEND.md schema |

## Notes

- Image generation 每张 slide 约需 10-30s；在生成之间报告进度。
- 对敏感公众人物，优先使用 stylized alternatives，以避免 likeness issues。
- 当 backend 支持 session ID 时，通过它保持 visual consistency。

## Changing Preferences

EXTEND.md 位于 Step 1.1 所列第一个匹配路径。有两种修改方式：

- **直接编辑**：打开 EXTEND.md 并修改字段。完整 schema：`references/config/preferences-schema.md`。
- **常见单行修改**：
  - `preferred_image_backend: auto`：默认值；runtime-native tool 优先，fallback 到唯一已安装 backend，仅在存在多个 non-native backends 时询问。
  - `preferred_image_backend: codex-imagegen`：固定到 Codex 内置 backend。
  - `preferred_image_backend: baoyu-image-gen`：固定到 baoyu-image-gen skill。
  - `preferred_image_backend: ask`：每次运行都确认 backend。
  - `generation_batch_size: 4`：当 backend/runtime 支持 batch 或 parallel generation 时，同时渲染的默认 slide images 数量。
  - `preferred_style: blueprint`、`preferred_audience: experts`、`language: zh`。
