# 完整 Workflow

生成知识漫画的完整 workflow。

## 进度检查清单

复制并跟踪进度：

```
Comic Progress:
- [ ] Step 1: Setup & Analyze
  - [ ] 1.1 Load preferences
  - [ ] 1.2 Analyze content
  - [ ] 1.3 Check existing ⚠️ REQUIRED
- [ ] Step 2: Confirmation 1 - Style & options ⚠️ REQUIRED
- [ ] Step 3: Generate storyboard + characters
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts
- [ ] Step 6: Review prompts (conditional)
- [ ] Step 7: Generate images
  - [ ] 7.1 Character sheet (if needed)
  - [ ] 7.2 Generate pages
- [ ] Step 8: Merge to PDF
- [ ] Step 9: Completion report
```

## 流程图

```
Input → Preferences → Analyze → [Check Existing?] → [Confirm 1: Style + Reviews] → Storyboard → [Review Outline?] → Prompts → [Review Prompts?] → Images → PDF → Complete
```

---

## Step 1: Setup & Analyze

### 1.1 加载 Preferences（EXTEND.md）

按优先级检查 EXTEND.md 是否存在：

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-comic/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-comic/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-comic/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-comic/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-comic/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-comic/EXTEND.md") { "user" }
```

| Path | 位置 |
|------|----------|
| `.baoyu-skills/baoyu-comic/EXTEND.md` | Project directory |
| `$HOME/.baoyu-skills/baoyu-comic/EXTEND.md` | User home |

**找到 EXTEND.md 时** → 读取、解析，并**向用户输出摘要**：

```
📋 Loaded preferences from [full path]
├─ Watermark: [enabled/disabled] [content if enabled]
├─ Art Style: [style name or "auto-select"]
├─ Tone: [tone name or "auto-select"]
├─ Layout: [layout or "auto-select"]
├─ Language: [language or "auto-detect"]
└─ Character presets: [count] defined
```

**必须输出此摘要**，让用户知道当前配置。不要跳过，也不要静默加载。

**未找到 EXTEND.md 时** → First-time setup：

1. 告知用户："No preferences found. Let's set up your defaults."
2. 使用 AskUserQuestion 收集 preferences（见 `config/first-time-setup.md`）
3. 在用户选择的位置创建 EXTEND.md
4. 确认："✓ Preferences saved to [path]"

**EXTEND.md 支持**：Watermark | Preferred art/tone/layout | Custom style definitions | Character presets | Language preference

Schema：`config/preferences-schema.md`

**重要**：一旦 EXTEND.md 存在，就不要在 Confirmation 1 或 2 中再次询问 watermark、language 和 style defaults。这些是 session-persistent settings。

### 1.2 分析内容 → `analysis.md`

读取源内容，必要时保存，并执行深度分析。

**动作**：
1. **保存源内容**（如果它还不是文件）：
   - 如果用户提供文件路径：原样使用
   - 如果用户粘贴内容：保存到目标目录中的 `source.md`
   - **Backup rule**：如果 `source.md` 已存在，重命名为 `source-backup-YYYYMMDD-HHMMSS.md`
2. 读取源内容
3. 按 `analysis-framework.md` 执行**深度分析**：
   - Target audience identification
   - 面向读者的 value proposition
   - Core themes 和 narrative potential
   - Key figures 及其 story arcs
4. 检测源语言
5. **确定语言**：
   - 如果 EXTEND.md 有 `language` → 使用它
   - 否则如果提供了 `--lang` option → 使用它
   - 否则 → 使用检测到的源语言
6. 确定推荐页数：
   - Short story：5-8 页
   - Medium complexity：9-15 页
   - Full biography：16-25 页
7. 分析 content signals，以推荐 art/tone/layout
8. **保存到 `analysis.md`**

**analysis.md 格式**：YAML front matter（title、topic、time_span、source_language、user_language、aspect_ratio、recommended_page_count、recommended_art、recommended_tone）+ Target Audience、Value Proposition、Core Themes、Key Figures & Story Arcs、Content Signals、Recommended Approaches 等章节。完整模板见 `analysis-framework.md`。

### 1.3 检查现有内容 ⚠️ REQUIRED

**进入 Step 2 前必须执行。**

使用 Bash 检查输出目录是否存在：

```bash
test -d "comic/{topic-slug}" && echo "exists"
```

**如果目录存在**，使用 AskUserQuestion：

```
header: "Existing"
question: "Existing content found. How to proceed?"
options:
  - label: "Regenerate storyboard"
    description: "Keep images, regenerate storyboard and characters only"
  - label: "Regenerate images"
    description: "Keep storyboard, regenerate images only"
  - label: "Backup and regenerate"
    description: "Backup to {slug}-backup-{timestamp}, then regenerate all"
  - label: "Exit"
    description: "Cancel, keep existing content unchanged"
```

保存结果并按以下方式处理：
- **Regenerate storyboard**：跳到 Step 3，保留 `prompts/` 和 images
- **Regenerate images**：跳到 Step 7，使用现有 prompts
- **Backup and regenerate**：移动目录，从 Step 2 重新开始
- **Exit**：立即结束 workflow

---

## Step 2: Confirmation 1 - Style & Options ⚠️

**目的**：选择 visual style，并决定生成前是否 review outline。**不要跳过。**

**注意**：Watermark 和 language 已在 EXTEND.md（Step 1）中配置。

**展示摘要**：
- 已识别的 content type + topic
- 提取的 key figures
- 检测到的 time span
- 推荐页数
- Language：[来自 EXTEND.md 或检测结果]
- **Recommended style**：[art] + [tone]（基于 content signals）

**使用 AskUserQuestion** 询问：

### 问题 1：Visual Style

如果推荐某个 preset（见 `auto-selection.md`），先展示它：

```
header: "Style"
question: "Which visual style for this comic?"
options:
  - label: "[preset name] preset (Recommended)"       # If preset recommended
    description: "[preset description] - includes special rules"
  - label: "[recommended art] + [recommended tone] (Recommended)"  # If no preset
    description: "Best match for your content based on analysis"
  - label: "ligne-claire + neutral"
    description: "Classic educational, Logicomix style"
  - label: "ohmsha preset"
    description: "Educational manga with visual metaphors, gadgets, NO talking heads"
  - label: "Custom"
    description: "Specify your own art + tone or preset"
```

**Preset vs Art+Tone**：Presets 包含 art+tone 之外的特殊规则。`ohmsha` = manga + neutral + visual metaphor rules + character roles + NO talking heads。单纯的 `manga + neutral` 不包含这些规则。

### 问题 2：Narrative Focus（multiSelect: true）

```
header: "Focus"
question: "What should the comic emphasize? (Select all that apply)"
options:
  - label: "Biography/life story"
    description: "Follow a person's journey through key life events"
  - label: "Concept explanation"
    description: "Break down complex ideas visually"
  - label: "Historical event"
    description: "Dramatize important historical moments"
  - label: "Tutorial/how-to"
    description: "Step-by-step educational guide"
```

### 问题 3：Target Audience

```
header: "Audience"
question: "Who is the primary reader?"
options:
  - label: "General readers"
    description: "Broad appeal, accessible content"
  - label: "Students/learners"
    description: "Educational focus, clear explanations"
  - label: "Industry professionals"
    description: "Technical depth, domain knowledge"
  - label: "Children/young readers"
    description: "Simplified language, engaging visuals"
```

### 问题 4：Outline Review

```
header: "Review"
question: "Do you want to review the outline before image generation?"
options:
  - label: "Yes, let me review (Recommended)"
    description: "Review storyboard and characters before generating images"
  - label: "No, generate directly"
    description: "Skip outline review, start generating immediately"
```

### 问题 5：Prompt Review

```
header: "Prompts"
question: "Review prompts before generating images?"
options:
  - label: "Yes, review prompts (Recommended)"
    description: "Review image generation prompts before generating"
  - label: "No, skip prompt review"
    description: "Proceed directly to image generation"
```

**用户回复后**：
1. 用 user preferences 更新 `analysis.md`
2. 基于问题 4 的回复**存储 `skip_outline_review`** flag
3. 基于问题 5 的回复**存储 `skip_prompt_review`** flag
4. → Step 3

---

## Step 3: 生成 Storyboard + Characters

使用 Step 2 确认的 style 创建 storyboard 和 character definitions。

**加载 Style References**：
- Art style：`art-styles/{art}.md`
- Tone：`tones/{tone}.md`
- 如果使用 preset（ohmsha/wuxia/shoujo）：同时加载 `presets/{preset}.md`

**生成**：

1. **Storyboard** (`storyboard.md`):
   - 包含 art_style、tone、layout、aspect_ratio 的 YAML front matter
   - Cover design
   - 每页：layout、panel breakdown、visual prompts
   - **使用用户偏好语言书写**（来自 Step 1）
   - Reference：`storyboard-template.md`
   - **如果使用 preset**：加载并应用 `presets/` 中的 preset rules

2. **Character definitions** (`characters/characters.md`):
   - 与 art style 匹配的 visual specs（使用用户偏好语言）
   - 包含后续图片生成所需的 Reference Sheet Prompt
   - Reference：`character-template.md`
   - **如果使用 ohmsha preset**：使用默认 Doraemon characters（见下方）

**Ohmsha Default Characters**（除非用户指定 `--characters`，否则使用这些角色）：

| Role | Character | Visual Description |
|------|-----------|-------------------|
| Student | 大雄 (Nobita) | 日本男孩，10 岁，圆眼镜，中分黑发，黄色上衣，深蓝短裤 |
| Mentor | 哆啦 A 梦 (Doraemon) | 圆滚滚的蓝色机器猫，大白眼睛，红鼻子，胡须，白色肚皮带 4D pocket，金色铃铛，没有耳朵 |
| Challenge | 胖虎 (Gian) | 壮实男孩，粗犷五官，小眼睛，橙色上衣 |
| Support | 静香 (Shizuka) | 可爱女孩，黑色短发，粉色连衣裙，表情温柔 |

这些是 canonical ohmsha-style characters。除非用户明确要求，否则不要为 ohmsha 创建自定义角色。

**生成后**：
- 如果 `skip_outline_review` 为 true → 跳过 Step 4，直接进入 Step 5
- 如果 `skip_outline_review` 为 false → 继续 Step 4

---

## Step 4: Review Outline（Conditional）

如果用户在 Step 2 选择了 "No, generate directly"，**跳过此步骤**。

**目的**：用户在生成前 review 并确认 storyboard + characters。

**展示**：
- 页数和结构
- Art style + Tone 组合
- 逐页摘要（Cover → P1 → P2...）
- 带简短描述的 character list

**使用 AskUserQuestion**：

```
header: "Confirm"
question: "Ready to generate images with this outline?"
options:
  - label: "Yes, proceed (Recommended)"
    description: "Generate character sheet and comic pages"
  - label: "Edit storyboard first"
    description: "I'll modify storyboard.md before continuing"
  - label: "Edit characters first"
    description: "I'll modify characters/characters.md before continuing"
  - label: "Edit both"
    description: "I'll modify both files before continuing"
```

**用户回复后**：
1. 如果用户想编辑 → 等待用户完成编辑，然后再次询问
2. 如果用户确认 → 继续 Step 5

---

## Step 5: 生成 Prompts

为所有页面创建 image generation prompts。

**Style Reference Loading**：
- 读取 `art-styles/{art}.md` 获取 rendering guidelines
- 读取 `tones/{tone}.md` 获取 mood/color adjustments
- 如果使用 preset：读取 `presets/{preset}.md` 获取 special rules

**对每页（cover + pages）**：
1. 按 art style + tone guidelines 创建 prompt
2. 加入角色视觉描述以保持一致性
3. 保存到 `prompts/NN-{cover|page}-[slug].md`
   - **Backup rule**：如果 prompt 文件已存在，重命名为 `prompts/NN-{cover|page}-[slug]-backup-YYYYMMDD-HHMMSS.md`

**Prompt 文件格式**：
```markdown
# Page NN: [Title]

## Visual Style
Art: [art style] | Tone: [tone] | Layout: [layout type]

## Character Reference
[Character descriptions from characters/characters.md]

## Panel Breakdown
[From storyboard.md - panel descriptions, actions, dialogue]

## Generation Prompt
[Combined prompt for image generation skill]
```

**Watermark 应用**（如果在 preferences 中启用）：
添加到每个 prompt：
```
Include a subtle watermark "[content]" positioned at [position]. The watermark should
be legible but not distracting from the comic panels and storytelling.
Ensure watermark does not overlap speech bubbles or key action.
```
Reference：`config/watermark-guide.md`

**生成后**：
- 如果 `skip_prompt_review` 为 true → 跳过 Step 6，直接进入 Step 7
- 如果 `skip_prompt_review` 为 false → 继续 Step 6

---

## Step 6: Review Prompts（Conditional）

如果用户在 Step 2 选择了 "No, skip prompt review"，**跳过此步骤**。

**目的**：用户在图片生成前 review 并确认 prompts。

**展示 prompt 摘要表**：

| Page | Title | Key Elements |
|------|-------|--------------|
| Cover | [title] | [main visual] |
| P1 | [title] | [key elements] |
| ... | ... | ... |

**使用 AskUserQuestion**：

```
header: "Confirm"
question: "Ready to generate images with these prompts?"
options:
  - label: "Yes, proceed (Recommended)"
    description: "Generate all comic page images"
  - label: "Edit prompts first"
    description: "I'll modify prompts/*.md before continuing"
  - label: "Regenerate prompts"
    description: "Regenerate all prompts with different approach"
```

**用户回复后**：
1. 如果用户想编辑 → 等待用户完成编辑，然后再次询问
2. 如果用户想重新生成 → 回到 Step 5
3. 如果用户确认 → 继续 Step 7

---

## Step 7: 生成 Images

使用 Step 5/6 确认后的 prompts：

### 7.1 生成 Character Reference Sheet（conditional）

对于有重复角色的多页漫画，推荐生成 character sheet，但并非所有 presets 都**必须**生成。

**何时生成**：

| 条件 | 动作 |
|-----------|--------|
| 多页漫画，且有详细/重复出现的角色 | 生成 character sheet（推荐） |
| 使用简化角色的 preset（如 four-panel minimalist） | 跳过；prompt descriptions 已足够 |
| 单页漫画 | 跳过，除非角色复杂 |

**生成时**：
1. 使用 `characters/characters.md` 中的 Reference Sheet Prompt
2. **Backup rule**：如果 `characters/characters.png` 已存在，重命名为 `characters/characters-backup-YYYYMMDD-HHMMSS.png`
3. 生成 → `characters/characters.png`
4. **压缩**，以降低作为 `--ref` 使用时的 API payload size：
   - `sips -s format jpeg -s formatOptions 80 characters.png --out characters-compressed.jpg` (macOS)
   - 或：`pngquant --quality=65-80 characters.png -o characters-compressed.png`

### 7.2 生成 Comic Pages

**生成任何页面之前**：
1. 读取 image generation skill 的 SKILL.md
2. 检查它是否支持 reference image input（`--ref`、`--reference` 等）
3. 判断 character sheet 是否存在
4. 从下方选择合适策略

**页面生成策略**：

| Character Sheet | Skill Capability | 策略 |
|-----------------|------------------|----------|
| Exists | Supports `--ref` | **A**：每页都将 character sheet 作为 `--ref` 传入 |
| Exists | No `--ref` support | **B**：在每个 prompt 中嵌入角色描述 |
| Skipped | — | **C**：prompt 文件已 inline 包含所有描述 |

**Strategy A：使用 `--ref` parameter**（如 baoyu-image-gen）

- 读取所选 image generation skill 的 `SKILL.md`
- 通过其文档化接口调用已安装 skill，不要直接调用它的 scripts
- 每页使用 `prompts/01-page-xxx.md` 作为 prompt-file input
- 将输出保存到 `01-page-xxx.png`
- 使用 storyboard 中的 aspect ratio（默认 `3:4`，preset 可覆盖）
- 将 `characters/characters.png`（或压缩版本）作为 `--ref` 传入

**`--ref` 失败恢复**：
如果使用 `--ref` 时生成失败：
1. **压缩/转换** reference image：
   - `sips -s format jpeg -s formatOptions 70 characters.png --out characters-compressed.jpg`
   - 或降低分辨率：`sips -Z 1024 characters.png --out characters-small.png`
2. 使用压缩/转换后的图片作为 `--ref` **重试**
3. **如果仍失败**：fallback 到 **Strategy C**，不使用 `--ref` 生成，并将角色描述嵌入 prompt 文本

**Strategy B：在 prompt 中嵌入角色描述**

当 skill 不支持 reference images 时，创建合并后的 prompt 文件：

```markdown
# prompts/01-page-xxx.md (with embedded character reference)

## Character Reference (maintain consistency)
[Copy relevant sections from characters/characters.md here]
- 大雄：Japanese boy, round glasses, yellow shirt, navy shorts...
- 哆啦 A 梦：Round blue robot cat, white belly, red nose, golden bell...

## Page Content
[Original page prompt here]
```

**Strategy C：Prompt-only（无 character sheet）**

当 character sheet 被跳过或 `--ref` 失败时：
- Prompt 文件已经 inline 包含所有角色描述
- 不需要 `--ref` parameter
- 依靠详细文本描述维持角色一致性

**页面批量生成（cover + pages）**：
1. 从已保存的选中 prompts 构建 page task list：
   - `prompt_file`: `prompts/NN-{cover|page}-[slug].md`
   - `output_file`: `NN-{cover|page}-[slug].png`
   - `aspect_ratio`: from storyboard (default `3:4`; preset may override)
   - `refs`: character sheet and verified direct user refs when Strategy A is active
2. **Backup rule**：派发 task 前，如果其 image 文件已存在，重命名为 `NN-{cover|page}-[slug]-backup-YYYYMMDD-HHMMSS.png`。
3. 分 batch 派发 tasks：
   - Native batch backend：发送所有符合条件的 page tasks；如果 backend 有实际限制，则按 `generation_batch_size` 分块。
   - Runtime parallel calls：并发发起最多 `generation_batch_size` 个 image calls，然后继续下一块。
   - Sequential fallback：一次处理一页。
4. 每个 task 完成后报告："Generated X/N: [page title]"。
5. 失败时，从同一已保存 prompt 文件重试失败 task 一次。保留成功输出并继续。

**Session Management**：
如果 image generation skill 支持 `--sessionId`：
1. 生成唯一 session ID：`comic-{topic-slug}-{timestamp}`
2. 所有页面使用同一个 session ID
3. 确保生成图片之间的视觉一致性

---

## Step 8: 合并为 PDF

所有 images 生成后：

```bash
${BUN_X} {baseDir}/scripts/merge-to-pdf.ts <comic-dir>
```

创建 `{topic-slug}.pdf`，所有页面均作为 full-page images。

---

## Step 9: 完成报告

```
Comic Complete!
Title: [title] | Art: [art] | Tone: [tone] | Pages: [count] | Aspect: [ratio] | Language: [lang]
Watermark: [enabled/disabled]
Location: [path]
✓ analysis.md
✓ characters.png (if generated)
✓ 00-cover-[slug].png ... NN-page-[slug].png
✓ {topic-slug}.pdf
```

---

## Page Modification

| Action | 步骤 |
|--------|-------|
| **Edit** | 更新 prompt → 重新生成 image → 重新生成 PDF |
| **Add** | 在目标位置创建 prompt → 生成 image → 后续重新编号（NN+1）→ 更新 storyboard → 重新生成 PDF |
| **Delete** | 删除文件 → 后续重新编号（NN-1）→ 更新 storyboard → 重新生成 PDF |

**文件命名**：`NN-{cover|page}-[slug].png`（如 `03-page-enigma-machine.png`）
- Slugs：kebab-case、唯一、由内容派生
- Renumbering：只更新 NN 前缀，slugs 不变
