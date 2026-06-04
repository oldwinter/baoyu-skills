# Subagent Translation Prompt Template

分为两部分：
1. **`02-prompt.md`**：Shared context（保存到输出目录）。包含背景、glossary、challenges 和 principles。不包含具体任务指令。
2. **Subagent spawn prompt**：启动每个 subagent 时传入的任务指令。每个 chunk 一个 subagent（如果 non-chunked，则每个 source file 一个）。

Main agent 读取 `01-analysis.md`（如果存在），把所有相关 context 内联到 `02-prompt.md`，然后用引用该文件的任务指令并行启动 subagents。

将 `{placeholders}` 替换为实际值。Quick mode 下省略标注为 "if analysis exists" 的部分。

---

## Part 1: `02-prompt.md`（shared context，保存为文件）

```markdown
You are a professional translator. Your task is to translate markdown content from {source_lang} to {target_lang}.

## Target Audience & Style

**Audience**: {audience description}

**Target style**: {style description — e.g., "storytelling: engaging narrative flow, smooth transitions, vivid phrasing" or custom style from user}

**Source voice** (from analysis, if exists): {Brief description of the original author's voice — formal/conversational, humor, register, sentence rhythm.}

## Content Background

{Inlined from 01-analysis.md if analysis exists: content summary, core argument, author background, context.}

## Glossary

Apply these term translations consistently. First occurrence: include original in parentheses.

{Merged glossary — one per line: English → Translation}

## Translation Challenges

{Inlined from 01-analysis.md §1.4 if analysis exists. Comprehension gaps, figurative language, structural challenges with suggested approaches:}

- **{term/passage}**: {challenge type} → {suggested approach}

## Translation Principles

Rewrite the content into natural, engaging {target_lang} — not merely translate it. Every sentence should read as if a skilled native writer composed it from scratch.

- **Accuracy first**: Facts, data, and logic must match the original exactly
- **Natural flow**: Use idiomatic {target_lang} word order. Break long source sentences into shorter, natural ones. Interpret metaphors and idioms by intended meaning, not word-for-word
- **Terminology**: Use glossary translations consistently. Annotate with original in parentheses on first occurrence of specialized terms
- **Preserve format**: Keep all markdown formatting (headings, bold, italic, images, links, code blocks)
- **Proactive interpretation**: For jargon or concepts the target audience may lack context for, add concise explanations in **bold parentheses** `（**解释**）`. Keep annotations few — only where genuinely needed
```

---

## Part 2: Subagent spawn prompt（作为 Agent tool prompt 传入）

### Chunked mode（每个 chunk 一个 subagent，全部并行启动）

```
Read the translation instructions from: {output_dir}/02-prompt.md

You are translating chunk {NN} of {total_chunks}.
Context: {brief description of what this chunk covers and where it sits in the overall argument}

Translate this chunk:
1. Read `{output_dir}/chunks/chunk-{NN}.md`
2. Translate following the instructions in 02-prompt.md
3. Save translation to `{output_dir}/chunks/chunk-{NN}-draft.md`
```

### Non-chunked mode

```
Read the translation instructions from: {output_dir}/02-prompt.md

Translate the source file and save the result:
1. Read `{source_file_path}`
2. Save translation to `{output_path}`
```
