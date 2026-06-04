---
name: first-time-setup
description: baoyu-infographic 偏好的首次设置流程
---

# 首次设置

## 概述

当找不到 EXTEND.md 时，在生成任何 infographic 前引导用户完成偏好设置。已保存 preferences 只会影响 Step-3 recommendations 和 Step-4 defaults，绝不会绕过 Step 4 confirmation（见 SKILL.md 中的 `## Confirmation Policy` 章节）。

**⛔ 阻塞操作**：必须先完成此设置，才能执行任何其他 workflow 步骤。不要：
- 询问 source content 或 topic
- 询问 layout、style 或 aspect
- 开始 Step 1.2 content analysis

只询问本设置流程中的问题，保存 EXTEND.md，然后继续 Step 1.2。

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
    Continue to Step 1.2
```

## 问题

**Language**：问题文本使用用户的输入语言。不要总是默认 English。

使用一次包含多个问题的 `AskUserQuestion`（runtime 会自动添加 "Other" 选项）：

### 问题 1：Preferred Layout

```
header: "Layout"
question: "Default layout preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Pick layout per content in Step 3"
  - label: "bento-grid"
    description: "Multiple topics, overview (general default)"
  - label: "linear-progression"
    description: "Timelines, processes, tutorials"
  - label: "dense-modules"
    description: "High-density modules, data-rich guides"
```

### 问题 2：Preferred Style

```
header: "Style"
question: "Default visual style preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Pick style per tone in Step 3"
  - label: "craft-handmade"
    description: "Hand-drawn, paper craft (general default)"
  - label: "corporate-memphis"
    description: "Flat vector, vibrant"
  - label: "morandi-journal"
    description: "Hand-drawn doodle, warm Morandi tones"
```

### 问题 3：Preferred Aspect

```
header: "Aspect"
question: "Default aspect ratio?"
options:
  - label: "Auto-select (Recommended)"
    description: "Pick per layout in Step 4"
  - label: "landscape"
    description: "16:9 (slides, blogs, web)"
  - label: "portrait"
    description: "9:16 (mobile, social, dense modules)"
  - label: "square"
    description: "1:1 (social, thumbnails)"
```

### 问题 4：Language

```
header: "Language"
question: "Output language for infographic text?"
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

| 选择 | Path | 范围 |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-infographic/EXTEND.md` | 当前 project |
| User | `~/.baoyu-skills/baoyu-infographic/EXTEND.md` | 所有 projects |

读取时也会识别 XDG path（`${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-infographic/EXTEND.md`），但 first-time setup 期间不将其作为保存目标提供。

## 设置后

1. 按需创建目录
2. 写入带 frontmatter 的 EXTEND.md（见下方模板）
3. 确认："Preferences saved to [path]"
4. 继续 Step 1.2

## EXTEND.md 模板

```yaml
---
version: 1
preferred_layout: [selected layout or null]
preferred_style: [selected style or null]
preferred_aspect: [landscape|portrait|square|null]
language: [selected language or null]
preferred_image_backend: auto
custom_styles: []
---
```

`preferred_image_backend: auto` 是内置默认值；first-time setup 永远不会询问它。随后 SKILL.md 中的 `## Image Generation Tools` 规则会在可用时选择 runtime-native tool（Codex `imagegen`、Hermes `image_generate` 等），并 fallback 到已安装 backends，如 `baoyu-image-gen`。

## 后续修改偏好

常见修改（固定 backend、修改 layout/style defaults、重新触发设置）的 canonical 清单见 `SKILL.md` 的 `## Changing Preferences` 章节。完整 schema：`references/config/preferences-schema.md`。
