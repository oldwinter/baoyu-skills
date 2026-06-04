---
name: first-time-setup
description: baoyu-cover-image preferences 的首次设置流程
---

# First-Time Setup

## Overview

当找不到 EXTEND.md 时，引导用户完成 preference setup。

**⛔ BLOCKING OPERATION**：任何其他 workflow steps 前必须完成该 setup。不要：

- 询问 reference images
- 询问 content/article
- 询问 dimensions（type、palette、rendering）
- 继续 content analysis

只询问本 setup flow 中的问题，保存 EXTEND.md，然后继续。

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

**Language**：使用用户输入语言或已保存 language preference。

使用 AskUserQuestion，并把所有问题放入 **一次调用**：

### Question 1：Watermark

```yaml
header: "Watermark"
question: "Watermark text for generated cover images?"
options:
  - label: "No watermark (Recommended)"
    description: "Clean covers, can enable later in EXTEND.md"
```

### Question 2：Preferred Type

```yaml
header: "Type"
question: "Default cover type preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Choose based on content analysis each time"
  - label: "hero"
    description: "Large visual impact - product launch, announcements"
  - label: "conceptual"
    description: "Concept visualization - technical, architecture"
```

### Question 3：Preferred Palette

```yaml
header: "Palette"
question: "Default color palette preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Choose based on content analysis each time"
  - label: "elegant"
    description: "Sophisticated - soft coral, muted teal, dusty rose"
  - label: "warm"
    description: "Friendly - orange, golden yellow, terracotta"
  - label: "cool"
    description: "Technical - engineering blue, navy, cyan"
```

### Question 4：Preferred Rendering

```yaml
header: "Rendering"
question: "Default rendering style preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Choose based on content analysis each time"
  - label: "hand-drawn"
    description: "Sketchy organic illustration with personal touch"
  - label: "flat-vector"
    description: "Clean modern vector with geometric shapes"
  - label: "digital"
    description: "Polished precise digital illustration"
```

### Question 5：Default Aspect Ratio

```yaml
header: "Aspect"
question: "Default aspect ratio for cover images?"
options:
  - label: "16:9 (Recommended)"
    description: "Standard widescreen - YouTube, presentations, versatile"
  - label: "2.35:1"
    description: "Cinematic widescreen - article headers, blog posts"
  - label: "1:1"
    description: "Square - Instagram, WeChat, social cards"
  - label: "3:4"
    description: "Portrait - Xiaohongshu, Pinterest, mobile content"
```

Note：更多 ratios（4:3、3:2）可在 generation 时选择。这里设置默认推荐项。

### Question 6：Default Output Directory

```yaml
header: "Output"
question: "Default output directory for cover images?"
options:
  - label: "Independent (Recommended)"
    description: "cover-image/{topic-slug}/ - separate from article"
  - label: "Same directory"
    description: "{article-dir}/ - alongside the article file"
  - label: "imgs subdirectory"
    description: "{article-dir}/imgs/ - images folder near article"
```

### Question 7：Quick Mode

```yaml
header: "Quick"
question: "Enable quick mode by default?"
options:
  - label: "No (Recommended)"
    description: "Confirm dimension choices each time"
  - label: "Yes"
    description: "Skip confirmation, use auto-selection"
```

### Question 8：Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-cover-image/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-cover-image/EXTEND.md` | All projects |

## After Setup

1. 如有需要，创建目录
2. 写入带 frontmatter 的 EXTEND.md
3. 确认："Preferences saved to [path]"
4. 继续 Step 1

## EXTEND.md Template

```yaml
---
version: 3
watermark:
  enabled: [true/false]
  content: "[user input or empty]"
  position: bottom-right
  opacity: 0.7
preferred_type: [selected type or null]
preferred_palette: [selected palette or null]
preferred_rendering: [selected rendering or null]
preferred_text: title-only
preferred_mood: balanced
default_aspect: [16:9/2.35:1/1:1/3:4]
default_output_dir: [independent/same-dir/imgs-subdir]
quick_mode: [true/false]
language: null
preferred_image_backend: auto
custom_palettes: []
---
```

`preferred_image_backend: auto` 是 baked-in default；first-time setup 不询问它。随后由 SKILL.md 中的 `## Image Generation Tools` rule 选择 runtime-native tool（Codex `imagegen`、Hermes `image_generate` 等），并 fallback 到已安装 backends。

## Modifying Preferences Later

Canonical common edits（pin backend、change defaults、retrigger setup）见 `SKILL.md` 的 `## Changing Preferences` section。完整 schema：`preferences-schema.md`。

**EXTEND.md Supports**：Watermark | Preferred type | Preferred palette | Preferred rendering | Preferred text | Preferred mood | Default aspect ratio | Default output directory | Quick mode | Image backend preference | Custom palette definitions | Language preference
