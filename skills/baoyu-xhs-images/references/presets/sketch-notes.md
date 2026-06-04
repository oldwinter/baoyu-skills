---
name: sketch-notes
category: educational
default_palette: macaron
---

# Sketch Notes Style

手绘教育信息图，带轻微 line wobble，像高质量 presentation visual summary。

## Element Combination

```yaml
canvas:
  ratio: portrait-3-4
  grid: single | dual

image_effects:
  cutout: stylized
  stroke: none
  filter: none

typography:
  decorated: handwritten
  tags: rounded-badge
  direction: horizontal

decorations:
  emphasis: underline | circle-mark | arrows-curvy | star-burst
  background: paper-texture
  doodles: hand-drawn-lines | stars-sparkles | arrows-curvy | squiggles
  frames: rounded-rect
```

## Color Palette

Default：**macaron** palette（见 `palettes/macaron.md`）

未指定 `--palette` 时，使用 macaron colors：warm cream background (#F5F0E8)、macaron blue/lavender/mint/peach zone blocks、coral red accent。

## Visual Elements

- 所有 lines 和 shapes 都有手绘 wobble
- 简单 stick-figure characters：坐在桌前、工作、思考
- 用 pastel color blocks 作为信息 sections 的圆角 cards
- Color fills 不完全填满 outlines（hand-painted feel）
- Doodle decorations：小 stars、underlines、checkmarks、lock icons、clipboard icons
- 波浪手绘 arrows 连接 zones，并带小 text labels
- Thought bubbles 和 speech bubbles 使用 sketchy outlines
- 简单 conceptual icons（documents、lightbulbs、gears、arrows）
- Zones 之间留白充足，保持干净构图

## Typography

- Titles 使用粗体 hand-drawn lettering（大、醒目）
- Content zones 内使用粗体 keywords
- Secondary text color 中使用较小 annotations
- 所有文字都有 hand-drawn quality，不使用 computer-generated fonts
- 清晰信息层级：title > zone labels > body text > annotations

## Style Rules

### Do

- 每条线、形状和边框都保持轻微 wobble
- 使用 palette block colors 作为清晰 section backgrounds
- 让色块边缘有意不完全填满
- 包含与内容相关的简单 doodle icons
- Zones 之间保持充足留白
- Accent color 少量用于 key terms 强调
- 用手绘波浪感绘制 connecting arrows

### Don't

- 使用完美几何形或直线
- 创建 photorealistic elements
- 让颜色完全填满到边缘（保留 hand-painted gap）
- 使用深色或高饱和 backgrounds
- 用太多装饰元素造成拥挤
- 使用 gradient fills 或 glossy effects

## Best Layout Pairings

| Layout | Compatibility | Use Case |
|--------|---------------|----------|
| sparse | ✓ | 单一区域的简单 covers |
| balanced | ✓✓ | 标准教育总结 |
| dense | ✓✓ | Knowledge cards、concept maps |
| list | ✓✓ | Step-by-step guides、checklists |
| comparison | ✓ | 并排概念对比 |
| flow | ✓✓ | Process diagrams、workflows、tutorials |
| mindmap | ✓✓ | Concept maps、radial knowledge maps |
| quadrant | ✓ | Classification matrices |

## Best For

- Educational content、tutorials、how-to guides
- Process 和 workflow 解释
- Knowledge summaries、concept diagrams
- 让技术解释更亲近
- Articles 或 talks 的 visual summaries
- Onboarding materials、friendly guides
