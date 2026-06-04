---
name: baoyu-translate
description: >-
  当用户要求 "translate", "翻译", "精翻", "translate article",
  "translate to Chinese", "translate to English", "改成中文", "改成英文", "convert to Chinese",
  "localize", "本地化", "refined translation", "精细翻译", "proofread translation", "快速翻译", "快翻",
  "这篇文章翻译一下"，或提供带翻译意图的 URL/文件时，使用此 skill。支持三种模式
  (quick/normal/refined)，并支持自定义 glossary。
version: 1.59.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-translate
    requires:
      anyBins:
        - bun
        - npx
---

# Translator

三模式翻译 skill：**quick** 用于直接翻译，**normal** 用于基于分析的翻译，**refined** 用于带审校和润色的完整出版级工作流。

## User Input Tools

当此 skill 需要向用户提问时，按以下工具选择规则执行（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等价工具。
2. **Fallback**：如果没有此类工具，输出带编号的纯文本消息，请用户对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持一次调用多个问题，将所有适用问题合并到一次调用；如果只支持单问题，则按优先级顺序逐个询问。

下文具体的 `AskUserQuestion` 引用只是示例；在其他 runtime 中请替换成本地等价工具。

## Script Directory

脚本位于 `scripts/` 子目录。`{baseDir}` = 此 SKILL.md 所在目录路径。解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。将 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| Script | 用途 |
|--------|---------|
| `scripts/main.ts` | CLI 入口。默认动作会把 markdown 切成 chunks；也支持显式 `chunk` 子命令 |
| `scripts/chunk.ts` | `main.ts` 使用的 Markdown chunking 实现，同时保持可直接调用兼容 |

## Preferences (EXTEND.md)

按优先级顺序检查 EXTEND.md，找到的第一个生效：

| 优先级 | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-translate/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-translate/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-translate/EXTEND.md` | User home |

| 结果 | 动作 |
|--------|--------|
| Found | 读取、解析、应用。本会话首次使用时简短提醒："Using preferences from [path]. You can edit EXTEND.md to customize glossary, audience, etc." |
| Not found | **必须**运行 first-time setup（见下文），不要静默使用默认值 |

**EXTEND.md 支持**：默认目标语言、默认模式、目标受众、自定义 glossaries（内联或文件路径）、翻译风格、chunk 设置。

Schema: [references/config/extend-schema.md](references/config/extend-schema.md).

### First-Time Setup（阻塞）

**关键**：找不到 EXTEND.md 时，在任何翻译开始前都**必须**运行 first-time setup。这是一个**阻塞**操作。

Full reference: [references/config/first-time-setup.md](references/config/first-time-setup.md)

使用 `AskUserQuestion` 在一次调用中提出所有问题（目标语言、模式、受众、风格、保存位置）。用户回答后，在所选位置创建 EXTEND.md，确认 "Preferences saved to [path]"，然后继续。

## 默认值

所有可配置值集中在此。EXTEND.md 会覆盖这些默认值；CLI flags 会覆盖 EXTEND.md。

| 设置 | 默认值 | EXTEND.md key | CLI flag | 说明 |
|---------|---------|---------------|----------|-------------|
| Target language | `zh-CN` | `target_language` | `--to` | 翻译目标语言 |
| Mode | `normal` | `default_mode` | `--mode` | 翻译模式 |
| Audience | `general` | `audience` | `--audience` | 目标读者画像 |
| Style | `storytelling` | `style` | `--style` | 翻译风格偏好 |
| Chunk threshold | `4000` | `chunk_threshold` | — | 触发 chunked translation 的词数 |
| Chunk max words | `5000` | `chunk_max_words` | — | 每个 chunk 最大词数 |

## Modes

| Mode | Flag | 步骤 | 适用场景 |
|------|------|-------|-------------|
| Quick | `--mode quick` | Translate | 短文本、非正式内容、快速任务 |
| Normal | `--mode normal` (default) | Analyze → Translate | 文章、博客、通用内容 |
| Refined | `--mode refined` | Analyze → Translate → Review → Polish | 出版级质量、重要文档 |

**默认模式**：Normal（可通过 EXTEND.md 的 `default_mode` 设置覆盖）。

**Style presets**：控制译文的 voice 和 tone（独立于 audience）：

| Value | 说明 | 效果 |
|-------|-------------|--------|
| `storytelling` | 有吸引力的叙事流（默认） | 吸引读者，过渡顺畅，措辞生动 |
| `formal` | 专业、结构化 | 中性语气，组织清晰，无口语化表达 |
| `technical` | 精确、文档风格 | 简洁、术语密集，少修饰 |
| `literal` | 接近原文结构 | 最小重组，保留源文句式模式 |
| `academic` | 学术、严谨 | 正式语域，可使用复杂从句，注意引用语境 |
| `business` | 简洁、结果导向 | 行动导向，适合管理者阅读，偏 bullet-point 思维 |
| `humorous` | 保留并改写幽默 | 机智、俏皮，在目标语言中重建喜剧效果 |
| `conversational` | 轻松、口语化 | 友好、亲近，像给朋友解释 |
| `elegant` | 文学化、精致散文 | 审美精致，有节奏，精心选词 |

也接受自定义 style 描述，例如 `--style "poetic and lyrical"`。

**自动检测**：
- "快翻", "quick", "直接翻译" → quick mode
- "精翻", "refined", "publication quality", "proofread" → refined mode
- 其他情况 → 默认模式（normal）

**升级提示**：normal mode 完成后，显示：
> Translation saved. To further review and polish, reply "继续润色" or "refine".

如果用户响应，在现有输出上继续执行 review → polish 步骤（同 refined mode 在 refined-workflow.md 中的 Steps 4-6）。

**Audience presets**：

| Value | 说明 | 效果 |
|-------|-------------|--------|
| `general` | 普通读者（默认） | 语言平实，对术语添加更多译注 |
| `technical` | Developers / engineers | 对常见技术术语减少注释 |
| `academic` | Researchers / scholars | 正式语域，术语精确 |
| `business` | 商务专业人士 | 商务友好语气，解释技术概念 |

也接受自定义 audience 描述，例如 `--audience "AI感兴趣的普通读者"`。

## 工作流

### Step 1: 加载 Preferences

1.1 检查 EXTEND.md（见上方 Preferences 部分）

1.2 如果当前语言对有内置 glossary，则加载：
- EN→ZH: [references/glossary-en-zh.md](references/glossary-en-zh.md)

1.3 合并 glossaries：EXTEND.md `glossary`（内联）+ EXTEND.md `glossary_files`（外部文件，路径相对 EXTEND.md 所在位置）+ 内置 glossary + `--glossary` 文件（CLI 覆盖全部）

### Step 2: 物化 Source 并创建输出目录

物化 source（文件保持原样，内联文本/URL → 保存为 `translate/{slug}.md`），然后创建输出目录：`{source-dir}/{source-basename}-{target-lang}/`。如果未指定 `--from`，则检测源语言。

Full details: [references/workflow-mechanics.md](references/workflow-mechanics.md)

**输出目录内容**（所有中间文件和最终文件都放在这里）：

| File | Mode | 说明 |
|------|------|-------------|
| `translation.md` | All | 最终译文（始终使用此名称） |
| `01-analysis.md` | Normal, Refined | 内容分析（领域、语气、术语） |
| `02-prompt.md` | Normal, Refined | 组装后的 translation prompt |
| `03-draft.md` | Refined | review 前的初稿 |
| `04-critique.md` | Refined | 批判性审校发现（仅诊断） |
| `05-revision.md` | Refined | 基于 critique 修订后的译文 |
| `chunks/` | Chunked | Source chunks + translated chunks |

### Step 3: 评估内容长度

Quick mode 不做 chunk，无论长度如何都直接翻译。翻译前估算词数。如果内容超过 chunk threshold（默认 4000 词），主动提醒："This article is ~{N} words. Quick mode translates in one pass without chunking — for long content, `--mode normal` produces better results with terminology consistency." 如果用户没有切换模式，则继续。

对于 normal 和 refined 模式：

| Content | 动作 |
|---------|--------|
| < chunk threshold | 作为单个单元翻译 |
| >= chunk threshold | Chunk translation（见 Step 3.1） |

**3.1 长内容准备**（仅 normal/refined 模式且 >= chunk threshold 时）

翻译 chunks 前：

1. **提取术语**：扫描整篇文档，找出 proper nouns、技术术语、重复短语
2. **构建 session glossary**：将提取出的术语与已加载 glossaries 合并，建立一致译法
3. **Split into chunks**: Use `${BUN_X} {baseDir}/scripts/main.ts <file> [--max-words <chunk_max_words>] [--output-dir <output-dir>]`
   - 解析 markdown blocks（headings、paragraphs、lists、code blocks、tables 等）
   - 在 markdown block 边界切分，以保留结构
   - 如果单个 block 超过阈值，则 fallback 到按行切分，再 fallback 到按词切分
4. **组装 translation prompt**：
   - Main agent 读取 `01-analysis.md`（如果存在），使用 [references/subagent-prompt-template.md](references/subagent-prompt-template.md) 的 Part 1 组装 shared context，并内联：target style、content background、merged glossary 和 translation challenges
   - 在输出目录保存为 `02-prompt.md`（只包含 shared context，不包含任务指令）
5. **通过 subagents 起草译文**（如果 Agent tool 可用）：
   - 每个 chunk 启动一个 subagent，全部并行（template 的 Part 2）
   - 每个 subagent 读取 `02-prompt.md` 获取 shared context，接收 chunk 位置信息（chunk N of M + 该 chunk 在整体论证中的简短上下文），翻译自己的 chunk，并保存到 `chunks/chunk-NN-draft.md`
   - 一致性由共享的 `02-prompt.md` 保证（glossary、figurative language mapping、comprehension challenges、source voice，以及分析得出的 translation challenges）
   - 如果没有 chunks（内容低于阈值）：为整个 source file 启动一个 subagent
   - 如果 Agent tool 不可用，则使用 `02-prompt.md` 顺序内联翻译 chunks
6. **合并**：所有 subagents 完成后，按顺序合并 translated chunks。如果存在 `chunks/frontmatter.md`，则置于开头。保存为 `03-draft.md`（refined）或 `translation.md`（normal）
7. 所有中间文件（source chunks + translated chunks）都保留在 `chunks/`

**chunked draft 合并后**，控制权回到 main agent，继续 critical review、revision 和 polish（Step 4）。

### Step 4: 翻译与精修

**翻译原则**（适用于所有模式）：

- **重写，而不只是翻译**：把内容重写成自然、有吸引力的目标语言，就像熟练的母语写作者从头写成。质量测试："Does this read like it was originally written in the target language?"
- **准确优先**：事实、数据和逻辑必须与原文完全一致
- **自然流畅**：使用符合目标语言习惯的语序。把源语言长句拆成更短、更自然的句子。按意图理解 metaphor 和 idiom，不逐字硬译
- **术语**：一致使用标准译法。专业术语首次出现时，用括号标注原文
- **保留格式**：保留所有 markdown 格式（headings、bold、italic、images、links、code blocks）
- **主动解释**：对于目标受众可能缺少上下文的 jargon 或概念，添加简短解释，格式为 **bold parentheses** `（**解释**）`。注释要少，只在确实有助理解时使用
- **Frontmatter**：如果 source 有 YAML frontmatter，把 source-metadata 字段改名为带 `source` 前缀（camelCase：`url`→`sourceUrl`、`title`→`sourceTitle` 等），并把翻译后的值作为新的 top-level 字段加入（如果正文有 H1 则跳过 `title`），其他字段保持原样

#### Quick Mode

直接翻译 → 保存到 `translation.md`。应用上方所有翻译原则。

#### Normal Mode

1. **Analyze** → `01-analysis.md`（领域、语气、术语、translation challenges）
2. **Assemble prompt** → `02-prompt.md`（带 context、glossary、challenges 的翻译指令）
3. **Translate**（遵循 `02-prompt.md`）→ `translation.md`

完成后，提示用户："Translation saved. To further review and polish, reply **继续润色** or **refine**."

如果用户继续，则执行 critical review → revision → polish（同下方 refined mode Steps 4-6），保存 `03-draft.md`（将当前 `translation.md` 重命名）、`04-critique.md`、`05-revision.md`，并更新 `translation.md`。

#### Refined Mode

面向出版质量的完整工作流。每一步详细指南见 [references/refined-workflow.md](references/refined-workflow.md)。

subagent（如果在 Step 3.1 使用）只负责初稿。后续所有步骤（critical review、revision、polish）由 main agent 处理；main agent 可按需委托给 subagents。

步骤和保存文件（全部位于输出目录）：
1. **Analyze** → `01-analysis.md`（领域、语气、术语、translation challenges）
2. **Assemble prompt** → `02-prompt.md`（带内联 context 的翻译指令）
3. **Draft** → `03-draft.md`（带 translator's notes 的初始译文；如果 chunked，则来自 subagent）
4. **Critical review** → `04-critique.md`（仅诊断：准确性、欧化语言、策略执行、表达问题）
5. **Revision** → `05-revision.md`（应用所有 critique findings，产出修订译文）
6. **Polish** → `translation.md`（最终出版级译文）

每一步都读取上一步文件并在其基础上继续。

### Step 5: 输出

最终译文始终位于输出目录中的 `translation.md`。

最终译文写入后，做一次轻量 image-language 检查：

1. 从译文文章中收集图片引用
2. 识别可能文字密集的图片，例如封面、截图、diagrams、charts、frameworks 和 infographics
3. 如果任何图片可能包含与译文文章语言不匹配的主要文本语言，主动提醒用户
4. 提醒只能是列表。除非用户要求，否则不要自动本地化这些图片

提醒格式（使用文章已有的图片语法，standard markdown 或 wikilink）：
```text
Possible image localization needed:
- ![example cover](attachments/example-cover.png): likely still contains source-language text while the article is now in target language
- ![example diagram](attachments/example-diagram.png): likely text-heavy framework graphic, check whether labels need translation
```

Display summary:
```
**Translation complete** ({mode} mode)

Source: {source-path}
Languages: {from} → {to}
Output dir: {output-dir}/
Final: {output-dir}/translation.md
Glossary terms applied: {count}
```

如果发现疑似 image-language 不匹配候选项，在 summary 后追加简短说明，告诉用户部分嵌入图片可能仍需 image-text localization，然后列出候选列表。

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** 部分。
