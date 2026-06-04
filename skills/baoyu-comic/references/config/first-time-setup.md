---
name: first-time-setup
description: baoyu-comic 偏好的首次设置流程
---

# 首次设置

## 概述

当找不到 EXTEND.md 时，引导用户完成偏好设置。

**⛔ 阻塞操作**：必须先完成此设置，才能执行任何其他 workflow 步骤。不要：
- 询问内容或源材料
- 询问 art style 或 tone
- 询问 layout 偏好
- 进入内容分析

只询问本设置流程中的问题，保存 EXTEND.md，然后继续。

## 设置流程

```
No EXTEND.md found
        │
        ▼
┌─────────────────────┐
│ AskUserQuestion     │
│ (all questions)     │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Create EXTEND.md    │
└─────────────────────┘
        │
        ▼
    Continue to Step 1
```

## 问题

**Language**：所有问题都使用用户的输入语言或偏好语言。不要总是使用 English。

使用一次包含多个问题的 AskUserQuestion（AskUserQuestion 会自动添加 "Other" 选项）：

### 问题 1：Watermark

```
header: "Watermark"
question: "Watermark text for generated comic pages? Type your watermark content (e.g., name, @handle)"
options:
  - label: "No watermark (Recommended)"
    description: "No watermark, can enable later in EXTEND.md"
```

位置默认为 bottom-right。

### 问题 2：Preferred Art Style

```
header: "Art"
question: "Default art style preference? Or type another style name"
options:
  - label: "Auto-select (Recommended)"
    description: "Auto-select based on content analysis"
  - label: "ligne-claire"
    description: "Uniform lines, flat colors, European comic (Tintin style)"
  - label: "manga"
    description: "Japanese manga style, expressive eyes and emotions"
  - label: "realistic"
    description: "Digital painting, sophisticated and professional"
```

### 问题 3：Preferred Tone

```
header: "Tone"
question: "Default tone/mood preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Auto-select based on content signals"
  - label: "neutral"
    description: "Balanced, rational, educational"
  - label: "warm"
    description: "Nostalgic, personal, comforting"
  - label: "dramatic"
    description: "High contrast, intense, powerful"
```

### 问题 4：Language

```
header: "Language"
question: "Output language for comic text?"
options:
  - label: "Auto-detect (Recommended)"
    description: "Match source content language"
  - label: "zh"
    description: "Chinese (中文)"
  - label: "en"
    description: "English"
```

### 问题 5：Save Location

```
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

## 保存位置

| 选择 | 路径 | 范围 |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-comic/EXTEND.md` | 当前 project |
| User | `~/.baoyu-skills/baoyu-comic/EXTEND.md` | 所有 projects |

## 设置后

1. 按需创建目录
2. 写入带 frontmatter 的 EXTEND.md
3. 确认："Preferences saved to [path]"
4. 继续 Step 1

## EXTEND.md 模板

```yaml
---
version: 2
watermark:
  enabled: [true/false]
  content: "[user input or empty]"
  position: bottom-right
  opacity: 0.5
preferred_art: [selected art style or null]
preferred_tone: [selected tone or null]
preferred_layout: null
preferred_aspect: null
language: [selected or null]
preferred_image_backend: auto
generation_batch_size: 4
character_presets: []
---
```

`preferred_image_backend: auto` 是内置默认值，首次设置不会询问它。随后 SKILL.md 中的 `## Image Generation Tools` 规则会在可用时选择 runtime-native tool（Codex `imagegen`、Hermes `image_generate` 等），并在需要时 fallback 到已安装的 backends。

`generation_batch_size: 4` 是页面批量渲染的内置默认值。当前用户请求可以对单次运行覆盖它。

## 后续修改偏好

常见修改（固定 backend、修改默认值、重新触发设置）的 canonical 清单见 `SKILL.md` 的 `## Changing Preferences` 章节。完整 schema：`config/preferences-schema.md`。
