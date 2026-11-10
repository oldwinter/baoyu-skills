---
name: baoyu-format-markdown
description: 为纯文本或 markdown 文件添加/优化 frontmatter、标题、摘要、headings、bold、lists 和 code blocks。当用户要求 "format markdown"、"beautify article"、"add formatting"，或改进文章版式时使用。输出到 {filename}-formatted.md。
version: 1.57.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-format-markdown
    requires:
      anyBins:
        - bun
        - npx
---

# Markdown Formatter

把纯文本或 markdown 转换为结构清晰、便于阅读的 markdown。目标是帮助读者快速抓住重点、亮点和结构，同时 **不改变任何原始内容**。

**核心原则**：只调整格式并修正明显 typo。绝不新增、删除或改写内容。

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Script Directory

Scripts 位于 `scripts/` 子目录。`{baseDir}` = 当前 SKILL.md 所在目录路径。解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。把本文档中的 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | 带 CLI options 的 main entry point（使用 remark-cjk-friendly 处理 CJK emphasis） |
| `scripts/quotes.ts` | 将 ASCII quotes 替换为全角引号 |
| `scripts/autocorrect.ts` | 通过 autocorrect 添加 CJK/English spacing |

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-format-markdown/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-format-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md` | User home |

如果没有找到，使用默认值；该 skill 不需要 first-time setup。

**EXTEND.md supports**：

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| `auto_select` | `true`/`false` | `false` | 跳过 title 和 summary 选择，自动选最佳 |
| `auto_select_title` | `true`/`false` | `false` | 只跳过 title 选择 |
| `auto_select_summary` | `true`/`false` | `false` | 只跳过 summary 选择 |
| Other | — | — | 默认 formatting options、typography preferences |

## Workflow

Agent 负责分析和格式化（Steps 1-5），然后运行 typography script（Step 6）。

### Step 1：Read & Detect Content Type

读取文件。如果有 `---` YAML frontmatter、`#`/`##`/`###` headings，或 `**bold**`/`*italic*`/lists/code blocks/blockquotes，则为 **Markdown**；否则为 **plain text**。

如果是 Markdown，询问：

```text
Detected existing markdown formatting. What would you like to do?

1. Optimize formatting (Recommended)
   - Analyze content, improve headings, bold, lists for readability
   - Run typography script (spacing, emphasis fixes)
   - Output: {filename}-formatted.md

2. Keep original formatting
   - Preserve existing markdown structure
   - Run typography script only
   - Output: {filename}-formatted.md

3. Typography fixes only
   - Run typography script on original file in-place
   - No copy created, modifies original file directly
```

- **Optimize** → Step 2（完整 workflow）
- **Keep original** → 跳到 Step 5（复制文件），然后 Step 6
- **Typography only** → 对原文件直接跳到 Step 6

- **Optimize**：继续 Step 2（完整 workflow）
- **Keep original**：跳到 Step 5，复制文件后运行 Step 6
- **Typography only**：跳到 Step 6，直接在原文件上运行

### Step 2：Analyze Content（Reader's Perspective）

阅读全文，思考什么能帮助读者快速理解并记住内容。保存 `{original-filename}-analysis.md` — Step 4 的 blueprint：

```markdown
# Content Analysis: {filename}

## Highlights & Key Insights
- [core arguments/conclusions, surprising facts or data, counterintuitive claims, golden quotes]

## Structure Assessment
- Current flow: [describe]
- Suggested sections: [heading candidates with brief rationale; unheaded section boundaries; walls of text needing breaks]

## Reader-Important Information
- [actionable takeaways, key definitions, lists buried in prose, comparisons that should be tables]

## Formatting Issues
- [specific issues with location: heading hierarchy, mixed-topic paragraphs, parallel items as prose, unmarked code/commands/terms]

## Typos Found
- [obvious typos with corrections, or "None found"]
```

### Step 3：Check/Create Frontmatter, Title & Summary

如果缺失，创建 YAML frontmatter block。

| Field | Processing |
|-------|------------|
| `title` | 见 **Title Generation** |
| `slug` | 从 file path 推断，或从 title 生成 |
| `summary` | 一句话摘要（见 **Summary Generation**） |
| `description` | 更长的描述性摘要（见 **Summary Generation**） |
| `coverImage` | 如果同目录存在 `imgs/cover.png`，使用其 relative path |

#### Title Generation

除非设置了 `auto_select_title`，否则即使已有 title 也运行此流程。

1. 提取：core argument（一句话）、最有冲击力的观点/结论、读者痛点或好奇心 trigger、最有记忆点的 metaphor 或 golden quote
2. 使用 [references/title-formulas.md](references/title-formulas.md)：选择 **2-3 个最匹配的 hook formulas**（"When to pick each formula"），加上 **1-2 个 straightforward titles**（描述性或陈述性，不套公式）。如果用户指定方向（例如 "make it suspenseful"），优先该方向。总数 **4-5 个 candidates**，遵守 reference 中的原则和禁用模式
3. 询问，最强 hook 放第一并标记 `(recommended)`：

通过 `AskUserQuestion` 展示：

```text
Pick a title:

1. [Hook title A] — (recommended) [formula name]
2. [Hook title B] — [formula name]
3. [Hook title C] — [formula name]
4. [Straightforward title D] — straightforward
5. [Straightforward title E] — straightforward

Enter number, or type a custom title:
```

- 第一行是 H1 → 移到 frontmatter 并从正文移除。已有 frontmatter `title` 只作为 context；仍要生成新的 candidates。
- `auto_select: true` 或 `auto_select_title: true` → 跳过询问，使用 top candidate。
- title 进入 frontmatter 后，正文中不得再包含 H1。

#### Summary Generation

直接生成两个版本（无需用户选择）：

| Field | Length | Purpose |
|-------|--------|---------|
| `summary` | 1 sentence，约 50-80 chars | Concise hook，用于 feeds、social sharing、SEO meta |
| `description` | 2-3 sentences，约 100-200 chars | 更丰富的 context，用于 article previews、newsletter blurbs |

- 传达给读者的 **core value**，而不只是主题；优先使用具体细节（数字、结果、具体方法）
- `summary` 应短促、有力、自包含；`description` 可补充 supporting details
- 保留已有的 `summary`/`description`；只生成缺失的那个
- 禁止："This article introduces..."、"This article explores..."；只有 topic description 没有 value；用不同措辞重复 title

### Step 4：Format Content

根据 Step 2 analysis 应用格式，让内容更易扫读、关键点不容易被错过：使用 headings（`##`/`###`）、bold、ordered/unordered lists、tables、inline/fenced code（commands、paths、technical terms）、blockquotes，以及用于重大 transitions 的 `---`。

**不要：**
- 添加 sentences、explanations 或 commentary
- 删除或缩短任何内容
- 改写或重写作者原话
- 添加带 editorialize 的 headings（例如 "Amazing Discovery"；使用中性描述性 headings）
- 过度格式化：不是每句话都需要 bold，也不是每段都需要 heading

**要：**
- 保留作者 voice、tone 和每一个字词
- **Bold 关键结论和核心 takeaways**：读者会划线的句子
- 只有当 prose 中并列结构清晰存在时，才把内容转成 lists
- 在主题真正切换处添加 headings：优先使用生动、具体的 headings，而非泛泛标题（例如 "3 天搞定 vs 传统方案" 优于 "方案对比"）
- 对埋在 prose 中的比较或结构化数据使用 tables
- 对 golden quotes、memorable statements 或 important warnings 使用 blockquotes
- 修正明显 typos（基于 Step 2）
- 为 code blocks 指定语言（例如 `python`、`javascript`）
- 维护 CJK/English spacing standards

**Formatting principles — what TO do：**

### Step 5：Save Formatted File

保存为 `{original-filename}-formatted.md`

**Backup existing file：**

```bash
if [ -f "{filename}-formatted.md" ]; then
  mv "{filename}-formatted.md" "{filename}-formatted.backup-$(date +%Y%m%d-%H%M%S).md"
fi
```

### Step 6：Execute Typography Script

对 output file 运行 formatting script：

```bash
${BUN_X} {baseDir}/scripts/main.ts {output-file-path} [options]
```

**Script Options：**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--quotes` | `-q` | 将 ASCII quotes 替换为全角引号 `"..."` | false |
| `--no-quotes` | | 不替换 quotes | |
| `--spacing` | `-s` | 通过 autocorrect 添加 CJK/English spacing | true |
| `--no-spacing` | | 不添加 CJK/English spacing | |
| `--emphasis` | `-e` | 修复 CJK emphasis punctuation issues | true |
| `--no-emphasis` | | 不修复 CJK emphasis issues | |

Frontmatter YAML 始终会格式化。示例：`main.ts article.md`（defaults）、`--quotes`（增加 quote replacement）、`--no-spacing`（仅 emphasis）。

1. 修复 CJK emphasis/bold punctuation issues（default: enabled）
2. 通过 autocorrect 添加 CJK/English mixed text spacing（default: enabled）
3. 将 ASCII quotes 替换为全角引号（default: disabled）
4. 格式化 frontmatter YAML（always enabled）

### Step 7：Completion Report

报告实际发生的变更；没有发生的类别要省略：

展示总结所有变更的报告：

```markdown
**Formatting Complete**

**Files:**
- Analysis: {filename}-analysis.md
- Formatted: {filename}-formatted.md

**Content Analysis Summary:**
- Highlights found: X key insights
- Golden quotes: X memorable sentences
- Formatting issues fixed: X items

**Changes Applied:**
- Frontmatter: [added/updated] (title, slug, summary)
- Headings added: X (##: N, ###: N)
- Bold markers added: X
- Lists created: X (from prose → list conversion)
- Tables created: X
- Code markers added: X
- Blockquotes added: X
- Typos fixed: X [list each: "original" → "corrected"]

**Typography Script:**
- CJK spacing: [applied/skipped]
- Emphasis fixes: [applied/skipped]
- Quote replacement: [applied/skipped]
```

## Extension Support

通过 EXTEND.md 自定义配置，见上方 **Preferences**。
