# Confirmation Questions

Step 2 Smart Confirm 使用的具体选项文案。SKILL.md 说明何时询问哪个问题；本文件提供 Claude Code 中使用的逐字选项。其他 runtimes 应根据自己的 user-input tool 调整措辞，但保留意图。

## Step 2 — Smart Confirm Entry

自动推荐计划后立即展示的单问题确认。

```yaml
header: Mode
question: How to proceed with the recommended plan?
options:
  - label: 1. ✅ 确认，直接生成（推荐）
    description: Trust auto-recommendation and proceed immediately
  - label: 2. 🎛️ 自定义调整
    description: Modify strategy/style/layout/count in one step
  - label: 3. 📋 详细模式
    description: Generate 3 outline variants, then choose (two confirmations)
```

## Path B — Customize (Option 2)

批量询问这五个问题。字段留空则保留推荐值。

```yaml
header: Style/Strategy
question: "Strategy + style. Current: {strategy} + {style}"
hint: |
  Strategies: A Story-Driven (warm) | B Information-Dense (notion) | C Visual-First (screen-print)
  Styles: cute / fresh / warm / bold / minimal / retro / pop / notion / chalkboard / study-notes / screen-print / sketch-notes
  Presets: knowledge-card / checklist / tutorial / poster / hand-drawn-edu / ...
```

```yaml
header: Layout
question: "Layout. Current: {layout}"
options: [sparse, balanced, dense, list, comparison, flow, mindmap, quadrant]
```

```yaml
header: Palette
question: "Palette. Current: {palette or 默认}"
options: [默认, macaron, warm, neon]
```

```yaml
header: Count
question: "Image count. Current: {N}"
hint: Range 2-10
```

```yaml
header: Notes
question: Optional notes (selling-point emphasis, audience adjustment, color preference)
optional: true
```

## Path C — Detailed Mode

### Step 2a: Content Understanding

批量询问这些问题。

```yaml
header: SellingPoints
question: Core selling points (pick all that apply)
multiSelect: true
```

```yaml
header: Audience
question: Target audience
```

```yaml
header: Tone
question: Style preference
options:
  - label: Authentic sharing
  - label: Professional review
  - label: Aesthetic mood
  - label: Auto
```

```yaml
header: Context
question: Additional context (optional)
optional: true
```

### Step 2c: Outline & Style Selection

批量询问这三个问题。

```yaml
header: Strategy
question: Which outline strategy?
options:
  - label: A — Story-Driven
  - label: B — Information-Dense
  - label: C — Visual-First
  - label: Combine (specify pages from each)
```

```yaml
header: Style
question: Visual style?
options:
  - label: Use recommended
  - label: Select preset
  - label: Select style directly
  - label: Custom description
```

```yaml
header: Elements
question: Visual elements?
options:
  - label: Use defaults (Recommended)
  - label: Adjust background
  - label: Adjust decorations
  - label: Custom
```

## Outline Variant Frontmatter

Path C 写入三个 `outline-strategy-{a,b,c}.md` 文件时使用。每个 variant 都必须有不同结构和不同推荐 style，并包含 `style_reason` 解释该 style 为什么适合该 strategy。

```yaml
---
strategy: a  # a | b | c
name: Story-Driven
style: warm  # recommended style for this strategy
palette: ~   # optional: macaron | warm | neon | ~ (style default)
style_reason: "Warm tones enhance emotional storytelling and personal connection"
elements:
  background: solid-pastel
  decorations: [clouds, stars-sparkles]
  emphasis: star-burst
  typography: highlight
layout: balanced
image_count: 5
---

## P1 Cover
**Type**: cover
**Hook**: "入冬后脸不干了🥹终于找到对的面霜"
**Visual**: Product hero shot with cozy winter atmosphere
**Layout**: sparse

## P2 Problem
**Type**: pain-point
...
```

页数启发式：strategy A 通常 4-6 页，B 通常 3-5 页，C 通常 3-4 页。
