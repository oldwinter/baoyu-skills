---
name: baoyu-cover-image
description: 生成文章封面图，使用 5 个维度（type、palette、rendering、text、mood），组合 11 种 color palettes 和 7 种 rendering styles。支持 cinematic（2.35:1）、widescreen（16:9）和 square（1:1）aspects。当用户要求 "generate cover image"、"create article cover" 或 "make cover" 时使用。
version: 1.117.5
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-cover-image
---

# Cover Image Generator

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Image Generation Tools

按以下顺序解析 image backend：

1. **用户在当前消息中点名某个 backend** → 使用它。
2. **`EXTEND.md` 中的 `preferred_image_backend`** 指向当前可用的 backend → 使用它。`ask` 表示每次运行都询问。
3. **Auto-select**（preference 为 `auto`、未设置，或 pinned backend 不可用），先匹配者胜出：
   - 可用 skills 中有 **Codex `imagegen`** skill → 说明你在 Codex 中，必须使用它：`Skill`，参数为 `skill: "imagegen"`，并传入 prompt file 内容、output path 和 aspect ratio。它优先于 `baoyu-image-gen` 等非 native skills。
   - **Codex via `codex exec`（`codex-imagegen`）**：没有 native `imagegen`，但 `codex` CLI 在 `PATH` 中且已有有效 `codex login` → `baoyu-image-gen --provider codex-cli`（preferred），如果 baoyu-image-gen 不可用则使用 bundled wrapper。仅在该分支加载 [references/codex-imagegen.md](references/codex-imagegen.md)。
   - **Cursor `GenerateImage`** → 使用它（优先于非 native skills）。它没有 aspect-ratio 参数，因此要在 `description` prompt 中说明宽高比/尺寸；它会保存到 tool 管理的位置，因此要把文件复制到期望的输出路径（例如 `outputs/.../NN-xxx.png`）。Reference images 放在 `reference_image_paths`。
   - **其他 runtime-native image tool**（例如 Hermes `image_generate`）→ 以同样方式使用。
   - 只安装了一个 non-native backend（例如 `baoyu-image-gen`）→ 使用它。
   - 有多个 non-native backends → 询问用户一次，并与其他初始问题 batch。
4. **没有可用 backend** → 告诉用户并询问如何继续。

**⛔ 仅 raster**：绝不要用 SVG、HTML/CSS、canvas 或其他 code-based rendering 替代 raster image，即使内容看起来像 diagram。如果无法解析 raster backend，进入第 4 步。

**⛔ 不要 patch bitmap 文字**：绝不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他 overlay 去覆盖、重写、擦除、描边或替换已生成封面图中的 title/subtitle text。用修正后的 prompt 重新生成、切换到低文字量或无标题版本，或询问用户保留哪个不完美候选。

**Prompt file（hard）**：调用任何 backend 之前，把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（`NN-{type}-[slug].md`），并把该文件（或其内容）传给 backend。它既是可复现记录，也允许在不重写 prompts 的情况下切换 backend。

通过下方 `## Changing Preferences` 修改 pinned backend。上方工具名只是示例；其他 runtime 使用本地等价工具。

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
| `--quick` | 跳过 confirmation（以及无 EXTEND.md 时的 first-time setup），使用 auto-selection |
| `--ref <files...>` | 用于 style/composition guidance 的 reference images |

## Five Dimensions

| Dimension | Default | Details |
|-----------|---------|---------|
| **Type** | auto | [types.md](references/types.md) |
| **Palette** | auto | [palettes/](references/palettes/) |
| **Rendering** | auto | [renderings/](references/renderings/) |
| **Text** | title-only | [dimensions/text.md](references/dimensions/text.md) |
| **Mood** | balanced | [dimensions/mood.md](references/dimensions/mood.md) |
| **Font** | clean | [dimensions/font.md](references/dimensions/font.md) |

取值见 Options。Auto-selection：[references/auto-selection.md](references/auto-selection.md)。Compatibility matrices：[references/compatibility.md](references/compatibility.md)。Icon vocabulary：[references/visual-elements.md](references/visual-elements.md)。

## File Structure

输出目录按 `default_output_dir` preference 决定：
- `same-dir`: `{article-dir}/`
- `imgs-subdir`: `{article-dir}/imgs/`
- `independent` (default): `cover-image/{topic-slug}/`

```
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

```
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING unless --quick
- [ ] Step 1: Analyze content + save refs + determine output dir
- [ ] Step 2: Confirm options (6 dimensions) ⚠️ unless --quick
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Step 0：Load Preferences ⛔ BLOCKING

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-cover-image/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-cover-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md` | User home |

- **Found** → load，display summary。
- **Not found** → ⛔ 运行 [first-time-setup](references/config/first-time-setup.md) 并保存，再执行任何其他步骤或问题。
- **Not found + 当前请求 opt out confirmation**（`--quick` 或按 [Confirmation Policy](#confirmation-policy) 的等价表达）→ 跳过 setup，使用内置 defaults：no watermark、dimensions auto-selected、`default_output_dir: independent`、language from content。不要询问，不要创建 EXTEND.md。对于无人值守运行（cron、CI），还要传 `--aspect`，让 Step 2 不再询问。

### Step 1: Analyze Content

1. **Save reference images**（如提供）→ [references/workflow/reference-images.md](references/workflow/reference-images.md)
2. **Save source content**（如为 pasted content，保存到 `source.md`）
3. **Analyze content**：topic、tone、keywords、visual metaphors
4. **Deep analyze references** ⚠️：提取具体、明确的 elements（见 reference-images.md）
5. **Detect language**：比较 source、user input、EXTEND.md preference
6. **Determine output directory**：按 File Structure rules

**Reference images 中应出现在封面里的人物：**
- **Model supports `--ref`**（default）：把 image 复制到 `refs/`，生成时通过 `--ref` 传入。不需要 description file。
- **Model does NOT support `--ref`**（Jimeng、Seedream 3.0）：创建 `refs/ref-NN-{slug}.md`，写入每个 character description（hair、glasses、skin tone、clothing）；在 prompt text 中作为 MUST/REQUIRED instructions 嵌入。

### Step 2: Confirm Options ⚠️

**Hard gate**：按 [Confirmation Policy](#confirmation-policy)，该步骤是 mandatory（opt-out：`--quick` / `quick_mode: true` / 当前请求中的等价表达）。

**必须使用 `AskUserQuestion`** 展示 interactive selection，而不是 plain text tables：一次调用最多 4 个问题（Type、Palette、Rendering、Font + Settings），每个问题把推荐选项放第一并附 reason。`--quick` / `quick_mode` 仍会询问 aspect ratio，除非给了 `--aspect`；6 个 dimensions + `--aspect` 全部指定时跳过全部询问。完整流程：[references/workflow/confirm-options.md](references/workflow/confirm-options.md)。

### Step 3: Create Prompt

保存到 `prompts/cover.md`，模板见 [references/workflow/prompt-template.md](references/workflow/prompt-template.md)。

- Frontmatter `references`：只列保存到 `refs/` 的 files（写入前验证 `test -f refs/ref-NN-{slug}.{ext}`）；verbal style extraction → 省略 `references`，在 body 中描述。
- Body 中的 reference elements 必须详细，带 "MUST"/"REQUIRED" 前缀，并说明 integration approach。

### Step 4: Generate Image

1. 如果是 regenerate，先 **Backup existing** `cover.png`
2. 按 `## Image Generation Tools` **Select backend**：每个 session 在任何 generation 前做一次。
3. 调用 backend **之前**，把完整 final prompt 写入 `prompts/01-cover-[slug].md`（hard requirement）。
4. 从 prompt frontmatter 处理 references：`direct` → 通过 `--ref` 传入（ref-capable backend）；`style`/`palette` → 提取 traits 并追加到 prompt。
5. **Generate**：用 prompt file、output path、aspect ratio 调用所选 backend。`codex-imagegen` 见 [references/codex-imagegen.md](references/codex-imagegen.md)。
6. 失败时：auto-retry once

### Step 5: Completion Report

```
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

Text correction：如果 title/subtitle 拼写错误、乱码、难读或视觉弱，不要用代码 patch bitmap。写入新的 prompt file 和新的 output path，保留 flawed candidate 供对比。Post-processing 仅限 crop、resize、compression 或 format conversion，且不得改变 text 或 main composition。

## Composition Principles

- **Whitespace**：40-60% breathing room
- **Visual anchor**：Main element centered 或 offset left
- **Characters**：Simplified silhouettes；不要 realistic humans
- **Title**：使用用户/source 的 exact title；绝不 invent

## Changing Preferences

EXTEND.md 位于 **Step 0** 中记录的路径。直接编辑它（schema：[references/config/preferences-schema.md](references/config/preferences-schema.md)；watermark：[references/config/watermark-guide.md](references/config/watermark-guide.md)），或删除它 / 请求 "reconfigure baoyu-cover-image preferences" / "重新配置" 以重新触发 first-time setup。常见修改：

- `preferred_image_backend`：`auto`（default；runtime-native 优先，否则使用唯一已安装 backend，多个 non-native 时询问）| `codex-imagegen` | `baoyu-image-gen` | `ask`（每次运行确认）
- `watermark.enabled: true`、`preferred_type`、`preferred_palette`、`preferred_rendering`、`default_aspect`、`quick_mode: true`、`language`：调整 auto-selection defaults 和 confirmation flow。
