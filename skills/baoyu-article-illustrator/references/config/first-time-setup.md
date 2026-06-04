---
name: first-time-setup
description: baoyu-article-illustrator preferences 的首次设置流程
---

# First-Time Setup

## Overview

当没有找到 EXTEND.md 时，引导用户完成偏好设置。

**⛔ BLOCKING OPERATION**：此设置必须在任何其他 workflow 步骤前完成。不要：

- 询问参考图
- 询问内容/文章
- 询问 type 或 style 偏好
- 进入内容分析

只询问本设置流程里的问题，保存 EXTEND.md，然后继续。

## Setup Flow

```text
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

## Questions

**Language**：所有问题使用用户输入语言或偏好语言。不要总是使用英文。

用一次 AskUserQuestion 提交多个问题（AskUserQuestion 会自动添加 "Other" option）：

### Question 1: Watermark

```text
header: "Watermark"
question: "生成配图的 watermark text？请输入 watermark 内容（例如姓名、@handle）"
options:
  - label: "No watermark (Recommended)"
    description: "不加 watermark，之后可在 EXTEND.md 中启用"
```

位置默认 bottom-right。

### Question 2: Preferred Style

```text
header: "Style"
question: "默认配图 style 偏好？也可以输入其他 style 名或你的 custom style"
options:
  - label: "sketch-notes (Recommended)"
    description: "暖奶油纸张、黑色手绘线条、柔和 pastel 色块 — 教育信息图感觉。适合大多数文章的好默认值。"
  - label: "None"
    description: "根据内容分析自动选择（无强信号时回退到 sketch-notes）"
  - label: "notion"
    description: "极简手绘线稿"
  - label: "warm"
    description: "友好、亲近、个人化"
```

### Question 3: Output Directory

```text
header: "Output Directory"
question: "为文件配图时，生成的插图保存在哪里？"
options:
  - label: "imgs-subdir (Recommended)"
    description: "{article-dir}/imgs/ — 图片保存在文章旁边的子目录"
  - label: "same-dir"
    description: "{article-dir}/ — 图片和文章文件放在一起"
  - label: "illustrations-subdir"
    description: "{article-dir}/illustrations/ — 单独的 illustrations 子目录"
  - label: "independent"
    description: "illustrations/{topic-slug}/ — cwd 下的独立目录"
```

### Question 4: Save Location

```text
header: "Save"
question: "偏好保存到哪里？"
options:
  - label: "Project"
    description: ".baoyu-skills/（仅此项目）"
  - label: "User"
    description: "~/.baoyu-skills/（所有项目）"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | All projects |

## After Setup

1. 按需创建目录。
2. 写入带 frontmatter 的 EXTEND.md。
3. 确认："Preferences saved to [path]"
4. 继续 Step 1。

## EXTEND.md Template

```yaml
---
version: 1
watermark:
  enabled: [true/false]
  content: "[user input or empty]"
  position: bottom-right
  opacity: 0.7
preferred_style:
  name: [selected style or null]
  description: ""
default_output_dir: imgs-subdir  # same-dir | imgs-subdir | illustrations-subdir | independent
language: null
preferred_image_backend: auto
generation_batch_size: 4
custom_styles: []
---
```

`preferred_image_backend: auto` 是内置默认值；first-time setup 不询问它。随后 `SKILL.md` 中的 `## Image Generation Tools` 规则会优先选择 runtime-native tool（Codex `imagegen`、Hermes `image_generate` 等），不可用时回退到已安装 backend。

`generation_batch_size: 4` 是 batch rendering 的内置默认值。当前用户请求可为单次运行覆盖它。

## Modifying Preferences Later

常见修改（固定 backend、修改默认值、重新触发 setup）的 canonical 列表见 `SKILL.md` 中的 `## Changing Preferences`。完整 schema：`preferences-schema.md`。
