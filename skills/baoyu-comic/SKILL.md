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

## User Input Tools

当此 skill 需要向用户提问时，按以下工具选择规则执行（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等价工具。
2. **Fallback**：如果没有这类工具，输出带编号的纯文本消息，请用户针对每个问题回复所选编号或答案。
3. **Batching**：如果工具支持一次调用多个问题，将所有适用问题合并到一次调用中；如果只支持单问题，则按优先级逐个询问。

下面具体提到的 `AskUserQuestion` 都是示例；在其他 runtimes 中请替换为本地等价工具。

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

**⛔ 不要 patch bitmap 文字**：绝不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他 overlay 去覆盖、重写、擦除、描边或替换已生成漫画页中的 dialogue、sound effects、panel labels 或任何其他文字。用修正后的 prompt 重新生成、用更少或无图内文字的方式重画页面，或询问用户保留哪个不完美候选。

**Prompt file（hard）**：调用任何 backend 之前，把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（`NN-{type}-[slug].md`），并把该文件（或其内容）传给 backend。它既是可复现记录，也允许在不重写 prompts 的情况下切换 backend。

通过下方 `## Changing Preferences` 修改 pinned backend。上方工具名只是示例；其他 runtime 使用本地等价工具。

## Batch Generation Policy

当前生成组的每个 prompt 文件都已保存并验证后，默认批量生成图片：

1. 如果所选 backend 有原生 batch / multi-task 接口，使用它。每个 task 保留自己的 prompt file、output path、aspect ratio、session ID 和 direct reference images。
2. 否则，如果 runtime 可以发起 parallel tool calls，每次最多派发 `generation_batch_size` 张图片（默认 `4`）。当前消息中的显式请求（例如 `--batch-size 4`、"并行4张一起生成"）会覆盖 EXTEND.md。
3. 否则顺序生成。

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

- **Art styles**（6）：`ligne-claire`、`manga`、`realistic`、`ink-brush`、`chalk`、`minimalist` → `references/art-styles/<style>.md`
- **Tones**（7）：`neutral`、`warm`、`dramatic`、`romantic`、`energetic`、`vintage`、`action` → `references/tones/<tone>.md`
- **Layouts**：`references/layouts/<layout>.md`
- **Presets**（5）：除了普通 art+tone 之外还带有特殊规则 — 选择某个 preset 时加载 `references/presets/<preset>.md`：

  | Preset | Equivalent | Hook |
  |--------|-----------|------|
  | `ohmsha` | manga + neutral | Visual metaphors、no talking heads、gadget reveals |
  | `wuxia` | ink-brush + action | Qi effects、combat visuals、atmospheric |
  | `shoujo` | manga + romantic | Decorative elements、eye details、romantic beats |
  | `concept-story` | manga + warm | Visual symbol system、growth arc、dialogue+action balance |
  | `four-panel` | minimalist + neutral + four-panel layout | 起承转合 structure、B&W + spot color、stick-figure characters |

- **Compatibility matrix** 和 **content-signal → preset** 表：[references/auto-selection.md](references/auto-selection.md)。在 Step 2 推荐组合前先阅读它。

## Script Directory

Scripts 位于此 skill 的 `scripts/` 子目录。

1. 将本 SKILL.md 文件所在目录路径确定为 `{baseDir}`；script path = `{baseDir}/scripts/<script-name>.ts`。把本文档中所有 `{baseDir}` 替换为实际路径
2. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

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

检测优先级：`--lang` flag → EXTEND.md `language` → 用户对话语言 → 源内容语言。

所有交互都使用该语言：storyboard outlines 和 scene descriptions、image prompts、用户选择项和确认信息、进度更新、问题、错误、摘要。技术术语保持 English。

## Workflow

完整逐步细节（analysis、confirmation questions、storyboard、review gates、prompts、regeneration variants）：[references/workflow.md](references/workflow.md)。

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

从已保存的 prompt 文件构建页面 task list，并按 `## Batch Generation Policy` 派发。`--regenerate N` 和 `--images-only` 对选中的现有 prompts 应用相同 batching 规则。

**Backup rule**：重新生成前，现有 `prompts/…md` 和 `…png` 文件 → 用 `-backup-YYYYMMDD-HHMMSS` 后缀重命名。Aspect ratio 来自 storyboard（默认 `3:4`；preset 可覆盖）。

**`--ref` 失败恢复**：压缩 sheet → 重试 → 仍失败 → 去掉 `--ref`，将角色描述嵌入 prompt 文本。

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

## Other References

[analysis-framework.md](references/analysis-framework.md)（content analysis）· [storyboard-template.md](references/storyboard-template.md) · [character-template.md](references/character-template.md) · [ohmsha-guide.md](references/ohmsha-guide.md) · [config/watermark-guide.md](references/config/watermark-guide.md)

## Page Modification

| Action | 步骤 |
|--------|-------|
| **Edit** | **先更新 prompt 文件** → `--regenerate N` → 重新生成 PDF |
| **Add** | 在目标位置创建 prompt → 使用 character ref 生成 → 后续重新编号 → 更新 storyboard → 重新生成 PDF |
| **Delete** | 删除文件 → 后续重新编号 → 更新 storyboard → 重新生成 PDF |

**重要**：更新页面时，重新生成前始终先更新 prompt 文件（`prompts/NN-{cover|page}-[slug].md`）。这能确保变更已记录且可复现。

File naming：`NN-{cover|page}-[slug].png`（例如 `03-page-enigma-machine.png`）；slugs 为 kebab-case、唯一、由内容推导。重新编号只更新 NN 前缀；slugs 不变。

文本修正策略：

- 如果 dialogue、sound effects、panel labels 或任何其他已渲染文本拼写错误、乱码、难以阅读或视觉效果弱，不要用代码 patch bitmap。
- 对 text-correction regenerations，写入新的 prompt 文件和新的输出路径，以保留有问题的候选图供对比。
- Post-processing 仅限 crop、resize、compression 或 format conversion，不得改变文本或主构图。

## Notes

- 对敏感公众人物使用 stylized alternatives
- 通过 session ID 保持 style consistency
- Watermark/language 在 EXTEND.md 中配置一次

## Changing Preferences

EXTEND.md 位于 `.baoyu-skills/baoyu-comic/EXTEND.md`（project）或 `~/.baoyu-skills/baoyu-comic/EXTEND.md`（user）。修改方式：

- **直接编辑** — 完整 schema：`references/config/preferences-schema.md`。
- **交互式重新配置** — 删除 EXTEND.md（或请求 "reconfigure baoyu-comic preferences" / "重新配置"）；下一次运行会重新触发 first-time setup。
- **常见单行修改**：
  - `preferred_image_backend: auto` — 默认值；runtime-native tool 优先，fallback 到唯一已安装 backend，仅在存在多个 non-native backends 时询问。
  - `preferred_image_backend: codex-imagegen` — 固定到 Codex 内置 backend。
  - `preferred_image_backend: baoyu-image-gen` — 固定到 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行都确认 backend。
  - `generation_batch_size: 4` — 当 backend/runtime 支持 batch 或 parallel generation 时，同时渲染的默认页面图片数量。
  - `watermark.enabled: true`、`preferred_art`、`preferred_tone`、`preferred_layout`、`language` — 调整 auto-selection defaults 和外观选择。
