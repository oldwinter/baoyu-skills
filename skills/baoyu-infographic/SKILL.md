---
name: baoyu-infographic
description: 使用 21 种 layout type 和 22 种 visual style 生成专业信息图。分析内容，推荐 layout x style 组合，并生成可发布的信息图。用户要求创建 "infographic"、"信息图"、"visual summary"、"可视化" 或 "高密度信息大图" 时使用。
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-infographic
---

# Infographic Generator

两个维度：**layout**（信息结构）x **style**（视觉美学）。任意 layout 都可与任意 style 自由组合。

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

**⛔ 绝不要通过覆盖已生成 bitmap 的方式修复渲染文字。** 不要用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何程序化 overlay 去遮盖、重写、擦除、描边或替换已生成信息图中的 labels、headings、callouts、data values 或其他文字。如果文字错误或不清楚，请用修正后的 prompt 重新生成，切换到图中文字更少的 layout，或询问用户保留哪个不完美候选。

设置 `preferred_image_backend: ask` 会强制每次运行都执行第 3 步询问，不管当前有哪些 backend。用户可通过下方 `## Changing Preferences` 部分修改固定 backend。

**Prompt file requirement (hard)**：调用任何 backend 前，必须先把每张图片的完整最终 prompt 写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。Backend 接收 prompt 文件（或其内容）；该文件是可复现记录，也让你能在不重写 prompt 的情况下切换 backend。

上方具体工具名（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）只是示例；请在同一规则下替换为本地等价工具。

## Reference Images

用户可以提供 reference images 来指导 style、palette、composition 或 subject。

**Intake**：通过 `--ref <files...>`，或用户在对话中提供文件路径/粘贴图片。

- 文件路径 → 复制到输出目录旁的 `refs/NN-ref-{slug}.{ext}`
- 粘贴图片但没有 path → 按上方 User Input Tools 规则询问用户路径；或以文字 fallback 方式提取 style traits
- 没有 reference → 跳过本节

**Usage modes**（每张 reference）：

| Usage | Effect |
|-------|--------|
| `direct` | 将文件作为 reference image 传给 backend |
| `style` | 提取 style traits（line treatment、texture、mood）并追加到 prompt 正文 |
| `palette` | 从图片提取 hex colors 并追加到 prompt 正文 |

Refs 存在时，在 `prompts/infographic.md` frontmatter 中记录：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

**生成时**：

- 验证每个 referenced file 都真实存在于磁盘。
- 如果 `usage: direct` 且所选 backend 接受 reference images（例如 `baoyu-image-gen` via `--ref`）→ 通过 backend 的 ref 参数传入文件。
- 否则 → 把提取到的 `style`/`palette` traits 嵌入 prompt 文本。

## Confirmation Policy

默认行为：**生成前确认**。

- 将显式 skill 调用、文件路径、匹配到的 keyword shortcut、`EXTEND.md` 默认值和文档化默认组合都视为**推荐输入**。它们都不授权跳过确认。
- 在用户确认 combination/aspect/language/backend choices 前，不要开始 Step 5 或 Step 6。
- 只有当前请求明确要求跳过时才可跳过确认，例如：`--no-confirm`、“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或等价表述。
- 如果用户显式跳过确认，在生成前的下一条面向用户更新中说明假定的 combination/aspect/language/backend。

## Options

| Option | Values |
|--------|--------|
| `--layout` | 21 个选项（见 Layout Gallery），默认：bento-grid |
| `--style` | 22 个选项（见 Style Gallery），默认：craft-handmade |
| `--aspect` | 命名：landscape (16:9), portrait (9:16), square (1:1)。自定义：任意 W:H ratio（例如 3:4, 4:3, 2.35:1） |
| `--lang` | en, zh, ja, etc. |
| `--no-confirm` | 仅当用户明确要求直接生成且不确认时，跳过 Step 4 |
| `--ref <files...>` | 用于 style / palette / composition / subject 指导的 reference images（文件路径） |

## Layout Gallery (21)

| Layout | Best For |
|--------|----------|
| `linear-progression` | Timelines、processes、tutorials |
| `binary-comparison` | A vs B、before-after、pros-cons |
| `comparison-matrix` | 多因素对比 |
| `hierarchical-layers` | 金字塔、优先级 |
| `tree-branching` | Categories、taxonomies |
| `hub-spoke` | 中心概念及相关项 |
| `structural-breakdown` | Exploded views、cross-sections |
| `bento-grid` | 多主题、overview（默认） |
| `iceberg` | 表层 vs 隐藏面 |
| `bridge` | Problem-solution |
| `funnel` | Conversion、filtering |
| `isometric-map` | 空间关系 |
| `dashboard` | Metrics、KPIs |
| `periodic-table` | 分类集合 |
| `comic-strip` | 叙事、序列 |
| `story-mountain` | 情节结构、tension arcs |
| `jigsaw` | 互相连接的部分 |
| `venn-diagram` | 重叠概念 |
| `winding-roadmap` | Journey、milestones |
| `circular-flow` | Cycles、循环过程 |
| `dense-modules` | 高密度模块、数据丰富指南 |

完整定义位于 `references/layouts/<layout>.md`。

## Style Gallery (22)

| Style | Description |
|-------|-------------|
| `craft-handmade` | 手绘、paper craft（默认） |
| `claymation` | 3D clay figures、stop-motion |
| `kawaii` | 日式可爱、pastels |
| `storybook-watercolor` | 柔和手绘、whimsical |
| `chalkboard` | 黑板粉笔 |
| `cyberpunk-neon` | 霓虹 glow、未来感 |
| `bold-graphic` | Comic style、halftone |
| `aged-academia` | 复古科学、sepia |
| `corporate-memphis` | Flat vector、鲜艳 |
| `technical-schematic` | Blueprint、engineering |
| `origami` | 折纸、几何 |
| `pixel-art` | 复古 8-bit |
| `ui-wireframe` | 灰度 interface mockup |
| `subway-map` | Transit diagram |
| `ikea-manual` | 极简线稿 |
| `knolling` | Organized flat-lay |
| `lego-brick` | Toy brick construction |
| `pop-laboratory` | Blueprint grid、coordinate markers、lab precision |
| `morandi-journal` | Hand-drawn doodle、暖 Morandi tones |
| `retro-pop-grid` | 1970s retro pop art、Swiss grid、粗轮廓 |
| `hand-drawn-edu` | Macaron pastels、手绘晃动线条、stick figures |
| `retro-popup-pop` | Retro popup collage、vintage UI、粗轮廓、flat pop colors |

完整定义位于 `references/styles/<style>.md`。

## Recommended Combinations

| Content Type | Layout + Style |
|--------------|----------------|
| Timeline/History | `linear-progression` + `craft-handmade` |
| Step-by-step | `linear-progression` + `ikea-manual` |
| A vs B | `binary-comparison` + `corporate-memphis` |
| Hierarchy | `hierarchical-layers` + `craft-handmade` |
| Overlap | `venn-diagram` + `craft-handmade` |
| Conversion | `funnel` + `corporate-memphis` |
| Cycles | `circular-flow` + `craft-handmade` |
| Technical | `structural-breakdown` + `technical-schematic` |
| Metrics | `dashboard` + `corporate-memphis` |
| Educational | `bento-grid` + `chalkboard` |
| Journey | `winding-roadmap` + `storybook-watercolor` |
| Categories | `periodic-table` + `bold-graphic` |
| Product Guide | `dense-modules` + `morandi-journal` |
| Technical Guide | `dense-modules` + `pop-laboratory` |
| Trendy Guide | `dense-modules` + `retro-pop-grid` |
| Retro Pop Guide | `dense-modules` + `retro-popup-pop` |
| Educational Diagram | `hub-spoke` + `hand-drawn-edu` |
| Process Tutorial | `linear-progression` + `hand-drawn-edu` |

默认组合：`bento-grid` + `craft-handmade`（只作为 fallback recommendation；按照 [Confirmation Policy](#confirmation-policy)，默认值绝不会绕过 Step 4）。

## Keyword Shortcuts

当用户输入包含这些关键词时，将映射 layout 作为 Step 3 的首选推荐，并把列出的 styles 提升到 Step 3 列表顶部。匹配关键词后，跳过基于内容的 layout 推断。将任何 `Prompt Notes` 追加到 Step 5 prompt。

| User Keyword | Layout | Recommended Styles | Default Aspect | Prompt Notes |
|--------------|--------|--------------------|----------------|--------------|
| 高密度信息大图 / high-density-info | `dense-modules` | `morandi-journal`, `pop-laboratory`, `retro-pop-grid`, `retro-popup-pop` | portrait | — |
| 信息图 / infographic | `bento-grid` | `craft-handmade` | landscape | Minimalist: clean canvas, ample whitespace, no complex background textures. Simple cartoon elements and icons only. |

## Output Structure

```text
infographic/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── structured-content.md
├── prompts/infographic.md
└── infographic.png
```

Slug：从 topic 提取 2-4 个词，kebab-case。Conflict：追加 `-YYYYMMDD-HHMMSS`。

## Core Principles

- 忠实保留 source data，不总结、不改写（但输出前**剥离任何 credentials、API keys、tokens 或 secrets**）
- 先定义 learning objectives，再结构化内容
- 为视觉沟通而组织结构（headlines、labels、visual elements）

## Workflow

### Step 1: Setup & Analyze

**1.1 Load Preferences (EXTEND.md)**

按优先级检查 EXTEND.md，找到的第一个生效：

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-infographic/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-infographic/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-infographic/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | 读取、解析、展示一行摘要 |
| Not found | 用 `AskUserQuestion` 询问用户（见 `references/config/first-time-setup.md`） |

**EXTEND.md supports**：preferred layout/style、default aspect ratio、language preference、preferred image backend、custom style definitions。

Schema：`references/config/preferences-schema.md`

**1.2 Analyze Content → `analysis.md`**

1. 保存 source content（文件路径或粘贴 → `source.md`）
   - **Backup rule**：如果 `source.md` 已存在，重命名为 `source-backup-YYYYMMDD-HHMMSS.md`
2. 分析：topic、data type、complexity、tone、audience
3. 检测 source language 和 user language
4. 从 user input 中提取 design instructions
5. 保存 analysis
   - **Backup rule**：如果 `analysis.md` 已存在，重命名为 `analysis-backup-YYYYMMDD-HHMMSS.md`

详细格式见 `references/analysis-framework.md`。

### Step 2: Generate Structured Content → `structured-content.md`

将内容转换为信息图结构：

1. Title 和 learning objectives
2. Sections，包括：key concept、content（verbatim）、visual element、text labels
3. Data points（所有统计/quotes 精确复制）
4. 来自用户的 design instructions

**Rules**：只用 Markdown。不添加新信息。忠实保留数据。从输出中剥离任何 credentials 或 secrets。

详细格式见 `references/structured-content-template.md`。

### Step 3: Recommend Combinations

**3.1 先检查 Keyword Shortcuts**：如果用户输入匹配 **Keyword Shortcuts** 表中的关键词，使用关联 layout 作为首选推荐，并将关联 styles 作为顶部推荐。跳过基于内容的 layout 推断。

**3.2 否则**，基于以下因素推荐 3-5 个 layout x style 组合：

- Data structure → 匹配 layout
- Content tone → 匹配 style
- Audience expectations
- User design instructions

### Step 4: Confirm Options

**Hard gate**：按照 [Confirmation Policy](#confirmation-policy)，此步骤强制执行。用户在这里确认前（或在当前请求中明确用 `--no-confirm` / 等价表述跳过前），不得开始 Step 5-6。

按本文件顶部 [User Input Tools](#user-input-tools) 规则询问用户确认下列问题（如果 runtime 支持多个问题，则合并到一次调用；否则按优先级逐个询问）。

| Priority | Question | When | Options |
|----------|----------|------|---------|
| 1 | **Combination** | Always | 3+ layout x style combos with rationale |
| 2 | **Aspect** | Always | Named presets（landscape/portrait/square）或 custom W:H ratio（例如 3:4, 4:3, 2.35:1） |
| 3 | **Language** | 仅当 source ≠ user language | 文字内容语言 |
| 4 | **Image Backend** | 仅当 `## Image Generation Tools` 规则第 3 步需要询问时（没有 runtime-native tool 且存在多个非原生 backend，或 `preferred_image_backend: ask`） | Available backends |

### Step 5: Generate Prompt → `prompts/infographic.md`

**Backup rule**：如果 `prompts/infographic.md` 已存在，重命名为 `prompts/infographic-backup-YYYYMMDD-HHMMSS.md`

组合：

1. 来自 `references/layouts/<layout>.md` 的 layout definition
2. 来自 `references/styles/<style>.md` 的 style definition
3. 来自 `references/base-prompt.md` 的 base template
4. Step 2 的 structured content
5. 所有文字使用已确认语言

**Aspect ratio resolution** for `{{ASPECT_RATIO}}`：

- Named presets → ratio string：landscape→`16:9`、portrait→`9:16`、square→`1:1`
- Custom W:H ratios → 原样使用（例如 `3:4`、`4:3`、`2.35:1`）

### Step 6: Generate Image

1. 按本文件顶部 `## Image Generation Tools` 规则解析 backend。
2. 确保完整最终 prompt 已持久化到 `prompts/infographic.md`（Step 5 已写入），然后才能调用 backend；该文件是可复现记录。
3. **Check for existing file**：生成前检查 `infographic.png` 是否存在。
   - 如果存在：重命名为 `infographic-backup-YYYYMMDD-HHMMSS.png`
4. 使用 prompt 文件和输出路径调用所选 backend。
   - **`codex-imagegen` invocation**：当规则解析到 `codex-imagegen` 时，查看 [references/codex-imagegen.md](references/codex-imagegen.md) 了解调用契约（首选 `baoyu-image-gen --provider codex-cli` 路径、runtime wrapper 发现、参数说明、stdout schema、batch 语义）。
5. 失败时自动重试一次。

Text correction policy：

- 如果 labels、headings、callouts、data values 或任何其他渲染文字拼写错误、乱码、难以阅读或视觉效果弱，不要用代码修补 bitmap。
- 对文字修正的重新生成，应写入新的 prompt 文件和新的输出路径，以便保留有缺陷候选用于比较。
- Post-processing 仅限 crop、resize、compression 或 format conversion，且不得改动文字或主体构图。

### Step 7: Output Summary

报告：topic、layout、style、aspect、language、image backend、output path、created files。

## References

- `references/analysis-framework.md` - 分析方法
- `references/structured-content-template.md` - 内容格式
- `references/base-prompt.md` - Prompt template
- `references/layouts/<layout>.md` - 21 个 layout definitions
- `references/styles/<style>.md` - 21 个 style definitions

## Changing Preferences

EXTEND.md 位于 Step 1.1 列出的第一个匹配路径。可用三种方式修改：

- **直接编辑**：打开 EXTEND.md 并修改字段。完整 schema：`references/config/preferences-schema.md`。
- **交互式重新配置**：删除 EXTEND.md（或请求“reconfigure baoyu-infographic preferences” / “重新配置”）。下次运行会重新触发 first-time setup。
- **常见单行修改**：
  - `preferred_image_backend: auto`：默认；runtime-native tool 优先，退回到唯一已安装 backend，仅在存在多个非原生 backend 时询问。
  - `preferred_image_backend: codex-imagegen`：固定到 Codex 内置 backend。
  - `preferred_image_backend: baoyu-image-gen`：固定到 baoyu-image-gen skill。
  - `preferred_image_backend: ask`：每次运行都确认 backend。
  - `preferred_layout: dense-modules`、`preferred_style: morandi-journal`、`preferred_aspect: portrait`、`language: zh`：调整 Step 3 推荐和 Step 4 默认值（按照 [Confirmation Policy](#confirmation-policy)，这些设置绝不会绕过 Step 4）。
