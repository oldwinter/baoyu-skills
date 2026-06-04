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

## Usage

Workflow 分为两个阶段：**Analyze**（理解内容）和 **Format**（应用格式）。Claude 负责内容分析和格式调整（Steps 1-5），然后运行 script 做 typography fixes（Step 6）。

## Workflow

### Step 1：Read & Detect Content Type

读取用户指定的文件，然后检测 content type：

| Indicator | Classification |
|-----------|----------------|
| 有 `---` YAML frontmatter | Markdown |
| 有 `#`、`##`、`###` headings | Markdown |
| 有 `**bold**`、`*italic*`、lists、code blocks、blockquotes | Markdown |
| 以上都没有 | Plain text |

**如果检测到 Markdown，使用 `AskUserQuestion` 询问：**

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

**根据用户选择：**

- **Optimize**：继续 Step 2（完整 workflow）
- **Keep original**：跳到 Step 5，复制文件后运行 Step 6
- **Typography only**：跳到 Step 6，直接在原文件上运行

### Step 2：Analyze Content（Reader's Perspective）

仔细阅读全文。站在读者视角思考：什么能帮助读者快速理解并记住关键信息？

产出覆盖以下维度的 analysis：

**2.1 Highlights & Key Insights**

- 作者提出的核心论点或结论
- 令人意外的事实、数据点或反直觉观点
- 值得记住的引用或精炼句子（金句）

**2.2 Structure Assessment**

- 内容是否有清晰的逻辑流？是什么？
- 是否存在自然段落边界但缺少 headings？
- 是否有大段文字适合做视觉分隔？

**2.3 Reader-Important Information**

- 可执行建议或 takeaways
- 关键概念的定义、解释
- 埋在 prose 中的列表或枚举
- 更适合用 tables 表达的比较或对照

**2.4 Formatting Issues**

- 缺失或不一致的 heading hierarchy
- 一个段落混合多个主题
- 并列项写成了 prose，而不是 lists
- Code、commands、technical terms 没有标成 code
- 明显 typos 或 formatting errors

**保存 analysis 到文件**：`{original-filename}-analysis.md`

Analysis file 是 Step 3 的 blueprint。使用以下格式：

```markdown
# Content Analysis: {filename}

## Highlights & Key Insights
- [list findings]

## Structure Assessment
- Current flow: [describe]
- Suggested sections: [list heading candidates with brief rationale]

## Reader-Important Information
- [list actionable items, key concepts, buried lists, potential tables]

## Formatting Issues
- [list specific issues with location references]

## Typos Found
- [list any obvious typos with corrections, or "None found"]
```

### Step 3：Check/Create Frontmatter, Title & Summary

检查 YAML frontmatter（`---` block）。如果缺失则创建。

| Field | Processing |
|-------|------------|
| `title` | 见下方 **Title Generation** |
| `slug` | 从 file path 推断，或从 title 生成 |
| `summary` | 一句话简明摘要（见下方 **Summary Generation**） |
| `description` | 更长的描述性摘要（见下方 **Summary Generation**） |
| `coverImage` | 检查同目录是否存在 `imgs/cover.png`；如存在，使用 relative path |

#### Title Generation

无论 title 是否已存在，只要没有设置 `auto_select_title`，都运行 title optimization flow。

**Preparation**：阅读全文并提取：

- Core argument（一句话："what is this article about?"）
- 最有冲击力的观点或结论
- 读者痛点或好奇心 trigger
- 最有记忆点的 metaphor 或 golden quote

**Generate candidates**：使用 `references/title-formulas.md` 中的 formulas。

1. 根据文章内容、语气和结构，选择 **2-3 个最匹配的 hook formulas**（见 reference 中的 "When to pick each formula"）
2. 生成 **1-2 个 straightforward titles**（描述性或陈述性，不套公式，清晰准确）
3. 如果用户指定方向（例如 "make it suspenseful"），优先该方向
4. 总数：**4-5 个 candidates**

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

把最强 hook 放在第一项，并标记 `(recommended)`。原则和禁用模式见 `references/title-formulas.md`。

如果第一行是 H1，把它提取到 frontmatter 并从正文中移除。如果 frontmatter 已有 `title`，把它作为 context，但仍生成新的 candidates：现有 title 可能较弱。

**Skip behavior**：如果 `auto_select: true` 或 `auto_select_title: true`，跳过用户询问，直接使用 top candidate。

#### Summary Generation

直接生成两个版本（无需用户选择），都存入 frontmatter：

| Field | Length | Purpose |
|-------|--------|---------|
| `summary` | 1 sentence，约 50-80 chars | Concise hook，用于 feeds、social sharing、SEO meta |
| `description` | 2-3 sentences，约 100-200 chars | 更丰富的 context，用于 article previews、newsletter blurbs |

**Principles**：

- 传达给读者的 **core value**，而不只是主题
- 使用具体细节（数字、结果、具体方法），避免模糊描述
- `summary` 应短促、有力、自包含；`description` 可展开 supporting details
- 如果 frontmatter 已有 `summary` 或 `description`，保留已有字段，只生成缺失字段

**Prohibited patterns**：

- "This article introduces..."、"This article explores..."
- 只有 topic description，没有 value proposition
- 用不同措辞重复 title

Title 进入 frontmatter 后，正文中不应再包含 H1（避免重复）。

### Step 4：Format Content

根据 Step 2 analysis 应用格式。目标是让内容更易扫读，让关键点不容易被错过。

**Formatting toolkit：**

| Element | When to use | Format |
|---------|-------------|--------|
| Headings | 自然主题边界、section breaks | `##`、`###` hierarchy |
| Bold | 关键结论、重要术语、核心 takeaways | `**bold**` |
| Unordered lists | 并列项、feature lists、examples | `- item` |
| Ordered lists | 连续步骤、ranked items、procedures | `1. item` |
| Tables | 比较、结构化数据、option matrices | Markdown table |
| Code | Commands、file paths、technical terms、variable names | `` `inline` `` 或 fenced blocks |
| Blockquotes | 重要引用、重要 warnings、cited text | `> quote` |
| Separators | 重大 topic transitions | `---` |

**Formatting principles — what NOT to do：**

- 不要添加 sentences、explanations 或 commentary
- 不要删除或缩短任何内容
- 不要改写或重写作者原话
- 不要添加带 editorialize 的 headings（例如 "Amazing Discovery"；使用中性描述性 headings）
- 不要过度格式化：不是每句话都需要 bold，也不是每段都需要 heading

**Formatting principles — what TO do：**

- 保留作者 voice、tone 和每一个字词
- **Bold key conclusions and core takeaways**：读者会划线的句子
- 只有当 prose 中结构已经清晰存在时，才把并列项抽成 lists
- 在主题真正切换处添加 headings：优先使用生动、具体的 headings，而非泛泛标题（例如 "3 天搞定 vs 传统方案" 优于 "方案对比"）
- 对埋在 prose 中的比较或结构化数据使用 tables
- 对 golden quotes、memorable statements 或 important warnings 使用 blockquotes
- 修正明显 typos（基于 Step 2 findings）

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

**Examples：**

```bash
# Default: spacing + emphasis enabled, quotes disabled
${BUN_X} {baseDir}/scripts/main.ts article.md

# Enable all features including quote replacement
${BUN_X} {baseDir}/scripts/main.ts article.md --quotes

# Only fix emphasis issues, skip spacing
${BUN_X} {baseDir}/scripts/main.ts article.md --no-spacing
```

**Script performs（based on options）：**

1. 修复 CJK emphasis/bold punctuation issues（default: enabled）
2. 通过 autocorrect 添加 CJK/English mixed text spacing（default: enabled）
3. 将 ASCII quotes 替换为全角引号（default: disabled）
4. 格式化 frontmatter YAML（always enabled）

### Step 7：Completion Report

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

按实际变更调整报告；没有发生的类别要省略。

## Notes

- 保留原始 writing style 和 tone
- 为 code blocks 指定正确语言（例如 `python`、`javascript`）
- 维护 CJK/English spacing standards
- Analysis file 是 working document：它帮助保持“发现的问题”和“实际格式化内容”之间的一致性

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** section。
