# Detailed Workflow Procedures

## Step 1: Pre-check

### 1.0 Detect & Save Reference Images ⚠️ REQUIRED if images provided

检查用户是否提供了 reference images。按输入类型处理：

| Input Type | Action |
|------------|--------|
| 提供 image file path | 复制到 `references/` 子目录 → 可使用 `--ref` |
| 对话中有图片（无 path） | 使用 AskUserQuestion **询问用户文件路径** |
| 用户无法提供 path | 用文字提取 style/palette → 追加到 prompts（不写 frontmatter references） |

**CRITICAL**：只有文件确实已保存到 `references/` 目录时，才在 prompt frontmatter 中添加 `references`。

**如果用户提供文件路径**：

1. 复制到 `references/NN-ref-{slug}.png`
2. 创建描述文件：`references/NN-ref-{slug}.md`
3. 继续前验证文件存在

**如果用户无法提供 path**（用文字提取）：

1. 视觉分析图片，提取：colors、style、composition
2. 创建 `references/extracted-style.md`，写入提取信息
3. 不要在 prompt frontmatter 中添加 `references`
4. 改为将提取出的 style/colors 直接追加到 prompt text

**Description File Format**（仅当保存了文件时）：

```yaml
---
ref_id: NN
filename: NN-ref-{slug}.png
---
[User's description or auto-generated description]
```

**Verification**（仅针对已保存文件）：

```text
Reference Images Saved:
- 01-ref-{slug}.png ✓ (can use --ref)
- 02-ref-{slug}.png ✓ (can use --ref)
```

**Or for extracted style**：

```text
Reference Style Extracted (no file):
- Colors: #E8756D coral, #7ECFC0 mint...
- Style: minimal flat vector, clean lines...
→ Will append to prompt text (not --ref)
```

---

### 1.1 Determine Input Type

| Input | Output Directory | Next |
|-------|------------------|------|
| File path | EXTEND.md `default_output_dir`（默认：`imgs-subdir`）。未配置时在 1.2 中确认。 | → 1.2 |
| Pasted content | `illustrations/{topic-slug}/` | → 1.4 |

**Backup rule for pasted content**：如果目标目录中已存在 `source.md`，保存前重命名为 `source-backup-YYYYMMDD-HHMMSS.md`。

### 1.2-1.4 Configuration (file path input only)

检查 preferences 和 existing state，然后用一次 AskUserQuestion 调用询问所有必要问题（最多 4 个问题）。

**Questions to include**（如果 preference 已存在或不适用则跳过）：

| Question | When to Ask | Options |
|----------|-------------|---------|
| Output directory | EXTEND.md 中没有 `default_output_dir` | `{article-dir}/imgs/` (Recommended), `{article-dir}/`, `{article-dir}/illustrations/`, `illustrations/{topic-slug}/` |
| Existing images | Target dir 中有 `.png/.jpg/.webp` 文件 | `supplement`, `overwrite`, `regenerate` |
| Article update | 始终询问（file path input） | `update`, `copy` |

**Preference Values**（已配置时跳过询问）：

| `default_output_dir` | Path |
|----------------------|------|
| `same-dir` | `{article-dir}/` |
| `imgs-subdir` | `{article-dir}/imgs/` |
| `illustrations-subdir` | `{article-dir}/illustrations/` |
| `independent` | `illustrations/{topic-slug}/` |

### 1.5 Load Preferences (EXTEND.md) ⛔ BLOCKING

**CRITICAL**：如果未找到 EXTEND.md，必须先完成 first-time setup，然后才能进行任何其他问题或步骤。不要进入 reference images，不要询问内容，不要询问 type/style；只完成 preferences setup。

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-article-illustrator/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-article-illustrator/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-article-illustrator/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-article-illustrator/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md") { "user" }
```

| Result | Action |
|--------|--------|
| Found | 读取、解析、展示摘要 → Continue |
| Not found | ⛔ **BLOCKING**：只运行 first-time setup（[config/first-time-setup.md](config/first-time-setup.md)）→ 完成并保存 EXTEND.md → 然后继续 |

**Supports**：Watermark | Preferred type/style | Custom styles | Language | Output directory

---

## Step 2: Setup & Analyze

### 2.1 Analyze Content

| Analysis | Description |
|----------|-------------|
| Content type | Technical / Tutorial / Methodology / Narrative |
| Illustration purpose | information / visualization / imagination |
| Core arguments | 需要可视化的 2-5 个主要观点 |
| Visual opportunities | 插图能提供价值的位置 |
| Recommended type | 基于 content signals 和 purpose |
| Recommended density | 基于长度和复杂度 |

### 2.2 Extract Core Arguments

- Main thesis
- 读者需要的 key concepts
- Comparisons/contrasts
- 提出的 framework/model

**CRITICAL**：如果文章使用隐喻（例如“电锯切西瓜”），不要按字面画。应可视化**底层概念**。

### 2.3 Identify Positions

**Illustrate**：

- Core arguments（REQUIRED）
- Abstract concepts
- Data comparisons
- Processes、workflows

**Do NOT Illustrate**：

- 字面化 metaphors
- Decorative scenes
- Generic illustrations

### 2.4 Analyze Reference Images (if provided in Step 1.0)

对每张 reference image：

| Analysis | Description |
|----------|-------------|
| Visual characteristics | Style、colors、composition |
| Content/subject | Reference 描绘什么 |
| Suitable positions | 哪些 sections 匹配此 reference |
| Style match | 哪些 illustration types/styles 匹配 |
| Usage recommendation | `direct` / `style` / `palette` |

| Usage | When to Use |
|-------|-------------|
| `direct` | Reference 与期望输出高度匹配 |
| `style` | 只提取 visual style characteristics |
| `palette` | 只提取 color scheme |

---

## Step 3: Confirm Settings ⚠️

**不要跳过。** 使用一次 AskUserQuestion 调用，最多 4 个问题。**Q1、Q2、Q3 都是 REQUIRED。**

### Q1: Preset or Type ⚠️ REQUIRED

基于 Step 2 内容分析，先推荐 preset（同时设置 type 和 style）。查看 [style-presets.md](style-presets.md) 的 "Content Type → Preset Recommendations" 表。

- [Recommended preset] — [brief: type + style + why] (Recommended)
- [Alternative preset] — [brief]
- 或手动选择 type：infographic / scene / flowchart / comparison / framework / timeline / mixed

**Default**：如果 Step 2 没有发现强 content signal，recommended preset 必须是 `hand-drawn-edu`（infographic + sketch-notes + macaron — 暖奶油纸张、黑色手绘线条、柔和 pastel blocks）。这是通用 fallback。

**如果用户选择 preset → 跳过 Q3**（type 和 style 都已解析）。
**如果用户选择 type → Q3 REQUIRED。**

### Q2: Density ⚠️ REQUIRED - DO NOT SKIP

- minimal (1-2) - 只覆盖核心概念
- balanced (3-5) - 主要 sections
- per-section - 每个 section/chapter 至少 1 张（Recommended）
- rich (6+) - 全面覆盖

### Q3: Style ⚠️ REQUIRED (skip if preset chosen in Q1)

如果 EXTEND.md 有 `preferred_style`：

- [Custom style name + brief description] (Recommended)
- [Top compatible core style 1]
- [Top compatible core style 2]
- Other（见完整 Style Gallery）

如果没有 `preferred_style`（先展示 Core Styles）：

- [Best compatible core style] (Recommended)
- [Other compatible core style 1]
- [Other compatible core style 2]
- Other（见完整 Style Gallery）

**Core Styles**（简化选择）：

| Core Style | Maps To | Best For |
|------------|---------|----------|
| `hand-drawn` | sketch-notes | **默认。** 暖奶油纸张、黑色手绘线条、pastel blocks — 教育信息图、概念解释、onboarding、通用知识文章 |
| `minimal-flat` | notion | 通用、knowledge sharing、SaaS |
| `sci-fi` | blueprint | AI、frontier tech、system design |
| `editorial` | editorial | Processes、data、journalism |
| `scene` | warm/watercolor | Narratives、emotional、lifestyle |
| `poster` | screen-print | Opinion、editorial、cultural、cinematic |

**Default recommendation**：当 Step 2 没有强 content signal 时，在 Q1 中推荐 **`hand-drawn-edu`** preset（→ infographic + sketch-notes + macaron）作为 primary option。用户手动选择 type 且没有 preferred_style 时，在 Q3 中优先推荐 `sketch-notes`。

Style selection 基于 Type × Style compatibility matrix（styles.md）。
**在 Step 5.1**，读取 `styles/<style>.md` 获取 visual elements 和 rendering rules。

### Q4: Palette (optional)

如果 preset 未指定 palette，且用户可能受益于 palette override，则提供可用 palettes：

- Default（使用 style 内置颜色）(Recommended)
- `macaron` — 暖奶油底上的柔和 pastel blocks
- `warm` — 暖 earth tones，无冷色
- `neon` — 深色背景上的 vibrant neon

**Skip if**：preset 已解析 palette，或 EXTEND.md 中设置了 `preferred_palette`。

参见 [styles.md](styles.md#palette-gallery) 中的 Palette Gallery，以及 `palettes/<palette>.md` 中的完整规格。

### Q5: Image Text Language ⚠️ REQUIRED when article language ≠ EXTEND.md `language`

从内容检测 article language。如果与 EXTEND.md `language` 设置不同，必须询问：

- Article language（匹配文章内容）(Recommended)
- EXTEND.md language（用户的一般偏好）

**Skip only if**：Article language 匹配 EXTEND.md `language`，或 EXTEND.md 没有 `language` 设置。

### Display Reference Usage (if references detected in Step 1.0)

向用户展示 outline preview 时，显示 reference assignments：

```text
Reference Images:
| Ref | Filename | Recommended Usage |
|-----|----------|-------------------|
| 01 | 01-ref-diagram.png | direct → Illustration 1, 3 |
| 02 | 02-ref-chart.png | palette → Illustration 2 |
```

---

## Step 4: Generate Outline

保存为 `{output-dir}/outline.md`（下方所有路径均相对 Step 1.1/1.2 确定的 output directory）：

```yaml
---
type: infographic
density: balanced
style: blueprint
image_count: 4
references:                    # Only if references provided
  - ref_id: 01
    filename: 01-ref-diagram.png
    description: "Technical diagram showing system architecture"
  - ref_id: 02
    filename: 02-ref-chart.png
    description: "Color chart with brand palette"
---

## Illustration 1

**Position**: [section] / [paragraph]
**Purpose**: [why this helps]
**Visual Content**: [what to show]
**Type Application**: [how type applies]
**References**: [01]                    # Optional: list ref_ids used
**Reference Usage**: direct             # direct | style | palette
**Filename**: 01-infographic-concept-name.png

## Illustration 2
...
```

**Requirements**：

- 每个 position 都要由内容需求支撑
- Type applied consistently
- Style 要体现在 descriptions 中
- Count 匹配 density
- References 基于 Step 2.4 analysis 分配

---

## Step 5: Generate Images

### 5.1 Create Prompts ⛔ BLOCKING

**每张插图在生成前都必须有已保存的 prompt file。不要跳过此步骤。**

对 outline 中每张插图：

1. **Create prompt file**：`{output-dir}/prompts/NN-{type}-{slug}.md`
2. **Include YAML frontmatter**：
   ```yaml
   ---
   illustration_id: 01
   type: infographic
   style: custom-flat-vector
   ---
   ```
3. **Load style specs**：读取 `styles/<style>.md`，获取 visual elements、style rules 和 rendering instructions
4. **Load palette specs**（如果指定 palette）：读取 `palettes/<palette>.md`，获取 colors 和 background。Palette colors **替换** style 默认 Color Palette。未指定 palette 时，使用 style 内置颜色。
5. **Follow type-specific template**：按 [prompt-construction.md](prompt-construction.md)，结合 style rendering + palette colors（或 style default）
6. **Prompt quality requirements**（全部 REQUIRED）：
   - `Layout`：描述整体构图（grid / radial / hierarchical / left-right / top-down）
   - `ZONES`：用具体内容描述每个 visual area，不要模糊描述
   - `LABELS`：使用文章中的**实际数字、术语、指标、quotes**，不要用 generic placeholders
   - `COLORS`：从 palette（或 style default）指定 hex codes，并说明语义
   - `STYLE`：按 style rules 描述 line treatment、texture、mood、character rendering
   - `ASPECT`：指定 ratio（例如 `16:9`）
7. **Apply defaults**：composition requirements、character rendering、text guidelines、watermark
8. **Backup rule**：如果 prompt file 已存在，重命名为 `prompts/NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.md`

**Verification** ⛔：进入 5.2 前，确认所有 prompt files 存在：

```text
Prompt Files:
- prompts/01-infographic-overview.md ✓
- prompts/02-infographic-distillation.md ✓
...
```

**不要**在未先保存 prompt files 的情况下，将临时 inline text 传给 `--prompt`。生成命令应使用 `--promptfiles prompts/NN-{type}-{slug}.md`，或读取已保存文件内容作为 `--prompt`。

**Execution choice**：

- 如果多张插图已经有已保存 prompt files，且任务现在只是生成图片，默认使用 batch generation。
- 优先使用所选 backend 的原生 batch / multi-task interface。
- 如果 backend 没有原生 batch interface，但 runtime 可发起并行 tool calls，则一次最多分发 `generation_batch_size` 个 tasks。默认：`4`。当前用户请求覆盖 EXTEND.md。
- 只有当 backend batch 和 runtime parallel calls 都不可用时，才顺序生成。
- 只有当每张插图仍需要单独 prompt rewriting、style exploration 或其他 per-image reasoning 时才使用 subagents。不要仅为了并行渲染而使用 subagents。

**CRITICAL - References in Frontmatter**：

- 只有文件确实存在于 `references/` 目录时，才添加 `references` 字段
- 如果 style/palette 是用文字提取的（没有文件），将信息追加到 prompt BODY
- 写入 frontmatter 前验证：`test -f references/NN-ref-{slug}.png`

### 5.2 Select Generation Skill

按 `SKILL.md` 顶部的 `## Image Generation Tools` 规则执行。具体来说：

- 如果 available-skills list 中有 `imagegen`（Codex），使用它：通过 `Skill` tool 调用 `skill: "imagegen"`。
- 否则，如果 EXTEND.md 固定的 backend 可用，使用它。
- 否则，如果只安装了一个非原生 backend，使用它。
- 否则，询问用户。

**不要用 SVG、HTML 或任何 code-based vector 替代 raster image。** 如果无法解析 raster backend，询问用户如何继续。

### 5.3 Process References ⚠️ REQUIRED if references saved in Step 1.0

**如果用户提供了 reference images，不要跳过。** 对每张带 references 的插图：

1. **先验证文件存在**：
   ```bash
   test -f references/NN-ref-{slug}.png && echo "exists" || echo "MISSING"
   ```
   - 如果文件 MISSING 但在 frontmatter 中出现 → ERROR，修正 frontmatter 或移除 references 字段
   - 如果文件存在 → 继续处理

2. 读取 prompt frontmatter 中的 reference info
3. 按 usage type 处理：

| Usage | Action | Example |
|-------|--------|---------|
| `direct` | 将 reference path 添加到 `--ref` 参数 | `--ref references/01-ref-brand.png` |
| `style` | 分析 reference，将 style traits 追加到 prompt | "Style: clean lines, gradient backgrounds..." |
| `palette` | 从 reference 提取颜色并追加到 prompt | "Colors: #E8756D coral, #7ECFC0 mint..." |

4. 检查 image generation skill capability：

| Skill Supports `--ref` | Action |
|------------------------|--------|
| Yes（例如 baoyu-image-gen with Google） | 通过 `--ref` 传入 reference images |
| No | 转为文字描述，追加到 prompt |

**Verification**：生成前确认 reference processing：

```text
Reference Processing:
- Illustration 1: using 01-ref-brand.png (direct) ✓
- Illustration 2: extracted palette from 02-ref-style.png ✓
```

### 5.4 Apply Watermark (if enabled)

添加：`Include a subtle watermark "[content]" at [position].`

### 5.5 Generate

1. 从已保存 prompt files 构建 generation task list：
   - `prompt_file`: `{output-dir}/prompts/NN-{type}-{slug}.md`
   - `output_file`: `{output-dir}/NN-{type}-{slug}.png`
   - `aspect_ratio`: 来自 prompt frontmatter 或 prompt body
   - `refs`: 只包含 prompt frontmatter 中已验证的 `direct` references
2. **Backup rule**：分发 task 前，如果 output image 已存在，将其重命名为 `NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.{ext}`。
3. 分批分发 tasks：
   - Native batch backend：发送所有 eligible tasks；如果 backend 有实践限制，则按 `generation_batch_size` 分块。
   - Runtime parallel calls：一次并发最多 `generation_batch_size` 个 image calls，然后继续下一块。
   - Sequential fallback：一次处理一个 task。
4. 每个 task 完成后记录："Generated X/N: filename"。
5. 失败时：从同一个已保存 prompt file 重试该 failed task 一次。保留 successful outputs 并继续。

---

## Step 6: Finalize

### 6.1 Update Article

在对应段落后插入，使用相对文章文件的路径：

| `default_output_dir` | Insert Path |
|----------------------|-------------|
| `imgs-subdir` | `![description](imgs/NN-{type}-{slug}.png)` |
| `same-dir` | `![description](NN-{type}-{slug}.png)` |
| `illustrations-subdir` | `![description](illustrations/NN-{type}-{slug}.png)` |
| `independent` | `![description](illustrations/{topic-slug}/NN-{type}-{slug}.png)`（相对 cwd） |

Alt text：使用文章语言的简洁描述。

### 6.2 Output Summary

```text
Article Illustration Complete!

Article: [path]
Type: [type] | Density: [level] | Style: [style]
Location: [directory]
Images: X/N generated

Positions:
- 01-xxx.png → After "[Section]"
- 02-yyy.png → After "[Section]"

[If failures]
Failed:
- NN-zzz.png: [reason]
```
