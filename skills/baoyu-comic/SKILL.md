---
name: baoyu-comic
description: 支持多种 art styles 和 tones 的知识漫画创建器。创建带有详细 panel layouts 且支持批量图片生成的原创教育漫画。当用户要求创建 "知识漫画"、"教育漫画"、"biography comic"、"tutorial comic" 或 "Logicomix-style comic" 时使用。
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-comic
    requires:
      anyBins:
        - bun
        - npx
---

# 知识漫画创建器

使用灵活的 art style × tone 组合创建原创知识漫画。

## User Input Tools

当此 skill 需要向用户提问时，按以下工具选择规则执行（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等价工具。
2. **Fallback**：如果没有这类工具，输出带编号的纯文本消息，请用户针对每个问题回复所选编号或答案。
3. **Batching**：如果工具支持一次调用多个问题，将所有适用问题合并到一次调用中；如果只支持单问题，则按优先级逐个询问。

下面具体提到的 `AskUserQuestion` 都是示例；在其他 runtimes 中请替换为本地等价工具。

## Image Generation Tools

当此 skill 需要渲染图片时，按以下顺序解析 backend：

1. **当前请求覆盖**：如果用户在当前消息中指定某个 backend，就使用它。
2. **已保存偏好**：如果 `EXTEND.md` 将 `preferred_image_backend` 设为当前可用的 backend，就使用它。
3. **Auto-select**（当偏好为 `auto`、未设置，或固定的 backend 不可用时）：
   - **Codex (`imagegen`)**：先检查 available-skills / tool inventory。如果列表中存在名为 `imagegen` 的 skill，说明你正在 Codex 中运行，且必须使用它：通过 `Skill` tool 以 `skill: "imagegen"` 调用，传入已保存 prompt 文件的内容（以及 Codex `imagegen` 自身参数要求的输出路径和 aspect ratio）。Codex `imagegen` 是该 runtime 的官方 raster backend，优先级高于任何非原生 skill（如 `baoyu-image-gen`），除非用户已经明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**：如果当前 runtime 没有暴露原生 `imagegen` skill，但 `codex` CLI 在 `PATH` 中且已有有效 `codex login`，则通过 `baoyu-image-gen --provider codex-cli` 路由（优先），或者在 baoyu-image-gen 不可用时直接调用 bundled wrapper。细节、参数和 runtime-discovery 流程见 [references/codex-imagegen.md](references/codex-imagegen.md)，只有选中此分支时才加载该文件。
   - **其他 runtime-native tools**：如果 runtime 暴露了其他原生图片工具（如 Hermes `image_generate`），按同样方式使用。
   - 否则，如果只安装了一个 non-native backend（如 `baoyu-image-gen`），就使用它。
   - 否则（有多个 non-native backends 且没有 runtime-native tool），向用户询问一次，并与其他初始问题合并。
4. **如果没有任何可用 backend**，告知用户并询问如何继续。

**⛔ 绝不要用 SVG、HTML、canvas 或其他代码化渲染替代 raster image generation。** Codex `imagegen` 自身描述说明，它应在 "when the output should be a bitmap asset rather than repo-native code or vector." 时使用。如果无法通过步骤 3 解析出 raster backend，就进入步骤 4 并询问用户；不要静默输出 SVG、写 inline `<svg>` 标记，或生成 HTML/CSS art 作为替代。即使文章或章节看起来像 "diagram-like" 也一样：调用此规则的 consumer skill 已经判断它需要 raster image。

**⛔ 绝不要通过覆盖已生成 bitmap 来修复渲染文字。** 不要用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他程序化 overlay 去遮盖、重写、擦除、描边或替换已生成漫画页中的 dialogue、sound effects、panel labels 或任何其他文本。如果文字错误或不清楚，请用修正后的 prompt 重新生成，用更少或没有图中文字的方式重画页面，或询问用户保留哪个不完美候选。

设置 `preferred_image_backend: ask` 会强制每次运行都执行步骤 3 的询问，不受可用 backends 影响。用户可通过下面的 `## Changing Preferences` 章节修改固定 backend。

**Prompt 文件要求（硬性）**：调用任何 backend 之前，必须先将每张图片完整、最终版 prompt 写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。backend 接收 prompt 文件（或其内容）；该文件是可复现记录，也允许你在不重新生成 prompts 的情况下切换 backends。

上面的具体工具名（`imagegen`、`image_generate`、`baoyu-image-gen`）都是示例；请在相同规则下替换为本地等价工具。

## Batch Generation Policy

当前生成组的每个 prompt 文件都已保存并验证后，默认批量生成图片。

优先级顺序：

1. 如果所选 backend 有原生 batch / multi-task 接口，使用它。每个 task 必须保留自己的 prompt 文件、输出路径、aspect ratio、session ID 和 direct reference images。
2. 如果没有原生 batch 接口，但 runtime 可以发起 parallel tool calls，则每次最多派发 `generation_batch_size` 张图片。默认：`4`。当前消息中的显式用户请求（如 `--batch-size 4` 或“并行4张一起生成”）会覆盖 EXTEND.md。
3. 如果原生 batch 和 parallel tool calls 都不可用，则顺序生成。

规则：

- 优先遵守 workflow 依赖：先生成 `characters/characters.png`，再生成使用它作为 reference 的页面。
- 所有已选页面 prompt 文件都落盘前，绝不启动第一批页面生成。
- 失败项重试一次，不重新生成成功项。
- 不要仅为并行图片渲染而使用 subagents。subagents 只用于独立 prompt 迭代或创意探索。

## Reference Images

用户可以提供 reference images 来指导 art style、palette、scene composition 或 subject。这与自动生成的 character sheet（步骤 7.1）**相互独立**，两者可以并存：用户 refs 指导观感，character sheet 锚定重复出现角色的身份一致性。

**接收方式**：通过 `--ref <files...>` 接收，或在用户于对话中提供文件路径 / 粘贴图片时接收。
- 文件路径 → 复制到漫画输出旁的 `refs/NN-ref-{slug}.{ext}`
- 粘贴图片但无路径 → 按上面的 User Input Tools 规则询问用户路径，或作为文本 fallback 口头提取 style traits
- 无 reference → 跳过本节

**Usage modes**（每个 reference）：

| Usage | Effect |
|-------|--------|
| `direct` | 将文件作为 reference image 传给 backend，用于每页（或指定页面） |
| `style` | 提取 style traits（line treatment、texture、mood）并追加到每页 prompt body |
| `palette` | 提取 hex colors 并追加到每页 prompt body |

存在 refs 时，在每页 prompt frontmatter 中记录：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-scene.png
    usage: direct
```

**生成时**：
- 验证每个 referenced file 都存在于磁盘
- 如果 `usage: direct` 且所选 backend 接受多个 reference images → 通过 backend 的 ref 参数同时传入 character sheet（步骤 7.2）和用户 refs；按步骤 7.1 的指引先压缩图片，避免 payload failures
- 如果 backend 只接受一个 ref → 对有重复角色的页面优先使用 character sheet；将 user-ref traits 嵌入 prompt body
- 对 `style`/`palette` usage → 将提取的 traits 嵌入每页 prompt 文本（不受 backend capability 影响）

## Options

### Visual Dimensions

| Option | Values | 说明 |
|--------|--------|-------------|
| `--art` | ligne-claire (default), manga, realistic, ink-brush, chalk, minimalist | Art style / rendering technique |
| `--tone` | neutral (default), warm, dramatic, romantic, energetic, vintage, action | Mood / atmosphere |
| `--layout` | standard (default), cinematic, dense, splash, mixed, webtoon, four-panel | Panel arrangement |
| `--aspect` | 3:4 (default, portrait), 4:3 (landscape), 16:9 (widescreen) | 页面 aspect ratio |
| `--lang` | auto (default), zh, en, ja, etc. | 输出语言 |
| `--ref <files...>` | File paths | 应用于每页的 reference images，用于 style / palette / scene guidance。见上文 [Reference Images](#reference-images)。 |
| `--batch-size <n>` | 1-8 | 本次运行临时页面生成 batch size。默认来自 EXTEND.md 的 `generation_batch_size`，否则为 4。 |

### Partial Workflow Options

| Option | 说明 |
|--------|-------------|
| `--storyboard-only` | 只生成 storyboard，跳过 prompts 和 images |
| `--prompts-only` | 生成 storyboard + prompts，跳过 images |
| `--images-only` | 从现有 prompts 目录生成 images |
| `--regenerate N` | 只重新生成指定页面（如 `3` 或 `2,5,8`） |

详情：[references/partial-workflows.md](references/partial-workflows.md)

### Art, Tone & Preset Catalogue

- **Art styles**（6）：`ligne-claire`、`manga`、`realistic`、`ink-brush`、`chalk`、`minimalist`。完整定义在 `references/art-styles/<style>.md`。
- **Tones**（7）：`neutral`、`warm`、`dramatic`、`romantic`、`energetic`、`vintage`、`action`。完整定义在 `references/tones/<tone>.md`。
- **Presets**（5）：除了普通 art+tone 之外还带有特殊规则：

  | Preset | Equivalent | Hook |
  |--------|-----------|------|
  | `ohmsha` | manga + neutral | Visual metaphors、no talking heads、gadget reveals |
  | `wuxia` | ink-brush + action | Qi effects、combat visuals、atmospheric |
  | `shoujo` | manga + romantic | Decorative elements、eye details、romantic beats |
  | `concept-story` | manga + warm | Visual symbol system、growth arc、dialogue+action balance |
  | `four-panel` | minimalist + neutral + four-panel layout | 起承转合 structure、B&W + spot color、stick-figure characters |

  完整规则在 `references/presets/<preset>.md`，选择某个 preset 时加载对应文件。

- **Compatibility matrix** 和 **content-signal → preset** 表位于 [references/auto-selection.md](references/auto-selection.md)。在 Step 2 推荐组合前先阅读它。

## Script Directory

**重要**：所有 scripts 都位于此 skill 的 `scripts/` 子目录。

**Agent 执行说明**：
1. 将此 SKILL.md 文件所在目录路径确定为 `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. 将本文档中的所有 `{baseDir}` 替换为实际路径
4. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

**Script Reference**：
| Script | 用途 |
|--------|---------|
| `scripts/merge-to-pdf.ts` | 将漫画页面合并为 PDF |

## 文件结构

输出目录：`comic/{topic-slug}/`
- Slug：由 topic 提炼的 2-4 个词 kebab-case（如 `alan-turing-bio`）
- 冲突：追加 timestamp（如 `turing-story-20260118-143052`）

**内容**：
| File | 说明 |
|------|-------------|
| `source-{slug}.{ext}` | 源文件 |
| `analysis.md` | 内容分析 |
| `storyboard.md` | 带 panel breakdown 的 storyboard |
| `characters/characters.md` | 角色定义 |
| `characters/characters.png` | Character reference sheet |
| `prompts/NN-{cover\|page}-[slug].md` | Generation prompts |
| `NN-{cover\|page}-[slug].png` | 生成的 images |
| `{topic-slug}.pdf` | 最终合并 PDF |

## Language Handling

**检测优先级**：
1. `--lang` flag（显式）
2. EXTEND.md `language` 设置
3. 用户对话语言
4. 源内容语言

**规则**：所有交互都使用用户输入语言或已保存语言偏好：
- Storyboard outlines 和 scene descriptions
- Image generation prompts
- 用户选择项和确认信息
- 进度更新、问题、错误、摘要

技术术语保持 English。

## Workflow

### 进度检查清单

```
Comic Progress:
- [ ] Step 1: Setup & Analyze
  - [ ] 1.1 Preferences (EXTEND.md) ⛔ BLOCKING
    - [ ] Found → load preferences → continue
    - [ ] Not found → run first-time setup → MUST complete before other steps
  - [ ] 1.2 Analyze, 1.3 Check existing
- [ ] Step 2: Confirmation - Style & options ⚠️ REQUIRED
- [ ] Step 3: Generate storyboard + characters
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts
- [ ] Step 6: Review prompts (conditional)
- [ ] Step 7: Generate images
  - [ ] 7.1 Generate character sheet (if needed) → characters/characters.png
  - [ ] 7.2 Generate pages (with --ref if character sheet exists)
- [ ] Step 8: Merge to PDF
- [ ] Step 9: Completion report
```

### Flow

```
Input → [Preferences] ─┬─ Found → Continue
                       │
                       └─ Not found → First-Time Setup ⛔ BLOCKING
                                      │
                                      └─ Complete setup → Save EXTEND.md → Continue
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ↓
Analyze → [Check Existing?] → [Confirm: Style + Reviews] → Storyboard → [Review?] → Prompts → [Review?] → Images → PDF → Complete
```

### 步骤摘要

| Step | 动作 | 关键输出 |
|------|--------|------------|
| 1.1 | 加载 EXTEND.md preferences；未找到则 ⛔ BLOCKING | Config loaded |
| 1.2 | 分析内容 | `analysis.md` |
| 1.3 | 检查现有目录 | 处理冲突 |
| 2 | 确认 style、focus、audience、reviews | User preferences |
| 3 | 生成 storyboard + characters | `storyboard.md`, `characters/` |
| 4 | Review outline（如用户要求） | User approval |
| 5 | 生成 prompts | `prompts/*.md` |
| 6 | Review prompts（如用户要求） | User approval |
| 7.1 | 生成 character sheet（如需要） | `characters/characters.png` |
| 7.2 | 生成 pages（如有 character ref 则使用） | `*.png` files |
| 8 | 合并为 PDF | `{slug}.pdf` |
| 9 | 完成报告 | Summary |

### Step 7: Image Generation

**每个 session 只选择一次 backend**，使用顶部的 `## Image Generation Tools` 规则。如果 backend 是 repo skill（如 `baoyu-image-gen`），读取它的 `SKILL.md`，使用其文档化接口，而不是直接调用 scripts。

**`codex-imagegen` 调用**：当规则解析到 `codex-imagegen` 时，调用契约见 [references/codex-imagegen.md](references/codex-imagegen.md)（优先 `baoyu-image-gen --provider codex-cli` 路径、runtime wrapper discovery、参数说明、stdout schema、batch 语义；每次调用 n=1，因此页面 batch 必须为每页派发一次 wrapper 调用）。

**7.1 Character sheet**：当漫画为多页且有重复出现的角色时生成（输出到 `characters/characters.png`，aspect `4:3`）。对简单 presets（如 four-panel minimalist）或单页漫画可跳过。作为 `--ref` 使用前先压缩为 JPEG（macOS 用 `sips -s format jpeg -s formatOptions 80 …`，其他环境用 `pngquant --quality=65-80 …`），避免 payload failures。调用 backend 前，`characters/characters.md` prompt 文件必须已存在。

**7.2 Pages**：调用 backend 前，每页 prompt 必须已经位于 `prompts/NN-{cover|page}-[slug].md`；该文件是可复现记录。策略取决于 character sheet：

| Character sheet | Backend `--ref` | 策略 |
|-----------------|-----------------|----------|
| Exists | Supported | 每页都将 sheet 作为 `--ref` 传入 |
| Exists | Not supported | 在每个 prompt 文件前加入角色描述 |
| Skipped | — | 所有描述都 inline 写入 prompt |

**执行策略**：需要时先生成 character sheet。然后从已保存 prompt 文件构建选中页面 task list，并按 `## Batch Generation Policy` 批量派发页面：backend 原生 batch 优先，其次 runtime parallel tool calls，顺序生成只作为 fallback。`--regenerate N` 和 `--images-only` 对选中的现有 prompts 应用相同 batching 规则。

**Backup rule**：重新生成前，现有 `prompts/…md` 和 `…png` 文件 → 用 `-backup-YYYYMMDD-HHMMSS` 后缀重命名。Aspect ratio 来自 storyboard（默认 `3:4`；preset 可覆盖）。

**`--ref` 失败恢复**：压缩 sheet → 重试 → 仍失败 → 去掉 `--ref`，将角色描述嵌入 prompt 文本。

完整逐步 workflow（analysis、storyboard、review gates、regeneration variants）：[references/workflow.md](references/workflow.md)。

### EXTEND.md Paths ⛔ BLOCKING

如果找不到 EXTEND.md，first-time setup 是 **blocking**，必须先完成它，再进行任何内容分析或 style/tone 问题。

| 优先级 | Path | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-comic/EXTEND.md` | Project |
| 2 | `$HOME/.baoyu-skills/baoyu-comic/EXTEND.md` | User home |

| 结果 | 动作 |
|--------|--------|
| Found | 读取、解析、展示摘要 → 继续 |
| Not found | ⛔ 运行 first-time setup（[references/config/first-time-setup.md](references/config/first-time-setup.md)）→ 保存 EXTEND.md → 继续 |

**EXTEND.md 支持**：watermark、preferred art/tone/layout、custom style definitions、character presets、language preference、preferred image backend、generation batch size。Schema：[references/config/preferences-schema.md](references/config/preferences-schema.md)。

## References

**Core Templates**：
- [analysis-framework.md](references/analysis-framework.md) - 深度内容分析
- [character-template.md](references/character-template.md) - Character definition 格式
- [storyboard-template.md](references/storyboard-template.md) - Storyboard 结构
- [ohmsha-guide.md](references/ohmsha-guide.md) - Ohmsha manga 细节

**Style Definitions**：
- `references/art-styles/` - Art styles（ligne-claire、manga、realistic、ink-brush、chalk、minimalist）
- `references/tones/` - Tones（neutral、warm、dramatic、romantic、energetic、vintage、action）
- `references/presets/` - 带特殊规则的 presets（ohmsha、wuxia、shoujo、concept-story、four-panel）
- `references/layouts/` - Layouts（standard、cinematic、dense、splash、mixed、webtoon、four-panel）

**Workflow**：
- [workflow.md](references/workflow.md) - 完整 workflow 细节
- [auto-selection.md](references/auto-selection.md) - Content signal analysis
- [partial-workflows.md](references/partial-workflows.md) - Partial workflow options

**Config**：
- [config/preferences-schema.md](references/config/preferences-schema.md) - EXTEND.md schema
- [config/first-time-setup.md](references/config/first-time-setup.md) - First-time setup
- [config/watermark-guide.md](references/config/watermark-guide.md) - Watermark configuration

## Page Modification

| Action | 步骤 |
|--------|-------|
| **Edit** | **先更新 prompt 文件** → `--regenerate N` → 重新生成 PDF |
| **Add** | 在目标位置创建 prompt → 使用 character ref 生成 → 后续重新编号 → 更新 storyboard → 重新生成 PDF |
| **Delete** | 删除文件 → 后续重新编号 → 更新 storyboard → 重新生成 PDF |

**重要**：更新页面时，重新生成前始终先更新 prompt 文件（`prompts/NN-{cover|page}-[slug].md`）。这能确保变更已记录且可复现。

文本修正策略：

- 如果 dialogue、sound effects、panel labels 或任何其他已渲染文本拼写错误、乱码、难以阅读或视觉效果弱，不要用代码 patch bitmap。
- 对 text-correction regenerations，写入新的 prompt 文件和新的输出路径，以保留有问题的候选图供对比。
- Post-processing 仅限 crop、resize、compression 或 format conversion，不得改变文本或主构图。

## Notes

- Image generation：每页 10-30 秒
- 生成失败时自动重试一次
- 对敏感公众人物使用 stylized alternatives
- 通过 session ID 保持 style consistency
- **Step 2 confirmation required**：不要跳过
- **Steps 4/6 conditional**：仅当用户在 Step 2 要求时执行
- **Step 7.1 character sheet**：推荐用于多页漫画；简单 presets 可选
- **Step 7.2 character reference**：如果 sheet 存在则使用 `--ref`；失败时压缩/转换；fallback 到 prompt-only
- Watermark/language 在 EXTEND.md 中配置一次

## Changing Preferences

EXTEND.md 位于 `.baoyu-skills/baoyu-comic/EXTEND.md`（project）或 `~/.baoyu-skills/baoyu-comic/EXTEND.md`（user）。有三种修改方式：

- **直接编辑**：打开 EXTEND.md 并修改字段。完整 schema：`references/config/preferences-schema.md`。
- **交互式重新配置**：删除 EXTEND.md（或请求 "reconfigure baoyu-comic preferences" / "重新配置"）。下一次运行会重新触发 first-time setup。
- **常见单行修改**：
  - `preferred_image_backend: auto`：默认值；runtime-native tool 优先，fallback 到唯一已安装 backend，仅在存在多个 non-native backends 时询问。
  - `preferred_image_backend: codex-imagegen`：固定到 Codex 内置 backend。
  - `preferred_image_backend: baoyu-image-gen`：固定到 baoyu-image-gen skill。
  - `preferred_image_backend: ask`：每次运行都确认 backend。
  - `generation_batch_size: 4`：当 backend/runtime 支持 batch 或 parallel generation 时，同时渲染的默认页面图片数量。
  - `watermark.enabled: true`、`preferred_art`、`preferred_tone`、`preferred_layout`、`language`：调整 auto-selection defaults 和外观选择。
