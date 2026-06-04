# Translation Workflow 细节

本文件提供各 workflow step 的详细指南。各模式共用这些步骤：

- **Quick**：仅 Translate（不使用本文件步骤）
- **Normal**：Step 1 (Analysis) → Translate
- **Refined**：Step 1 (Analysis) → Step 2 (Draft) → Step 3 (Review) → Step 4 (Revision) → Step 5 (Polish)
- **Normal → Upgrade**：normal mode 后，用户可继续 Step 3 → Step 4 → Step 5

所有中间结果都保存为输出目录中的文件。

## Step 1: 内容分析

翻译前先分析 source material。将分析保存到输出目录的 `01-analysis.md`。

### 1.1 内容摘要

- 这份内容讲什么？核心论点是什么？
- 作者背景、立场和写作语境
- 原文目的和预期受众

### 1.2 Terminology

- 列出技术术语、proper nouns、品牌名、缩写
- 与已加载 glossaries 交叉检查
- 对 glossary 中没有的术语，确定标准译法
- 记录到 terminology table

### 1.3 Tone & Style

- 正式还是对话式？是否有幽默、metaphor、文化引用？
- 基于目标受众，译文应使用什么语域？

### 1.4 Translation Challenges

识别可能造成翻译困难的内容：

- **Comprehension gaps**：目标读者可能不理解的术语或引用，说明需要什么解释
- **Figurative language**：metaphor、idiom、无法直译的表达，说明原意和目标语言处理方式（解释 / 替换 / 保留）
- **Structural challenges**：长复杂句、文字游戏、双关或需要创造性改写的幽默

**保存 `01-analysis.md`**，格式如下：
```
## Content Summary
[Core argument, author, context, purpose]

## Terminology
[term → translation, ...]

## Tone & Style
[assessment]

## Translation Challenges
- [term/passage] → [challenge type] → [suggested approach]
- ...
```

## Step 2: 组装 Translation Prompt

Main agent 读取 `01-analysis.md`，并使用 [references/subagent-prompt-template.md](subagent-prompt-template.md) 组装完整 translation prompt。从分析中内联以下内容：

- **Target style**：已解析的 style preset + §1.3 中的 source voice 评估
- **Content background**：§1.1 的摘要
- **Glossary**：merged glossary，以及 §1.2 分析提取的术语
- **Translation challenges**：§1.4 的所有 challenges

保存到 `02-prompt.md`。此 prompt 由 subagent（chunked）或 main agent 自己（non-chunked）使用。

## Step 3: 初稿

保存到输出目录中的 `03-draft.md`。

对于 chunked content，由 subagent 产出此 draft（由 chunk translations 合并）。对于 non-chunked content，由 main agent 直接产出。

遵循 `02-prompt.md` 翻译完整内容。应用 SKILL.md 中所有 **Translation principles**。

## Step 4: Critical Review

Main agent 对照 source 批判性审阅 draft。将 review findings 保存到 `04-critique.md`。此步骤只产出**诊断**，暂不重写。

### 4.1 Accuracy

- 逐段对照原文
- 核对事实、数字、日期、proper nouns
- 标记意外添加、删除或改变的内容
- 检查术语是否与 glossary 一致

### 4.2 Native Voice

- 标记读起来像“翻译出来”而不是“写出来”的句子：不自然语序、calques、生硬措辞
- 对 CJK 目标语言：检查不必要连接词（因此/然而/此外）、被动语态滥用（被/由/受到）、名词堆叠、过度名词化
- 标记直译后在目标语言中不自然的 metaphors
- 检查情感含义是否保留，而不是被抹平
- 记录哪些地方通过句子重组可提升可读性

### 4.3 Notes & Adaptation

- translator's notes 是否准确、简洁，并真正有帮助？
- 标记遗漏的、需要 notes 的 comprehension challenges，以及明显术语上的过度注释
- 是否遵循 `02-prompt.md` 中的 translation strategies？
- 文化引用在目标语言中是否成立？

**保存 `04-critique.md`**，格式如下：
```
## Accuracy
- [issue]: [location] — [description]

## Native Voice
- [issue]: [example] → [suggested fix]

## Notes & Adaptation
- [add/remove/revise]: [term/passage] — [reason]

## Summary
[Overall assessment: X critical issues, Y improvements]
```

## Step 5: Revision

应用 `04-critique.md` 中的所有 findings，产出修订译文。保存到 `05-revision.md`。

读取 `03-draft.md` 和 `04-critique.md`，修正所有准确性问题，重写不自然表达，调整 notes，并改善流畅度。

## Step 6: Polish

将最终版本保存到 `translation.md`。

对 `05-revision.md` 做最终出版级检查：

- 把整篇译文作为独立作品阅读，是否像母语内容一样流畅？
- 打磨剩余生硬转场
- 确保叙事 voice 和 style 全文一致
- 做最终术语一致性检查
- 确认格式正确保留

## Subagent 责任

每个 subagent（每个 chunk 一个）**只负责**产出其 chunk 的初稿（Step 3）。Main agent 组装 shared prompt（Step 2），并行启动所有 subagents，然后接管 critical review（Step 4）、revision（Step 5）和 polish（Step 6）。

## Chunked Refined Translation

当内容超过 chunk threshold 且使用 refined mode 时：

1. Main agent 先对**整篇**文档运行 analysis（Step 1）→ `01-analysis.md`
2. Main agent 组装 translation prompt → `02-prompt.md`
3. 切分为 chunks → `chunks/`
4. 每个 chunk 并行启动一个 subagent（每个都读取 `02-prompt.md` 获取 shared context）→ 将所有结果合并到 `03-draft.md`
5. Main agent 批判性审阅合并后的 draft → `04-critique.md`
6. Main agent 基于 critique 修订 → `05-revision.md`
7. Main agent 润色 → `translation.md`
8. 最终 cross-chunk 一致性检查：术语、叙事流、chunk 边界处的过渡
