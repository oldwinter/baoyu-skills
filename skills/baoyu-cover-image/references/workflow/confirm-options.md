# Step 2: Confirm Options

## Purpose

验证全部 6 个 dimensions + aspect ratio。

## Skip Conditions

| Condition | Skipped Questions | Still Asked |
|-----------|-------------------|-------------|
| `--quick` flag | Type、Palette、Rendering、Text、Mood、Font | **Aspect Ratio**（除非指定了 `--aspect`） |
| All 6 dimensions + `--aspect` specified | All | None |
| EXTEND.md 中 `quick_mode: true` | Type、Palette、Rendering、Text、Mood、Font | **Aspect Ratio**（除非指定了 `--aspect`） |
| Otherwise | None | All 7 questions |

**Important**：除非通过 `--aspect` CLI flag 显式指定，Aspect ratio 总是要询问。EXTEND.md 中的 user presets 作为 recommended option 展示，而不是自动选择。

## Quick Mode Output

跳过 6 dimensions 时：

```text
Quick Mode: Auto-selected dimensions
• Type: [type] ([reason])
• Palette: [palette] ([reason])
• Rendering: [rendering] ([reason])
• Text: [text] ([reason])
• Mood: [mood] ([reason])
• Font: [font] ([reason])

[Then ask Question 7: Aspect Ratio]
```

## Confirmation Flow

**Language**：自动决定（用户输入语言 > saved preference > source language），无需询问。

在 **单次 AskUserQuestion call** 中展示所有 options（最多 4 个问题）。

跳过任何已经通过 CLI flag 或 `--style` preset 指定的 dimension。

### Q1：Type（如有 `--type` 则跳过）

```yaml
header: "Type"
question: "Which cover type?"
multiSelect: false
options:
  - label: "[auto-recommended type] (Recommended)"
    description: "[reason based on content signals]"
  - label: "hero"
    description: "Large visual impact, title overlay - product launch, announcements"
  - label: "conceptual"
    description: "Concept visualization - technical, architecture"
  - label: "typography"
    description: "Text-focused layout - opinions, quotes"
```

### Q2：Palette（如有 `--palette` 或 `--style` 则跳过）

```yaml
header: "Palette"
question: "Which color palette?"
multiSelect: false
options:
  - label: "[auto-recommended palette] (Recommended)"
    description: "[reason based on content signals]"
  - label: "warm"
    description: "Friendly - orange, golden yellow, terracotta"
  - label: "elegant"
    description: "Sophisticated - soft coral, muted teal, dusty rose"
  - label: "cool"
    description: "Technical - engineering blue, navy, cyan"
```

### Q3：Rendering（如有 `--rendering` 或 `--style` 则跳过）

展示 compatible renderings（compatibility matrix 中的 ✓✓ 优先）：

```yaml
header: "Rendering"
question: "Which rendering style?"
multiSelect: false
options:
  - label: "[best compatible rendering] (Recommended)"
    description: "[reason based on palette + type + content]"
  - label: "flat-vector"
    description: "Clean outlines, flat fills, geometric icons"
  - label: "hand-drawn"
    description: "Sketchy, organic, imperfect strokes"
  - label: "digital"
    description: "Polished, precise, subtle gradients"
```

### Q4：Font（如有 `--font` 则跳过）

```yaml
header: "Font"
question: "Which font style?"
multiSelect: false
options:
  - label: "[auto-recommended font] (Recommended)"
    description: "[reason based on content signals]"
  - label: "clean"
    description: "Modern geometric sans-serif - tech, professional"
  - label: "handwritten"
    description: "Warm hand-lettered - personal, friendly"
  - label: "serif"
    description: "Classic elegant - editorial, luxury"
  - label: "display"
    description: "Bold decorative - announcements, entertainment"
```

### Q5：Other Settings（如果所有剩余 dimensions 都已指定则跳过）

把剩余 settings 合并成一个问题。包含：Output Dir（无 preference + file path input 时）、Text、Mood、Aspect。把 auto-selected values 显示为 recommended option。用户可接受全部，或通过 "Other" 输入调整。

**需要询问 output dir 时**（无 `default_output_dir` preference + file path input）：

```yaml
header: "Settings"
question: "Output / Text / Mood / Aspect?"
multiSelect: false
options:
  - label: "imgs/ / [auto-text] / [auto-mood] / [preset-aspect] (Recommended)"
    description: "{article-dir}/imgs/, [text reason], [mood reason], [aspect source]"
  - label: "same-dir / [auto-text] / [auto-mood] / [preset-aspect]"
    description: "{article-dir}/, same directory as article"
  - label: "independent / [auto-text] / [auto-mood] / [preset-aspect]"
    description: "cover-image/{topic-slug}/, separate from article"
```

**Output dir 已设置时**（preference exists 或 pasted content）：

```yaml
header: "Settings"
question: "Text / Mood / Aspect?"
multiSelect: false
options:
  - label: "[auto-text] / [auto-mood] / [preset-aspect] (Recommended)"
    description: "Auto-selected: [text reason], [mood reason], [aspect source]"
  - label: "[auto-text] / bold / [preset-aspect]"
    description: "High contrast, vivid — matches [content signal]"
  - label: "[auto-text] / subtle / [preset-aspect]"
    description: "Low contrast, muted — calm, professional"
```

*Note*："Other"（auto-added）允许用户输入 custom combo。按 question format 解析 `/`-separated values。

## After Response

带着 confirmed dimensions 继续 Step 3。
