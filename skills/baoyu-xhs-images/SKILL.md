---
name: baoyu-xhs-images
description: 生成 infographic image card series，支持 12 种视觉 style、8 种 layout 和 3 套 color palette。将内容拆解成 1-10 张适合社交媒体互动的 cartoon-style 图片卡片。当用户提到 "小红书图片"、"小红书种草"、"小绿书"、"微信图文"、"微信贴图"、"image cards"、"图片卡片"、baoyu-xhs-images，或想要社交媒体 infographic series 时使用。
version: 2.0.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-xhs-images
---

# Image Card Series Generator

将复杂内容拆解成醒目的图片卡片系列，并提供多种 style 选项。

## 用户输入工具

当此 skill 需要提示用户时，按以下工具选择规则执行（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等价工具。
2. **Fallback**：如果不存在这类工具，输出带编号的纯文本消息，并请用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持单次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级逐个询问。

下面具体的 `AskUserQuestion` 引用只是示例 - 在其他 runtime 中替换为本地等价工具。

## Image Generation Tools

当此 skill 需要渲染图片时，按以下顺序解析 backend：

1. **当前请求覆盖** - 如果用户在当前消息中指定了某个 backend，使用它。
2. **已保存偏好** - 如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的 backend，使用它。
3. **自动选择**（当偏好是 `auto`、未设置，或固定的 backend 不可用时）：
   - **Codex (`imagegen`)** - 先检查 available-skills / tool inventory。如果列出了名为 `imagegen` 的 skill，说明你在 Codex 内运行，必须使用它：通过 `Skill` tool 调用，设置 `skill: "imagegen"`，传入已保存 prompt 文件的内容（再按 Codex `imagegen` 自己的参数传 output path 和 aspect ratio）。Codex `imagegen` 是该 runtime 的官方 raster backend，优先级高于任何 non-native skill（例如 `baoyu-image-gen`），除非用户明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex（`codex-imagegen`）** - 如果当前 runtime 没有暴露原生 `imagegen` skill，但 `codex` CLI 在 `PATH` 上且已有有效的 `codex login`，通过 `baoyu-image-gen --provider codex-cli` 路由（首选），或者在 baoyu-image-gen 不可用时直接调用 bundled wrapper。细节、参数和 runtime-discovery 流程见 [references/codex-imagegen.md](references/codex-imagegen.md) - 只有选中这个分支时才加载该文件。
   - **其他 runtime-native tools** - 如果 runtime 暴露了不同的原生图片工具（例如 Hermes `image_generate`），按同样方式使用。
   - 否则，如果只安装了一个 non-native backend（例如 `baoyu-image-gen`），使用它。
   - 否则（多个 non-native backend 且没有 runtime-native tool），询问用户一次 - 可与其他初始问题合并。
4. **如果都不可用**，告知用户并询问如何继续。

**⛔ 绝不要用 SVG、HTML、canvas 或其他基于代码的渲染替代 raster image generation。** Codex `imagegen` 自身说明中说，它应在“输出应是 bitmap asset，而不是 repo-native code 或 vector”时使用。如果无法通过步骤 3 解析 raster backend，就进入步骤 4 询问用户 - 不要静默输出 SVG、写 inline `<svg>` 标记，或生成 HTML/CSS art 作为替代。即使文章/章节看起来“像 diagram”，也同样适用：调用这条规则的上游 skill 已经判断它需要的是 raster image。

**⛔ 绝不要通过覆盖已生成 bitmap 来修复渲染文字。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他程序化 overlay 去遮盖、重写、擦除、描边或替换已生成图片卡片中的标题、正文、标签或任何文字。如果文字错误或不清晰，应基于修正后的 prompt 重新生成，切换到卡片文字更少的 layout，或询问用户保留哪个不完美候选图。

设置 `preferred_image_backend: ask` 会强制每次运行都在步骤 3 提示用户，无论可用 backend 是什么。用户可通过下面的 `## Changing Preferences` 章节修改固定 backend。

**Prompt 文件要求（硬性）**：在调用任何 backend 之前，先把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。该文件是可复现记录，也让你能在不重新生成 prompt 的情况下切换 backend。

上面的具体工具名（`imagegen`、`image_generate`、`baoyu-image-gen`）只是示例 - 按同一规则替换为本地等价工具。

## 批量生成策略

当前生成组的每个 prompt 文件都保存并验证后，默认批量生成图片。

优先级顺序：

1. 如果所选 backend 存在原生 batch / multi-task interface，使用它。每个任务必须保留自己的 prompt file、output path、aspect ratio、session ID 和 direct reference images。
2. 如果没有原生 batch interface，但 runtime 可以发起并行 tool calls，每次最多派发 `generation_batch_size` 张。默认：`4`。当前消息中的明确用户请求（例如 `--batch-size 4` 或“并行 4 张一起生成”）会覆盖 EXTEND.md。
3. 如果既没有原生 batch，也没有并行 tool calls，则顺序生成。

规则：

- 遵守 image-1 anchor chain：先生成 image 1，然后用 image 1 作为 reference 批量生成 images 2+。
- 在该批次的每个选定 prompt file 都存在于磁盘前，绝不启动 batch。
- 失败项重试一次，不重新生成成功项。
- 不要仅为了并行渲染图片而使用 subagents。subagents 只用于独立 prompt 迭代或创意探索。

## 确认策略

默认行为：**生成前确认**。

- 将显式 skill 调用、文件路径、匹配到的 signals/presets 和 `EXTEND.md` defaults 仅视为**推荐输入**。它们都不能授权跳过确认。
- 用户完成 Step 2 之前，不要开始 Step 3。
- 只有当前请求明确要求时才跳过确认，例如：`--yes`、“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或等价表述。
- 如果明确跳过确认，在生成前的下一条面向用户更新中说明假定的 strategy / style / layout / palette / count / backend。

## 语言

问题、进度、错误和完成摘要都使用用户语言回复。技术 token（style 名称、file paths、code）保持英文。

## 选项

| 选项 | 说明 |
|--------|-------------|
| `--style <name>` | Visual style（见下方 Styles） |
| `--layout <name>` | Information layout（见下方 Layouts） |
| `--palette <name>` | Color override：macaron / warm / neon |
| `--preset <name>` | Style + layout + 可选 palette 的 shorthand（见下方 Presets；各 preset 的 prompt fragments 在 `references/style-presets.md`） |
| `--ref <files...>` | 应用于 image 1 的 reference images，作为系列 anchor |
| `--batch-size <n>` | 本次运行的临时 generation batch size。默认使用 EXTEND.md 的 `generation_batch_size`，否则为 4。限制到 1-8。 |
| `--yes` | Non-interactive：跳过所有确认，使用 EXTEND.md 或内置 defaults，自动确认推荐方案（Path A） |

## Dimensions

三个独立旋钮可自由组合：

| Dimension | 控制内容 | 选项 |
|-----------|----------|---------|
| **Style** | 视觉美学（lines、decorations、rendering） | 12 styles（见下方 Styles） |
| **Layout** | 信息结构（density、arrangement） | 8 layouts（见下方 Layouts） |
| **Palette**（可选） | Color override，替换 style 默认颜色 | macaron / warm / neon（见下方 Palettes） |

示例：`--style notion --layout dense` 会制作一张理性的知识卡；添加 `--palette macaron` 可以柔化颜色，同时不改变 notion 的 rendering rules。`--preset` 是 style + layout（+ 可选 palette）的 shorthand。

**Palette 行为**：无 `--palette` → 使用 style 内置颜色；`--palette <name>` → 仅覆盖颜色，rendering rules 不变。部分 styles 声明了 `default_palette`（例如 sketch-notes 默认使用 macaron）。

## Styles (12)

| Style | 说明 |
|-------|-------------|
| `cute` (Default) | 甜美、可爱、少女感 aesthetic |
| `fresh` | 干净、清爽、自然 |
| `warm` | 舒适、友好、亲近 |
| `bold` | 高冲击、抓注意力 |
| `minimal` | 极简干净、精致 |
| `retro` | 复古、怀旧、有趋势感 |
| `pop` | 鲜明、有活力、醒目 |
| `notion` | Minimalist hand-drawn line art，有知识感 |
| `chalkboard` | 黑板上的彩色 chalk，教育感 |
| `study-notes` | 真实手写照片风格，蓝笔 + 红色批注 + 黄色 highlighter |
| `screen-print` | Bold poster art、halftone textures、limited colors、symbolic storytelling |
| `sketch-notes` | 手绘教育 infographic，warm cream 上的 macaron pastels，wobble lines |

每个 style 的规格：`references/presets/<style>.md`。

## Layouts (8)

| Layout | 说明 |
|--------|-------------|
| `sparse` (Default) | 1-2 个点，最大冲击 |
| `balanced` | 3-4 个点，标准密度 |
| `dense` | 5-8 个点，知识卡风格 |
| `list` | 枚举 / 排名（4-7 项） |
| `comparison` | 并排对比 |
| `flow` | 流程 / 时间线（3-6 步） |
| `mindmap` | 中心放射（4-8 个分支） |
| `quadrant` | 四象限 / 环形分区 |

Layout specs：`references/elements/canvas.md`。

## Palettes（可选 override）

替换 style 的颜色，同时保持 rendering rules（line treatment、textures）不变。

| Palette | Background | Zone Colors | Accent | 感受 |
|---------|------------|-------------|--------|------|
| `macaron` | Warm cream #F5F0E8 | Blue #A8D8EA, Lavender #D5C6E0, Mint #B5E5CF, Peach #F8D5C4 | Coral #E8655A | 柔和、教育感 |
| `warm` | Soft peach #FFECD2 | Orange #ED8936, Terracotta #C05621, Golden #F6AD55, Rose #D4A09A | Sienna #A0522D | Earth tones、舒适 |
| `neon` | Dark purple #1A1025 | Cyan #00F5FF, Magenta #FF00FF, Green #39FF14, Pink #FF6EC7 | Yellow #FFFF00 | 高能、未来感 |

Palette specs：`references/palettes/<palette>.md`。

## Presets (style + layout shortcuts)

Quick-start combos, grouped by scenario. Use `--preset <name>` or recommend during Step 2.

**Knowledge & Learning**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `knowledge-card` | notion | dense | 干货知识卡、概念科普 |
| `checklist` | notion | list | 清单、排行榜 |
| `concept-map` | notion | mindmap | 概念图、知识脉络 |
| `swot` | notion | quadrant | SWOT 分析、四象限 |
| `tutorial` | chalkboard | flow | 教程步骤、操作流程 |
| `classroom` | chalkboard | balanced | 课堂笔记、知识讲解 |
| `study-guide` | study-notes | dense | 学习笔记、考试重点 |
| `hand-drawn-edu` | sketch-notes | flow | 手绘教程、流程图解 |
| `sketch-card` | sketch-notes | dense | 手绘知识卡 |
| `sketch-summary` | sketch-notes | balanced | 手绘总结、图文笔记 |

**Lifestyle & Sharing**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `cute-share` | cute | balanced | 少女风分享、日常种草 |
| `girly` | cute | sparse | 甜美封面、氛围感 |
| `cozy-story` | warm | balanced | 生活故事、情感分享 |
| `product-review` | fresh | comparison | 产品对比、测评 |
| `nature-flow` | fresh | flow | 健康流程、自然主题 |

**Impact & Opinion**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `warning` | bold | list | 避坑指南、重要提醒 |
| `versus` | bold | comparison | 正反对比 |
| `clean-quote` | minimal | sparse | 金句、极简封面 |
| `pro-summary` | minimal | balanced | 专业总结、商务内容 |

**Trend & Entertainment**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `retro-ranking` | retro | list | 复古排行、经典盘点 |
| `throwback` | retro | balanced | 怀旧分享 |
| `pop-facts` | pop | list | 趣味冷知识 |
| `hype` | pop | sparse | 炸裂封面、惊叹分享 |

**Poster & Editorial**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `poster` | screen-print | sparse | 海报风封面、影评书评 |
| `editorial` | screen-print | balanced | 观点文章、文化评论 |
| `cinematic` | screen-print | comparison | 电影对比、戏剧张力 |

完整 prompt-fragment 定义：`references/style-presets.md`。

## Auto-Selection

将 content signals 匹配到最佳组合。关键词出现的第一行优先；如果没有匹配项，fallback 到 `cute-share`。

| Source 中的信号 | Style | Layout | 推荐 preset |
|-------------------|-------|--------|--------------------|
| beauty, fashion, cute, girl, pink | `cute` | sparse/balanced | `cute-share`, `girly` |
| health, nature, fresh, organic | `fresh` | balanced/flow | `product-review`, `nature-flow` |
| life, story, emotion, warm | `warm` | balanced | `cozy-story` |
| warning, important, must, critical | `bold` | list/comparison | `warning`, `versus` |
| professional, business, elegant | `minimal` | sparse/balanced | `clean-quote`, `pro-summary` |
| classic, vintage, traditional | `retro` | balanced | `throwback`, `retro-ranking` |
| fun, exciting, wow, amazing | `pop` | sparse/list | `hype`, `pop-facts` |
| knowledge, concept, productivity, SaaS | `notion` | dense/list | `knowledge-card`, `checklist` |
| education, tutorial, learning, classroom | `chalkboard` | balanced/dense | `tutorial`, `classroom` |
| notes, handwritten, study guide, realistic | `study-notes` | dense/list/mindmap | `study-guide` |
| movie, poster, opinion, editorial, cinematic | `screen-print` | sparse/comparison | `poster`, `editorial`, `cinematic` |
| hand-drawn, infographic, workflow, 手绘，图解 | `sketch-notes` | flow/balanced/dense | `hand-drawn-edu`, `sketch-card`, `sketch-summary` |

## Style × Layout Matrix

兼容性评分（✓✓ 强烈推荐，✓ 效果不错，✗ 避免）。当用户选择非默认组合且你想提示匹配不佳时使用。

|              | sparse | balanced | dense | list | comparison | flow | mindmap | quadrant |
|--------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| cute         | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓  | ✓  | ✓  | ✓  |
| fresh        | ✓✓ | ✓✓ | ✓  | ✓  | ✓  | ✓✓ | ✓  | ✓  |
| warm         | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ | ✓  | ✓  | ✓  |
| bold         | ✓✓ | ✓  | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ |
| minimal      | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓  | ✓  | ✓  | ✓  |
| retro        | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓  | ✓  | ✓  | ✓  |
| pop          | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓  |
| notion       | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ |
| chalkboard   | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  |
| study-notes  | ✗  | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ | ✓  |
| screen-print | ✓✓ | ✓✓ | ✗  | ✓  | ✓✓ | ✓  | ✗  | ✓✓ |
| sketch-notes | ✓  | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  |

## Outline 策略

三种差异化方法 - 每种都会生成结构不同的 outline。Workflow 会推荐其中一种；Path C 会生成全部三种并让用户选择。

| Strategy | 概念 | 最适合 | 结构 |
|----------|---------|----------|-----------|
| **A - Story-Driven** | 以个人体验为主线，优先情感共鸣 | 评测、个人分享、转变故事 | Hook → Problem → Discovery → Experience → Conclusion |
| **B - Information-Dense** | 价值优先，高效传递信息 | 教程、对比、清单 | Core conclusion → Info card → Pros/Cons → Recommendation |
| **C - Visual-First** | 以视觉冲击为核心，文字最少 | 高审美产品、生活方式、氛围内容 | Hero image → Detail shots → Lifestyle scene → CTA |

## Reference Images

用户提供的 refs 与内部 “image-1 as anchor” chain（Step 3）**相互独立** - 它们叠加在该 chain 之上。

**接收方式**：通过 `--ref <files...>` 或对话中粘贴的路径。
- 文件路径 → 复制到 `refs/NN-ref-{slug}.{ext}`
- 粘贴但没有路径 → 询问路径，或提取 style traits 作为文本 fallback

**Usage modes**（每个 reference 单独设置）：

| Usage | 效果 |
|-------|--------|
| `direct` | 将文件传给 backend（通常只用于 image 1，让 anchor 通过 chain 传播） |
| `style` | 提取 style traits 并追加到每张卡片的 prompt body |
| `palette` | 提取 hex colors 并追加到每张卡片的 prompt body |

在每张受影响卡片的 prompt frontmatter 中记录 refs：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

生成时：验证文件存在。Image 1 如果设置 `usage: direct` 且 backend 接受 refs → 通过 backend 的 ref 参数传入（成为 chain anchor）。Images 2+ 按 Step 3 继续使用 image-1 作为 `--ref` - 不要再次叠加用户 refs（避免信号冲突）。对于 `style`/`palette`，将提取出的 traits 嵌入每个 prompt。

## 文件布局

```
image-cards/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── outline-strategy-{a,b,c}.md    # 仅 Path C
├── outline.md
├── prompts/NN-{type}-{slug}.md
├── NN-{type}-{slug}.png
└── refs/                          # 仅使用 --ref 时存在
```

**Slug**：2-4 个词，kebab-case。"AI 工具推荐" → `ai-tools-recommend`。如发生冲突，追加 `-YYYYMMDD-HHMMSS`。

**备份规则**（全流程适用）：覆盖任何文件（source、outline、prompt、image）之前，先将现有文件重命名为 `<name>-backup-YYYYMMDD-HHMMSS.<ext>`。这可以保护用户编辑。

## Workflow

```
- [ ] Step 0: Load EXTEND.md ⛔ BLOCKING (interactive only)
- [ ] Step 1: Analyze content → analysis.md
- [ ] Step 2: Smart Confirm ⚠️ REQUIRED (Path A / B / C)
- [ ] Step 3: Generate images
- [ ] Step 4: Completion report
```

### Step 0: Load EXTEND.md ⛔ BLOCKING

按顺序检查这些路径；第一个命中项生效：

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-xhs-images/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-xhs-images/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md` | User home |

- **Found** → 读取、解析、打印摘要（style / layout / watermark / language），继续。
- **Not found + interactive** → 运行首次设置（见 `references/config/first-time-setup.md`），并在其他任何操作前保存。Preferences 存在之前，不要分析内容或询问 style 问题 - 这样可保持首次运行行为可预测。
- **Not found + `--yes`** → 跳过设置，使用内置 defaults（无 watermark，style/layout 自动选择，language 从内容判断）。不要提示，不要创建 EXTEND.md。

**EXTEND.md keys**：watermark、preferred style/layout、custom style definitions、language preference、preferred image backend、generation batch size。Schema：`references/config/preferences-schema.md`。

### Step 1: Analyze Content → `analysis.md`

1. 保存 source（如果 `source.md` 已存在，应用备份规则）。
2. 运行 `references/workflows/analysis-framework.md` 中的深度分析：content type、hook potential、audience、engagement signals、visual opportunity map、swipe flow。
3. 检测 source language，选择推荐图片数量（2-10）。
4. 使用上方 **Auto-Selection** 表自动推荐 strategy + style + layout + palette。
5. 将所有内容写入 `analysis.md`。

### Step 2: Smart Confirm ⚠️ REQUIRED

**硬性 gate**：根据 [Confirmation Policy](#confirmation-policy)，此步骤必需 - 用户在这里确认之前（或在当前请求中用 `--yes` / 等价表述明确跳过前），不能开始 Step 3。

目标：展示自动推荐方案，让用户确认或调整。使用 `--yes` 时完全跳过此步骤 - 使用分析结果和任何 CLI overrides，按 Path A 继续。

**提问前展示摘要**：

```
📋 内容分析
  主题：[topic] | 类型：[content_type]
  要点：[key points]
  受众：[audience]

🎨 推荐方案（自动匹配）
  策略：[A/B/C] [name]（[reason]）
  风格：[style] · 布局：[layout] · 配色：[palette or 默认] · 预设：[preset]
  图片：[N]张（封面+[N-2]内容+结尾）
  元素：[background] / [decorations] / [emphasis]
```

然后询问一个问题 - 三条路径。逐字选项文案见：`references/confirmation.md`。

**Path A - 快速确认**（信任自动推荐）：使用推荐 strategy + style 生成单一 outline → 保存到 `outline.md` → Step 3。

**Path B - 自定义**：询问五个问题（strategy/style、layout、palette、count、optional notes），预填推荐值 - 留空则保持推荐。基于用户选择生成一个 outline → `outline.md` → Step 3。见 `references/confirmation.md`。

**Path C - 详细模式**：两次子确认。

- *Step 2a - 内容理解*：询问 selling points（multi-select）、audience、style preference（authentic / professional / aesthetic / auto）、optional context。更新 `analysis.md`。
- *Step 2b - 三个 outline variants*：生成 `outline-strategy-a.md`、`outline-strategy-b.md`、`outline-strategy-c.md`。每个都必须拥有不同结构且推荐不同 style - 在 frontmatter 中包含 `style_reason`。页数启发式：A ~4-6，B ~3-5，C ~3-4。模板：`references/workflows/outline-template.md`；frontmatter 示例见 `references/confirmation.md`。
- *Step 2c - 选择*：询问三个问题（outline A/B/C/Combined、style、visual elements）。将选中/合并的 outline 保存到 `outline.md` → Step 3。

### Step 3: Generate Images

使用已确认的 outline + style + layout + palette：

**视觉一致性 - image-1 anchor chain**：如果不设置 anchor，character / mascot / color rendering 会在多次调用之间漂移。先生成 image 1（cover），不带 `--ref`；然后把 image 1 作为 `--ref` 传给每一张后续图片。这是此 skill 最重要的一致性技巧 - 即使 backend 也支持 session ID，也不要跳过。

生成流程：

1. 用用户偏好的语言，将每张图片的完整 prompt 写入 `prompts/NN-{type}-{slug}.md`（应用备份规则），然后验证所有选定 prompt 文件都存在。
2. 先生成 **image 1**，不带 `--ref`；PNG 文件同样应用备份规则。这会建立 anchor。
3. 为 **images 2+** 构建 task list，使用 image 1 作为 `--ref <path-to-image-01.png>`。
4. 按 `## Batch Generation Policy` 批量派发 images 2+：优先 backend 原生 batch，其次 runtime 并行 tool calls，最后才顺序生成。
5. 每张图片完成后报告进度。失败时，只从同一个已保存 prompt 文件重试失败项一次。

**Watermark**（如果在 EXTEND.md 中启用）：追加到生成 prompt：

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting.
```

见 `references/config/watermark-guide.md`。

**Backend selection**：按顶部 Image Generation Tools 规则执行 - 生成前使用可用项；若有多个则询问一次。在 `--yes` 下，使用 EXTEND.md 偏好，并 fallback 到第一个可用 backend。调用任何 backend 之前，prompt files 必须存在。

**`codex-imagegen` invocation**：当规则解析到 `codex-imagegen` 时，查看 [references/codex-imagegen.md](references/codex-imagegen.md) 的调用契约（首选 `baoyu-image-gen --provider codex-cli` 路径、runtime wrapper discovery、parameter notes、stdout schema、batch semantics - 每次调用 n=1，因此卡片 batch 必须为每张卡派发一次 wrapper 调用；wrapper 不接受 `--sessionId`，所以 chain consistency 必须按上方 Step 3 通过 `--ref` 获得）。

**Session ID**（如果 backend 支持 `--sessionId`）：每张图片都使用 `cards-{topic-slug}-{timestamp}`；结合 ref chain 可获得最大一致性。

### Step 4: Completion Report

```
Image Card Series Complete!

Topic: [topic]
Mode: [Quick / Custom / Detailed]
Strategy: [A/B/C/Combined]
Style: [name]
Palette: [name or "default"]
Layout: [name or "varies"]
Location: [directory]
Images: N total

✓ analysis.md
✓ outline.md
✓ outline-strategy-a/b/c.md (detailed mode only)

- 01-cover-[slug].png ✓ Cover (sparse)
- 02-content-[slug].png ✓ Content (balanced)
- ...
- NN-ending-[slug].png ✓ Ending (sparse)
```

## 内容拆解原则

| 位置 | 目的 | 典型 layout |
|----------|---------|----------------|
| Cover（image 1） | Hook + 视觉冲击 | `sparse` |
| Content（中间） | 每张图片承载一个核心价值 | `balanced` / `dense` / `list` / `comparison` / `flow` |
| Ending（最后） | CTA / summary | `sparse` 或 `balanced` |

Style × layout 兼容矩阵见上方 **Style × Layout Matrix**。

## 图片修改

| 操作 | 方法 |
|--------|-----|
| Edit | **先**更新 `prompts/NN-{type}-{slug}.md`，再用相同 session ID 重新生成 |
| Add | 指定位置，创建 prompt，生成，将后续文件重新编号为 `NN+1`，更新 outline |
| Delete | 删除文件，将后续文件重新编号为 `NN-1`，更新 outline |

重新生成前始终先更新 prompt file - 它是 source of truth，并让修改可复现。

文字修正策略：

- 如果卡片的标题、正文、标签或任何其他渲染文字拼写错误、乱码、难读或视觉效果弱，不要用代码 patch bitmap。
- 对于文字修正类重新生成，写入新的 prompt file 和新的 output path，以便保留有问题的候选图用于比较。
- Post-processing 仅限 crop、resize、compression 或 format conversion，且不得改变文字或主体构图。

## References

| 文件 | 内容 |
|------|---------|
| `references/confirmation.md` | 每条 confirmation path 的逐字 AskUserQuestion 文案 |
| `references/style-presets.md` | 完整 preset shortcut definitions |
| `references/presets/<style>.md` | 每个 style 的 element definitions |
| `references/palettes/<name>.md` | 每个 palette 的 color definitions |
| `references/elements/canvas.md` | Aspect ratios、safe zones、grid layouts |
| `references/elements/image-effects.md` | Cutout、stroke、filters |
| `references/elements/typography.md` | Decorated text、tags、text direction |
| `references/elements/decorations.md` | Emphasis marks、backgrounds、doodles、frames |
| `references/workflows/analysis-framework.md` | Content analysis framework |
| `references/workflows/outline-template.md` | 带 layout guide 的 outline template |
| `references/workflows/prompt-assembly.md` | Prompt assembly guide |
| `references/config/preferences-schema.md` | EXTEND.md schema |
| `references/config/first-time-setup.md` | 首次设置流程 |
| `references/config/watermark-guide.md` | Watermark 配置 |

## Notes

- 生成失败时自动重试一次，再报告错误。
- 对敏感公众人物，使用 stylized cartoon alternatives。
- Smart Confirm（Step 2）是必需的；Detailed mode 会增加第二次确认（2a + 2c）。

## Changing Preferences

EXTEND.md 位于 Step 0 中列出的第一个匹配路径。修改它有三种方式：

- **直接编辑** - 打开 EXTEND.md 并修改字段。完整 schema：`references/config/preferences-schema.md`。
- **交互式重新配置** - 删除 EXTEND.md（或要求 "reconfigure baoyu-xhs-images preferences" / "重新配置"）。下一次运行会重新触发首次设置。
- **常见单行编辑**：
  - `preferred_image_backend: auto` - 默认；runtime-native tool 优先，fallback 到唯一 installed backend，仅当存在多个 non-native 时询问。
  - `preferred_image_backend: codex-imagegen` - 固定到 Codex 内置能力。
  - `preferred_image_backend: baoyu-image-gen` - 固定到 baoyu-image-gen skill。
  - `preferred_image_backend: ask` - 每次运行都确认 backend。
  - `generation_batch_size: 4` - 当 backend/runtime 支持 batch 或并行生成时，同时渲染的默认图片数。
  - `preferred_style: notion`, `preferred_layout: dense`, `preferred_palette: macaron`, `language: zh`.
  - `watermark.enabled: true` + `watermark.content: "@handle"` - 添加 watermark。
