---
name: first-time-setup
description: First-time setup flow for baoyu-translate preferences
---

# First-Time Setup

## 概览

找不到 EXTEND.md 时，引导用户完成 preference setup。

**阻塞操作**：此 setup 必须在任何翻译之前完成。不要：
- 开始翻译内容
- 询问文件或输出路径
- 进入任何 workflow steps

只询问此 setup flow 中的问题，保存 EXTEND.md，然后继续。

## Setup Flow

```
No EXTEND.md found
        |
        v
+---------------------+
| AskUserQuestion     |
| (all questions)     |
+---------------------+
        |
        v
+---------------------+
| Create EXTEND.md    |
+---------------------+
        |
        v
    Continue translation
```

## 问题

**语言**：使用用户输入语言或已保存的语言偏好。

使用 AskUserQuestion 在一次调用中提出所有问题：

### Question 1: Target Language

```yaml
header: "Target Language"
question: "Default target language?"
options:
  - label: "简体中文 zh-CN (Recommended)"
    description: "Translate to Simplified Chinese"
  - label: "繁體中文 zh-TW"
    description: "Translate to Traditional Chinese"
  - label: "English en"
    description: "Translate to English"
  - label: "日本語 ja"
    description: "Translate to Japanese"
```

注意：用户可以输入自定义语言代码。

### Question 2: Translation Mode

```yaml
header: "Mode"
question: "Default translation mode?"
options:
  - label: "Normal (Recommended)"
    description: "Analyze content first, then translate"
  - label: "Quick"
    description: "Direct translation, no analysis"
  - label: "Refined"
    description: "Full workflow: analyze → translate → review → polish"
```

### Question 3: Target Audience

```yaml
header: "Audience"
question: "Default target audience?"
options:
  - label: "General readers (Recommended)"
    description: "Plain language, more translator's notes for jargon"
  - label: "Technical"
    description: "Developers/engineers, less annotation on tech terms"
  - label: "Academic"
    description: "Formal register, precise terminology"
  - label: "Business"
    description: "Business-friendly tone, explain tech concepts"
```

注意：用户可以输入自定义 audience 描述。

### Question 4: Translation Style

```yaml
header: "Style"
question: "Translation style?"
options:
  - label: "Storytelling (Recommended)"
    description: "Engaging narrative flow, smooth transitions"
  - label: "Formal"
    description: "Professional, structured, neutral tone"
  - label: "Technical"
    description: "Precise, documentation-style, concise"
  - label: "Literal"
    description: "Close to original structure"
  - label: "Academic"
    description: "Scholarly, rigorous, formal register"
  - label: "Business"
    description: "Concise, results-focused, action-oriented"
  - label: "Humorous"
    description: "Preserves humor, witty, playful"
  - label: "Conversational"
    description: "Casual, friendly, spoken-like"
  - label: "Elegant"
    description: "Literary, polished, aesthetically refined"
```

注意：用户可以输入自定义 style 描述。

### Question 5: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "User (Recommended)"
    description: "$HOME/.baoyu-skills/ (all projects)"
  - label: "Project"
    description: ".baoyu-skills/ (this project only)"
```

## 保存位置

| 选项 | Path | Scope |
|--------|------|-------|
| User | `$HOME/.baoyu-skills/baoyu-translate/EXTEND.md` | All projects |
| Project | `.baoyu-skills/baoyu-translate/EXTEND.md` | Current project |

## Setup 后

1. 如有需要，创建目录
2. 用所选值写入 EXTEND.md
3. 确认："Preferences saved to [path]"
4. 提醒："You can add custom glossary terms to EXTEND.md anytime. See the `glossary` section in the file for the format."
5. 使用已保存 preferences 继续翻译

## EXTEND.md Template

```yaml
target_language: [zh-CN/zh-TW/en/ja/...]
default_mode: [quick/normal/refined]
audience: [general/technical/academic/business/custom]
style: [storytelling/formal/technical/literal/academic/business/humorous/conversational/elegant]

# Custom glossary (optional) — 在这里添加你自己的术语翻译
# glossary:
#   - from: "Term"
#     to: "翻译"
#   - from: "Another Term"
#     to: "另一个翻译"
#     note: "Usage context"
```

## 之后修改 Preferences

用户可直接编辑 EXTEND.md，或删除它以再次触发 setup。
