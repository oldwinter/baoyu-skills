---
name: baoyu-cover-image
description: 生成文章封面图，使用 5 个维度（type、palette、rendering、text、mood），组合 11 种 color palettes 和 7 种 rendering styles。支持 cinematic（2.35:1）、widescreen（16:9）和 square（1:1）aspects。当用户要求 "generate cover image"、"create article cover" 或 "make cover" 时使用。
version: 1.117.5
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-cover-image
---

# Cover Image Generator

为文章生成优雅封面图，并支持 5-dimensional customization。

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Image Generation Tools

当该 skill 需要渲染图片时，按以下顺序解析 backend：

1. **Current-request override**：如果用户在当前消息中点名某个 backend，就使用它。
2. **Saved preference**：如果 `EXTEND.md` 把 `preferred_image_backend` 设置为当前可用 backend，就使用它。
3. **Auto-select**（当 preference 为 `auto`、未设置，或 pinned backend 不可用时）：
   - **Codex（`imagegen`）**：首先检查 available-skills / tool inventory。如果列出了名为 `imagegen` 的 skill，说明你运行在 Codex 内，必须使用它：通过 `Skill` tool 调用，参数为 `skill: "imagegen"`，并传入已保存 prompt file 的内容（再按 Codex `imagegen` 自身参数传 output path 和 aspect ratio）。Codex `imagegen` 是该 runtime 中的官方 raster backend，优先级高于任何非 native skill（例如 `baoyu-image-gen`），除非用户显式 pinned 了不同的 `preferred_image_backend`。
   - **Codex via `codex exec`（`codex-imagegen`）**：如果当前 runtime 没有 native `imagegen` skill，但 `codex` CLI 在 `PATH` 中且已有有效 `codex login`，通过 `baoyu-image-gen --provider codex-cli` 路由（preferred）；如果 baoyu-image-gen 不可用，则直接调用 bundled wrapper。详情、参数和 runtime-discovery procedure 见 [references/codex-imagegen.md](references/codex-imagegen.md)，仅在选择该分支时加载。
   - **Other runtime-native tools**：如果 runtime 暴露其他 native image tool（例如 Hermes `image_generate`），以同样方式使用。
   - 否则，如果只安装了一个 non-native backend（例如 `baoyu-image-gen`），使用它。
   - 否则（多个 non-native backends 且无 runtime-native tool），询问用户一次，并与其他初始问题 batch。
4. **如果没有可用 backend**，告诉用户并询问如何继续。

**⛔ 绝不要用 SVG、HTML、canvas 或其他 code-based rendering 替代 raster image generation。** Codex `imagegen` 自身说明表示，当输出应为 bitmap asset 而不是 repo-native code 或 vector 时应使用它。如果第 3 步无法解析 raster backend，就进入第 4 步询问用户；不要静默输出 SVG、写 inline `<svg>` markup，或用 HTML/CSS art 替代。即使文章/段落看起来像 "diagram-like" 也一样：调用本规则的 consumer skill 已经决定需要 raster image。

**⛔ 绝不要通过在已生成 bitmap 上涂改来修复渲染文字。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何 programmatic overlay 去覆盖、重写、擦除、描边或替换已生成封面图中的 title/subtitle text。如果文字错误或不清晰，请用修正后的 prompt 重新生成，切换到低文字量或无标题版本，或询问用户保留哪个不完美候选。

设置 `preferred_image_backend: ask` 会强制每次运行都执行第 3 步的询问，无论当前有哪些 backend。用户可通过下方 `## Changing Preferences` section 修改 pinned backend。

**Prompt file requirement（hard）**：调用任何 backend **之前**，必须把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。Backend 接收 prompt file（或其内容）；该文件是 reproducibility record，也允许在不重新生成 prompts 的情况下切换 backend。

上方具体工具名（`imagegen`、`image_generate`、`baoyu-image-gen`）都是示例；其他 runtime 中请按同一规则替换成本地等价工具。

## Confirmation Policy

默认行为：**生成前确认**。

- 显式 skill invocation、file path、匹配到的 keywords/presets、`EXTEND.md` defaults，以及任何文档化 auto-selection，都只视为 **recommendation inputs**。它们都不授权跳过确认。
- 用户确认 dimensions / aspect / language / backend choices 前，不要开始 Step 3 或 Step 4。
- 只有当前请求明确表示跳过确认时才跳过，例如：`--quick`、"直接生成"、"不用确认"、"跳过确认"、"按默认出图" 或等价表达。`EXTEND.md` 中的 `quick_mode: true` 算作持续的 explicit opt-out；只有当你希望每次运行都跳过 Step 2 时才设置。
- 如果确认被显式跳过，在生成前的下一条用户可见 update 中说明 assumed dimensions / aspect / language / backend。

## Options

| Option | Description |
|--------|-------------|
| `--type <name>` | hero、conceptual、typography、metaphor、scene、minimal |
| `--palette <name>` | warm、elegant、cool、dark、earth、vivid、pastel、mono、retro、duotone、macaron |
| `--rendering <name>` | flat-vector、hand-drawn、painterly、digital、pixel、chalk、screen-print |
| `--style <name>` | Preset shorthand（见 [Style Presets](references/style-presets.md)） |
| `--text <level>` | none、title-only、title-subtitle、text-rich |
| `--mood <level>` | subtle、balanced、bold |
| `--font <name>` | clean、handwritten、serif、display |
| `--aspect <ratio>` | 16:9（default）、2.35:1、4:3、3:2、1:1、3:4 |
| `--lang <code>` | Title language（en、zh、ja 等） |
| `--no-title` | `--text none` 的 alias |
| `--quick` | 跳过 confirmation，使用 auto-selection |
| `--ref <files...>` | 用于 style/composition guidance 的 reference images |

## Five Dimensions

| Dimension | Values | Default |
|-----------|--------|---------|
| **Type** | hero、conceptual、typography、metaphor、scene、minimal | auto |
| **Palette** | warm、elegant、cool、dark、earth、vivid、pastel、mono、retro、duotone、macaron | auto |
| **Rendering** | flat-vector、hand-drawn、painterly、digital、pixel、chalk、screen-print | auto |
| **Text** | none、title-only、title-subtitle、text-rich | title-only |
| **Mood** | subtle、balanced、bold | balanced |
| **Font** | clean、handwritten、serif、display | clean |

Auto-selection rules：[references/auto-selection.md](references/auto-selection.md)

## Galleries

**Types**：hero、conceptual、typography、metaphor、scene、minimal
→ Details：[references/types.md](references/types.md)

**Palettes**：warm、elegant、cool、dark、earth、vivid、pastel、mono、retro、duotone、macaron
→ Details：[references/palettes/](references/palettes/)

**Renderings**：flat-vector、hand-drawn、painterly、digital、pixel、chalk、screen-print
→ Details：[references/renderings/](references/renderings/)

**Text Levels**：none（pure visual）| title-only（default）| title-subtitle | text-rich（with tags）
→ Details：[references/dimensions/text.md](references/dimensions/text.md)

**Mood Levels**：subtle（low contrast）| balanced（default）| bold（high contrast）
→ Details：[references/dimensions/mood.md](references/dimensions/mood.md)

**Fonts**：clean（sans-serif）| handwritten | serif | display（bold decorative）
→ Details：[references/dimensions/font.md](references/dimensions/font.md)

## File Structure

Output directory 由 `default_output_dir` preference 决定：

- `same-dir`：`{article-dir}/`
- `imgs-subdir`：`{article-dir}/imgs/`
- `independent`（default）：`cover-image/{topic-slug}/`

```text
<output-dir>/
├── source-{slug}.{ext}    # Source files
├── refs/                  # Reference images (if provided)
│   ├── ref-01-{slug}.{ext}
│   └── ref-01-{slug}.md   # Description file
├── prompts/cover.md       # Generation prompt
└── cover.png              # Output image
```

**Slug**：2-4 个词，kebab-case。冲突时追加 `-YYYYMMDD-HHMMSS`

## Workflow

### Progress Checklist

```text
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Analyze content + save refs + determine output dir
- [ ] Step 2: Confirm options (6 dimensions) ⚠️ unless --quick
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Flow

```text
Input → [Step 0: Preferences] ─┬─ Found → Continue
                               └─ Not found → First-Time Setup ⛔ BLOCKING → Save EXTEND.md → Continue
        ↓
Analyze + Save Refs → [Output Dir] → [Confirm: 6 Dimensions] → Prompt → Generate → Complete
                                              ↓
                                     (skip if --quick or all specified)
```

### Step 0：Load Preferences ⛔ BLOCKING

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-cover-image/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-cover-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | Load，display summary → Continue |
| Not found | ⛔ 运行 first-time setup（[references/config/first-time-setup.md](references/config/first-time-setup.md)）→ Save → Continue |

**CRITICAL**：如果没有找到，先完成 setup，再做任何其他步骤或问题。

### Step 1：Analyze Content

1. **Save reference images**（如提供）→ [references/workflow/reference-images.md](references/workflow/reference-images.md)
2. **Save source content**（如为 pasted content，保存到 `source.md`）
3. **Analyze content**：topic、tone、keywords、visual metaphors
4. **Deep analyze references** ⚠️：提取具体、明确的 elements（见 reference-images.md）
5. **Detect language**：比较 source、user input、EXTEND.md preference
6. **Determine output directory**：按 File Structure rules

**⚠️ People in Reference Images：**

如果 reference images 中包含 **people**，且这些人物应出现在 cover 中：

- **Model supports `--ref`**（default）：把 image 复制到 `refs/`，生成时通过 `--ref` 传入。不需要 description file：model 能直接看到 face。
- **Model does NOT support `--ref`**（Jimeng、Seedream 3.0）：创建 `refs/ref-NN-{slug}.md`，写入每个 character description（hair、glasses、skin tone、clothing）。在 prompt text 中作为 MUST/REQUIRED instructions 嵌入。

完整 decision table 见 [reference-images.md](references/workflow/reference-images.md)。

### Step 2：Confirm Options ⚠️

**Hard gate**：按 [Confirmation Policy](#confirmation-policy)，该步骤是 mandatory。用户在这里确认前（或用 `--quick` / `quick_mode: true` / 当前请求中的等价表达显式 opt out 前），Steps 3-4 不能开始。

**必须使用 `AskUserQuestion` tool** 展示 interactive selection，而不是 plain text tables。在一次 `AskUserQuestion` 调用中最多展示 4 个问题（Type、Palette、Rendering、Font + Settings）。每个问题把推荐选项放第一，并附 reason，后面列 alternatives。

完整 confirmation flow 和 question format：[references/workflow/confirm-options.md](references/workflow/confirm-options.md)

| Condition | Skipped | Still Asked |
|-----------|---------|-------------|
| `--quick` 或 `quick_mode: true` | 6 dimensions | Aspect ratio（除非有 `--aspect`） |
| All 6 + `--aspect` specified | All | None |

### Step 3：Create Prompt

保存到 `prompts/cover.md`。Template：[references/workflow/prompt-template.md](references/workflow/prompt-template.md)

**CRITICAL - References in Frontmatter**：

- 保存到 `refs/` 的 files → 加入 frontmatter `references` list
- Verbal style extraction（无 file）→ 省略 `references`，在 body 中描述
- 写入前验证：`test -f refs/ref-NN-{slug}.{ext}`

Prompt body 中的 **Reference elements** 必须详细，带 "MUST"/"REQUIRED" 前缀，并说明 integration approach。

### Step 4：Generate Image

1. 如果是 regenerate，先 **Backup existing** `cover.png`
2. 按顶部 `## Image Generation Tools` rule **Select backend**：使用可用 backend；多个时询问用户一次。每个 session 在任何 generation 前做一次。
3. 调用 backend **之前**，把完整 final prompt 写入 `prompts/01-cover-[slug].md`（hard requirement）。
4. 从 prompt frontmatter 处理 references：
   - `direct` usage → 通过 `--ref` 传入（使用 ref-capable backend）
   - `style`/`palette` → 提取 traits 并追加到 prompt
5. **Generate**：用 prompt file、output path、aspect ratio 调用所选 backend。
   - **`codex-imagegen`**：调用 contract 见 [references/codex-imagegen.md](references/codex-imagegen.md)（preferred `baoyu-image-gen --provider codex-cli` path、runtime wrapper discovery、parameter notes、stdout schema、batch semantics）。
   - **Codex `imagegen`（native）** 或其他 runtime-native tools / `baoyu-image-gen` skill：按上方 `## Image Generation Tools` rule。
6. 失败时：auto-retry once

### Step 5：Completion Report

```text
Cover Generated!

Topic: [topic]
Type: [type] | Palette: [palette] | Rendering: [rendering]
Text: [text] | Mood: [mood] | Font: [font] | Aspect: [ratio]
Title: [title or "visual only"]
Language: [lang] | Watermark: [enabled/disabled]
References: [N images or "extracted style" or "none"]
Location: [directory path]

Files:
✓ source-{slug}.{ext}
✓ prompts/cover.md
✓ cover.png
```

## Image Modification

| Action | Steps |
|--------|-------|
| **Regenerate** | Backup → 先更新 prompt file → Regenerate |
| **Change dimension** | Backup → Confirm new value → Update prompt → Regenerate |

Text correction policy：

- 如果 title/subtitle 拼写错误、乱码、难读或视觉弱，不要用代码 patch bitmap。
- 对 text-correction regenerations，写入新的 prompt file 和新的 output path，保留 flawed candidate 供对比。
- Post-processing 仅限 crop、resize、compression 或 format conversion，且不得改变 text 或 main composition。

## Composition Principles

- **Whitespace**：40-60% breathing room
- **Visual anchor**：Main element centered 或 offset left
- **Characters**：Simplified silhouettes；不要 realistic humans
- **Title**：使用用户/source 的 exact title；绝不 invent

## Changing Preferences

EXTEND.md 位于 **Step 0** 中记录的路径。三种修改方式：

- **Edit directly**：打开 EXTEND.md 并修改 fields。完整 schema：[references/config/preferences-schema.md](references/config/preferences-schema.md)。
- **Reconfigure interactively**：删除 EXTEND.md（或请求 "reconfigure baoyu-cover-image preferences" / "重新配置"）。下一次运行会重新触发 first-time setup。
- **Common one-line edits**：
  - `preferred_image_backend: auto`：默认；runtime-native tool 优先，fallback 到唯一已安装 backend，仅当多个 non-native 存在时询问。
  - `preferred_image_backend: codex-imagegen`：pin 到 Codex built-in。
  - `preferred_image_backend: baoyu-image-gen`：pin 到 baoyu-image-gen skill。
  - `preferred_image_backend: ask`：每次运行确认 backend。
  - `watermark.enabled: true`、`preferred_type`、`preferred_palette`、`preferred_rendering`、`default_aspect`、`quick_mode: true`、`language`：调整 auto-selection defaults 和 confirmation flow。

## References

**Dimensions**：[text.md](references/dimensions/text.md) | [mood.md](references/dimensions/mood.md) | [font.md](references/dimensions/font.md)
**Palettes**：[references/palettes/](references/palettes/)
**Renderings**：[references/renderings/](references/renderings/)
**Types**：[references/types.md](references/types.md)
**Auto-Selection**：[references/auto-selection.md](references/auto-selection.md)
**Style Presets**：[references/style-presets.md](references/style-presets.md)
**Compatibility**：[references/compatibility.md](references/compatibility.md)
**Visual Elements**：[references/visual-elements.md](references/visual-elements.md)
**Workflow**：[confirm-options.md](references/workflow/confirm-options.md) | [prompt-template.md](references/workflow/prompt-template.md) | [reference-images.md](references/workflow/reference-images.md)
**Config**：[preferences-schema.md](references/config/preferences-schema.md) | [first-time-setup.md](references/config/first-time-setup.md) | [watermark-guide.md](references/config/watermark-guide.md)
