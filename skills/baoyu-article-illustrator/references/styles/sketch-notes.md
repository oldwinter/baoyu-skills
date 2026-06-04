# sketch-notes

手绘教育信息图风格，使用暖奶油纸张、黑色手绘线条和柔和 pastel section blocks。针对单页 visual explainers 优化。

## Design Aesthetic

干净 presentation 风格的手绘教育信息图。感觉像一张 visual explainer slide：简单、友好、一眼易懂。顶部是粗体手写风格标题，中间用圆角 boxes 和小 doodles 清楚分区，底部是一句简短 takeaway。整洁、有空气感，视觉上类似手绘概念图，绝不写实或摄影化。

## Background

- Color: Warm Cream Paper (#F5F0E8) — 首选；fallback Warm Off-White (#FAF8F0)
- Texture: 细微暖纸纹理，哑光，无 gloss

## Color Palette

默认 sketch-notes palette 是 **macaron** pastel set。线条始终为黑色；pastel blocks 只作为信息 section 的圆角 card fills。

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Warm Cream | #F5F0E8 | Paper background |
| Primary Ink | Black | #1A1A1A | 所有 outlines、text、arrows、doodles |
| Block Blue | Light Blue | #A8D8EA | Info block fill（cool / tech） |
| Block Mint | Mint Green | #B5E5CF | Info block fill（growth / positive） |
| Block Lavender | Lavender | #D5C6E0 | Info block fill（concept / abstract） |
| Block Peach | Peach | #FFD5C2 | Info block fill（warm / human） |
| Accent | Coral Red | #E8655A | 只用于一两个 emphasis points |
| Muted Text | Warm Gray | #6B6B6B | 小 annotations |

每张图最多使用 **4 种 pastel block colors**，每个 section 一种颜色。结构线条全部由黑色墨线完成。

## Visual Elements

- 顶部粗体 hand-lettered title（偏大、轻微晃动）
- 带清楚分区的圆角矩形 info boxes（2–6 zones）
- Boxes 内只放短 keyword labels，绝不用长段落
- 用于解释每个想法的简单 icons 和 sketchy cartoon elements（stick figures、工具、物体）
- 连接相关 zones 的手绘 arrows（直线、曲线或波浪）
- 小 doodle decorations：stars、sparkles、underlines、dots、asterisks，只少量用于强调
- 底部一句单行 hand-lettered takeaway
- 色块不完全填满轮廓（轻微 "hand-painted" overshoot/undershoot）
- Sections 之间留白充足，有空气感，绝不拥挤

## Layout Guidelines

Canonical single-page layout（16:9 或 4:3）：

1. **Top (10–15%)** — 粗体 hand-lettered title，可带小装饰下划线或 doodle。
2. **Middle (70–80%)** — 2–6 个圆角 pastel info boxes，排列为清晰 grid、row 或 radial pattern。每个 box = 一个 section、一种颜色、一个 icon、一个 keyword/phrase。
3. **Bottom (10–15%)** — 一句简短 hand-lettered takeaway，总结 core insight。

保持充足 margins。每个元素周围都要有 breathing room。

## Style Rules

### Do

- 使用暖奶油纸张背景（不要纯白）
- 所有结构元素使用黑色手绘线条
- 使用柔和 pastel blocks（blue / mint / lavender / peach）作为 section fills
- 文字只保留短 keywords 和 phrases
- 顶部包含粗体手写标题
- 底部包含简短 takeaway sentence
- 使用 diagram-style visuals（icons、doodles、simple shapes）
- 允许轻微 wobble，手绘不完美正是此风格重点
- 用圆角 boxes 保持清晰分区

### Don't

- 使用纯白背景（那是 `ink-notes` 的领域）
- 渲染写实或摄影图像；此 style 只适合 diagram
- 用 gradients、shadows 或 digital effects 填充 zones
- 使用长段文字，只用 keywords
- 使用 computer-generated / sans-serif body fonts；所有文字必须 hand-lettered
- 每张图使用超过 4 种 pastel block colors
- 让画布过度拥挤；保持 airy 和 minimal
- 使用完美几何形；保留手绘 wobble

## Type Compatibility

| Type | Rating | Notes |
|------|--------|-------|
| infographic | ✓✓ | **最佳适配** — 单页 visual explainers、concept summaries、educational slides |
| framework | ✓✓ | Labeled zones 和 connectors 效果好 |
| flowchart | ✓✓ | 圆角 step boxes + 波浪 arrows |
| comparison | ✓✓ | 两个 pastel blocks 并排；严格 Before/After 对比优先用 `ink-notes` |
| timeline | ✓ | 手绘水平 arrow + milestone cards |
| scene | ✗ | 不推荐，过于 diagrammatic |

## Best For

Educational content、knowledge sharing、concept explainers、tutorials、onboarding materials、product walkthroughs、single-page visual summaries、"how things work" posts、友好的技术文章
