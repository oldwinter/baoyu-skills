---
name: baoyu-article-illustrator
description: 分析文章结构，识别需要视觉辅助的位置，并用 Type x Style x Palette 三维方法生成配图。用户要求 "illustrate article"、"add images"、"generate images for article" 或 "为文章配图" 时使用。
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-article-illustrator
---

# Article Illustrator

分析文章，识别适合插入配图的位置，并用 Type x Style x Palette 保持生成图片的一致性。

## User Input Tools

当此 skill 需要向用户提问时，按以下工具选择规则执行（优先级从高到低）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等价工具。
2. **Fallback**：如果没有这类工具，输出编号纯文本问题，请用户为每个问题回复编号或答案。
3. **Batching**：如果工具支持一次提交多个问题，把所有适用问题合并到一次调用；如果只支持单个问题，则按优先级逐个询问。

下面的 `AskUserQuestion` 引用只是示例；在其他 runtime 中请替换为本地等价工具。

## Image Generation Tools

当此 skill 需要渲染图片时，按以下顺序解析 backend：

1. **当前请求覆盖**：如果用户在当前消息中指定了某个 backend，使用它。
2. **已保存偏好**：如果 `EXTEND.md` 将 `preferred_image_backend` 设为当前可用 backend，则使用它。
3. **Auto-select**（当偏好为 `auto`、未设置，或固定 backend 当前不可用时）：
   - **Codex (`imagegen`)**：先检查 available-skills / tool inventory。如果列出了名为 `imagegen` 的 skill，说明你正在 Codex 中运行，并且 MUST 使用它：通过 `Skill` tool 调用 `skill: "imagegen"`，传入已保存 prompt 文件内容（外加输出路径和宽高比，按 Codex `imagegen` 自身参数要求）。Codex `imagegen` 是该 runtime 中的官方 raster backend，优先级高于任何非原生 skill（例如 `baoyu-image-gen`），除非用户显式固定了不同的 `preferred_image_backend`。
   - **Codex via `codex exec` (`codex-imagegen`)**：如果当前 runtime 没有暴露原生 `imagegen` skill，但 `PATH` 上有 `codex` CLI 且已完成 `codex login`，则通过 `baoyu-image-gen --provider codex-cli` 路由（首选）；如果 `baoyu-image-gen` 不可用，再直接调用 bundled wrapper。细节、参数和 runtime 发现流程见 [references/codex-imagegen.md](references/codex-imagegen.md)，只在选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**：如果 runtime 暴露原生 `GenerateImage` tool，说明你正在 Cursor 中运行。它和 Codex `imagegen` 一样，优先级高于任何非原生 skill。两个硬性注意点：(a) 它没有 aspect-ratio 参数，必须在传给 `description` 的 prompt 文本中明确目标宽高比/尺寸；(b) 它不接收输出目录，会保存到 tool 管理的位置，因此生成后要把文件复制/移动到 skill 期望的输出路径（例如 `outputs/.../NN-xxx.png`）。Reference images 放在 `reference_image_paths`。
   - **Other runtime-native tools**：如果 runtime 暴露了其他原生图片工具（例如 Hermes `image_generate`），以相同方式使用它。
   - 否则，如果只安装了一个非原生 backend（例如 `baoyu-image-gen`），使用它。
   - 否则（存在多个非原生 backend 且无 runtime-native tool），向用户询问一次，可与其他初始问题合并。
4. **如果没有任何 backend 可用**，告知用户并询问如何继续.

**⛔ 绝不要用 SVG、HTML、canvas 或其他 code-based rendering 替代 raster image generation。** Codex `imagegen` 的说明明确写着，当输出应是 bitmap asset 而非 repo-native code 或 vector 时应使用它。如果无法通过第 3 步解析 raster backend，就进入第 4 步询问用户；不要静默输出 SVG、写 inline `<svg>`，或生成 HTML/CSS art 作为替代。即使文章或章节看起来像 diagram，也同样适用：调用此规则的消费 skill 已经决定它需要 raster image。

**⛔ 绝不要通过覆盖已生成 bitmap 的方式修复渲染文字。** 不要用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何程序化 overlay 去遮盖、重写、擦除、描边或替换已生成插图中的标签、标题或其他文字。如果文字错误或不清楚，请用修正后的 prompt 重新生成、减少或取消图中文字，或询问用户保留哪个不完美候选。

设置 `preferred_image_backend: ask` 会强制每次运行都执行第 3 步询问，不管当前有哪些 backend。用户可通过下方 `## Changing Preferences` 部分修改固定 backend。

**Prompt file requirement (hard)**：调用任何 backend 前，必须先把每张图片的完整最终 prompt 写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。Backend 接收 prompt 文件（或其内容）；该文件是可复现记录，也让你能在不重写 prompt 的情况下切换 backend。

上方具体工具名（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）只是示例；请在同一规则下替换为本地等价工具。

## Batch Generation Policy

每次运行的所有 prompt 文件保存并验证后，默认分批生成图片。

优先级顺序：

1. 如果所选 backend 有原生 batch / multi-task 接口，使用它。每个 task 必须保留自己的 prompt 文件、输出路径、宽高比和 direct reference images。
2. 如果没有原生 batch 接口，但 runtime 能发起并行工具调用，则一次最多分发 `generation_batch_size` 张图片。默认：`4`。当前消息中的显式要求（如 `--batch-size 4` 或“并行4张一起生成”）会覆盖 EXTEND.md。
3. 如果既没有原生 batch，也没有并行工具调用能力，则顺序生成。

规则：

- 第一批开始前，该批所有 prompt 文件必须已经存在于磁盘。
- 失败项重试一次，不要重新生成成功项。
- 不要仅为了并行渲染图片而使用 subagents。Subagents 只用于独立的 prompt 迭代或创意探索。

## Confirmation Policy

默认行为：**生成前确认**。

- 将显式 skill 调用、文件路径、匹配到的信号/预设以及 `EXTEND.md` 默认值都视为**推荐输入**。它们都不授权跳过确认。
- 在用户完成 Step 3 前，不要开始 Step 4 或后续步骤。
- 只有当前请求明确要求跳过时才可跳过确认，例如“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或等价表述。
- 如果用户显式跳过确认，在生成前的下一条面向用户更新中说明假定的 type / density / style / palette / language / backend。

## Reference Images

用户可以通过 `--ref <files...>`、提供文件路径或在对话中粘贴图片来提供参考图。Refs 可以为特定配图指导 style、palette、composition 或 subject。

完整检测、存储和处理规则在 [references/workflow.md](references/workflow.md) 中（Step 1.0 保存到 `references/NN-ref-{slug}.{ext}`；Step 5.3 按每张图的 `direct | style | palette` usage 处理）。当所选 backend 支持 batch input 时，每个 prompt 文件 frontmatter 中 `direct` usage 的 `references:` 条目应传入对应 batch payload，让 backend 能继续传递它们（例如 `baoyu-image-gen` 每个 task 接受 `ref`）。

## Three Dimensions

| Dimension | Controls | Examples |
|-----------|----------|----------|
| **Type** | 信息结构 | infographic, scene, flowchart, comparison, framework, timeline |
| **Style** | 渲染方法 | notion, warm, minimal, blueprint, watercolor, elegant |
| **Palette** | 配色方案（可选） | macaron, warm, neon — 覆盖 style 默认颜色 |

可自由组合：`--type infographic --style vector-illustration --palette macaron`

也可以使用 presets：`--preset edu-visual` → 一次指定 type + style + palette。参见 [Style Presets](references/style-presets.md)。

## Types

| Type | Best For |
|------|----------|
| `infographic` | 数据、指标、技术内容 |
| `scene` | 叙事、情绪表达 |
| `flowchart` | 流程、workflow |
| `comparison` | 并排对比、选项 |
| `framework` | 模型、架构 |
| `timeline` | 历史、演进 |

## Styles

Core Styles、完整 gallery 和 Type x Style 兼容性见 [references/styles.md](references/styles.md)。

## Workflow

```
- [ ] Step 1: Pre-check (EXTEND.md, references, config)
- [ ] Step 2: Analyze content
- [ ] Step 3: Confirm settings (AskUserQuestion)
- [ ] Step 4: Generate outline
- [ ] Step 5: Generate images
- [ ] Step 6: Finalize
```

### Step 1: Pre-check

**1.5 Load Preferences (EXTEND.md) ⛔ BLOCKING**

按优先级检查 EXTEND.md，找到的第一个生效：

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-article-illustrator/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | 读取、解析、展示摘要 |
| Not found | ⛔ 运行 [first-time-setup](references/config/first-time-setup.md) |

完整流程见：[references/workflow.md](references/workflow.md#step-1-pre-check)

### Step 2: Analyze

| Analysis | Output |
|----------|--------|
| Content type | Technical / Tutorial / Methodology / Narrative |
| Purpose | information / visualization / imagination |
| Core arguments | 2-5 个主要观点 |
| Positions | 配图能提供价值的位置 |

**CRITICAL**：Metaphors → 可视化底层概念，而不是字面画面。

完整流程见：[references/workflow.md](references/workflow.md#step-2-setup--analyze)

### Step 3: Confirm Settings ⚠️

**Hard gate**：按照 [Confirmation Policy](#confirmation-policy)，此步骤强制执行。用户在这里确认前（或在当前请求中明确用“直接生成”等等价表述跳过前），不得进入 Step 4+。

**一次 AskUserQuestion，最多 4 个问题。Q1-Q2 REQUIRED。Q3 required unless preset chosen。**

| Q | Options |
|---|---------|
| **Q1: Preset or Type** | [Recommended preset], [alt preset]，或手动：infographic, scene, flowchart, comparison, framework, timeline, mixed |
| **Q2: Density** | minimal (1-2), balanced (3-5), per-section (Recommended), rich (6+) |
| **Q3: Style** | [Recommended], minimal-flat, sci-fi, hand-drawn, editorial, scene, poster, Other — **如果已选 preset 则跳过** |
| Q4: Palette | Default (style colors), macaron, warm, neon — **如果 preset 已包含 palette 或 preferred_palette 已设置则跳过** |
| Q5: Language | 当文章语言与 EXTEND.md 设置不同时询问 |

完整流程见：[references/workflow.md](references/workflow.md#step-3-confirm-settings-)

### Step 4: Generate Outline

保存带 frontmatter 的 `outline.md`（type、density、style、palette、image_count）和条目：

```yaml
## Illustration 1
**Position**: [section/paragraph]
**Purpose**: [why]
**Visual Content**: [what]
**Filename**: 01-infographic-concept-name.png
```

完整模板见：[references/workflow.md](references/workflow.md#step-4-generate-outline)

### Step 5: Generate Images

⛔ **BLOCKING：任何图片生成前，Prompt files MUST be saved。** 无论选择哪个 backend，这都是硬性要求；prompt 文件是可复现记录。

1. 对每张配图，按 [references/prompt-construction.md](references/prompt-construction.md) 创建 prompt 文件。
2. 保存到 `prompts/NN-{type}-{slug}.md`，包含 YAML frontmatter。
3. Prompts **MUST** 使用带结构化区块的 type-specific templates（ZONES / LABELS / COLORS / STYLE / ASPECT）。
4. LABELS **MUST** 包含来自文章的具体数据：真实数字、术语、指标、引用。
5. **DO NOT** 在没有先保存 prompt 文件的情况下，将临时 inline prompts 传给 `--prompt`。
6. 通过顶部 `## Image Generation Tools` 规则选择 backend：使用当前可用项；如果有多个，询问用户一次。每个 session 在任何生成前只做一次。
   - **`codex-imagegen` invocation**：当规则解析到 `codex-imagegen` 时，查看 [references/codex-imagegen.md](references/codex-imagegen.md) 了解调用契约（首选 `baoyu-image-gen --provider codex-cli` 路径、runtime wrapper 发现、参数说明、stdout schema、batch 语义）。
7. **Execution strategy**：按 `## Batch Generation Policy` 分批生成：backend 原生 batch 优先，其次 runtime 并行工具调用，最后才顺序生成。除非 EXTEND.md 或当前请求覆盖，默认 batch size 为 4。
8. 按 prompt frontmatter 处理 references（`direct`/`style`/`palette`）。
9. 如果 EXTEND.md 启用了 watermark，则应用 watermark。
10. 从已保存 prompt 文件生成；失败时重试一次。

完整流程见：[references/workflow.md](references/workflow.md#step-5-generate-images)

### Step 6: Finalize

在段落后插入 `![description]({relative-path}/NN-{type}-{slug}.png)`。路径根据 output directory 设置相对文章文件计算。

```
Article Illustration Complete!
Article: [path] | Type: [type] | Density: [level] | Style: [style] | Palette: [palette or default]
Images: X/N generated
```

## Output Directory

Output directory 由 EXTEND.md 中的 `default_output_dir` 决定（首次设置时配置）：

| `default_output_dir` | Output Path | Markdown Insert Path |
|----------------------|-------------|----------------------|
| `imgs-subdir` (default) | `{article-dir}/imgs/` | `imgs/NN-{type}-{slug}.png` |
| `same-dir` | `{article-dir}/` | `NN-{type}-{slug}.png` |
| `illustrations-subdir` | `{article-dir}/illustrations/` | `illustrations/NN-{type}-{slug}.png` |
| `independent` | `illustrations/{topic-slug}/` | `illustrations/{topic-slug}/NN-{type}-{slug}.png`（相对 cwd） |

所有辅助文件（outline、prompts）都保存在 output directory 内：

```
{output-dir}/
├── outline.md
├── prompts/
│   └── NN-{type}-{slug}.md
└── NN-{type}-{slug}.png
```

当输入是**粘贴内容**（无文件路径）时，始终使用 `illustrations/{topic-slug}/`，并把 `source-{slug}.{ext}` 保存在同目录。

**Slug**：2-4 个词，kebab-case。**Conflict**：追加 `-YYYYMMDD-HHMMSS`。

## Modification

| Action | Steps |
|--------|-------|
| Edit | 更新 prompt → 重新生成 → 更新引用 |
| Add | 选择位置 → 编写 prompt → 生成 → 更新 outline → 插入 |
| Delete | 删除文件 → 移除引用 → 更新 outline |

Text correction policy：

- 如果任何渲染文字（标签、标题等）拼写错误、乱码、难以阅读或视觉效果弱，不要用代码修补 bitmap。
- 对文字修正的重新生成，应写入新的 prompt 文件和新的输出路径，以便保留有缺陷候选用于比较。
- Post-processing 仅限 crop、resize、compression 或 format conversion，且不得改动文字或主体构图。

## References

| File | Content |
|------|---------|
| [references/workflow.md](references/workflow.md) | 详细流程 |
| [references/usage.md](references/usage.md) | 命令语法 |
| [references/styles.md](references/styles.md) | Style gallery + Palette gallery |
| [references/style-presets.md](references/style-presets.md) | Preset shortcuts（type + style + palette） |
| [references/prompt-construction.md](references/prompt-construction.md) | Prompt templates |
| [references/config/first-time-setup.md](references/config/first-time-setup.md) | 首次设置 |

## Changing Preferences

EXTEND.md 位于 Step 1.5 列出的第一个匹配路径。可用三种方式修改：

- **直接编辑**：打开 EXTEND.md 并修改字段。完整 schema：`references/config/preferences-schema.md`。
- **交互式重新配置**：删除 EXTEND.md（或请求“reconfigure baoyu-article-illustrator preferences” / “重新配置”）。下次运行会重新触发 first-time setup。
- **常见单行修改**：
  - `preferred_image_backend: auto`：默认；runtime-native tool 优先，退回到唯一已安装 backend，仅在存在多个非原生 backend 时询问。
  - `preferred_image_backend: codex-imagegen`：固定到 Codex 内置 backend。
  - `preferred_image_backend: baoyu-image-gen`：固定到 baoyu-image-gen skill。
  - `preferred_image_backend: ask`：每次运行都确认 backend。
  - `generation_batch_size: 4`：runtime 支持并行生成调用时，默认并发渲染图片数。
  - `preferred_type: infographic`、`preferred_style: notion`、`preferred_palette: macaron`、`language: zh`。
  - `default_output_dir: imgs-subdir`：生成图片相对文章的写入位置。
