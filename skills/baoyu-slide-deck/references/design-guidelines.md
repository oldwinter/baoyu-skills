# Design Guidelines

Slide deck 的详细设计原则。

## Audience Guidelines

设计决策要适配 target audience。使用 `--audience` 设置。

| Audience | Content Density | Visual Style | Terminology | Slides |
|----------|-----------------|--------------|-------------|--------|
| `beginners` | Low | 友好、插画化 | Plain language | 8-15 |
| `intermediate` | Medium | 平衡、结构化 | 可有少量 jargon | 10-20 |
| `experts` | High | 数据丰富、精确 | Technical terms | 12-25 |
| `executives` | Low-Medium | 干净、有冲击力 | Business language | 8-12 |
| `general` | Medium | 易懂、有吸引力 | 最少 jargon | 10-18 |

### Audience → Density Mapping

基于 audience 推荐 density dimension：

| Audience | Recommended Density | Rationale |
|----------|-------------------|-----------|
| `executives` | minimal | 每页一个 insight，尊重时间 |
| `beginners` | minimal → balanced | 单一概念，逐步建立理解 |
| `general` | balanced | 易懂但信息充分 |
| `intermediate` | balanced | 标准信息密度 |
| `experts` | balanced → dense | 能承受每页更多数据 |

**Automatic Density Selection**：

- 如果 `--audience executives` → 默认 `minimal` density
- 如果 `--audience beginners` → 默认 `minimal` 或 `balanced`
- 如果 `--audience experts` → 允许 `dense` density
- 否则 → 默认 `balanced`

### Audience-Specific Principles

**Beginners**：

- 每页一个概念
- 多用视觉隐喻，少用抽象 diagrams
- Step-by-step progression
- 留白充足

**Experts**：

- 每页可以有多个 data points
- 技术 diagrams 使用精确 labels
- 假定具备 domain knowledge
- 信息可以密集，但必须组织清楚

**Executives**：

- 先给 insights，不先堆 data
- 每张 slide 都要回答 "So what?"
- 内容要支持 decision-making
- Bottom-line upfront (BLUF)

## Visual Hierarchy Principles

| Principle | Description |
|-----------|-------------|
| Focal Point | 每张 slide 只有一个 dominant element 先吸引注意 |
| Rule of Thirds | 将关键元素放在 grid intersections |
| Z-Pattern | 引导视线：top-left → top-right → bottom-left → bottom-right |
| Size Contrast | Headlines 比 body text 大 2-3 倍 |
| Breathing Room | 距所有边缘至少 10% margin |

## Content Density

完整 density dimension specs 见 `references/dimensions/density.md`。

| Level | Description | Use When |
|-------|-------------|----------|
| High | 多个 data points、详细 charts、密集文本 | Expert audience、technical reviews |
| Medium | 关键点 + 支撑细节 | General business、混合 audiences |
| Low | 一个主想法、大视觉、最少文字 | Beginners、keynotes、情绪冲击 |

**High-Density Principles**（McKinsey-style）：

- 每个元素都必须值得占据空间
- Data 比 decoration 更有说服力
- Annotations 解释 insights，而不是复述 data
- White space 是策略，不是填充物

**Density by Slide Type**：

| Slide Type | Recommended Density |
|------------|-------------------|
| Cover/Title | minimal |
| Agenda/Overview | balanced |
| Content/Analysis | balanced or dense |
| Data/Metrics | dense |
| Quote/Impact | minimal |
| Summary/Takeaway | balanced |

## Color Selection

完整 mood dimension specs 见 `references/dimensions/mood.md`。

**Content-First Approach**：

1. 分析 content topic、mood 和 industry
2. 考虑 target audience expectations
3. 将 palette 匹配到 subject matter
4. 确保强对比，保证可读性

**Quick Palette Guide**：

| Content Type | Recommended Mood |
|--------------|-----------------|
| Technical/Architecture | cool |
| Educational/Friendly | warm |
| Corporate/Professional | professional |
| Creative/Artistic | vibrant |
| Scientific/Medical | cool or neutral |
| Entertainment/Gaming | dark or vibrant |

## Typography Principles

完整 typography dimension specs 见 `references/dimensions/typography.md`。

| Element | Treatment |
|---------|-----------|
| Headlines | Bold，body size 的 2-3 倍，narrative style |
| Body Text | Regular weight，可读字号 |
| Captions | 更小、更轻 |
| Data Labels | 技术内容使用 monospace |
| Emphasis | 使用 bold 或 color，不用 underlines |

## Font Recommendations

**English Fonts**：

| Font | Style | Best For |
|------|-------|----------|
| Liter | Sans-serif, geometric | Modern, clean, technical |
| HedvigLettersSans | Sans-serif, distinctive | Brand-forward, creative |
| Oranienbaum | High-contrast serif | Elegant, classical |
| SortsMillGoudy | Classical serif | Traditional, readable |
| Coda | Round sans-serif | Friendly, approachable |

**Chinese Fonts**：

| Font | Style | Best For |
|------|-------|----------|
| MiSans | Modern sans-serif | Clean, versatile, screen-optimized |
| Noto Sans SC | Neutral sans-serif | Standard, multilingual |
| siyuanSongti | Refined Song typeface | Elegant, editorial |
| alimamashuheiti | Geometric sans-serif | Commercial, structured |
| LXGW Bright | Song-Kai hybrid | Warm, readable |

**Multilingual Pairing**：

| Use Case | English | Chinese |
|----------|---------|---------|
| Technical | Liter | MiSans |
| Editorial | Oranienbaum | siyuanSongti |
| Friendly | Coda | LXGW Bright |
| Corporate | HedvigLettersSans | alimamashuheiti |

## Visual Elements Reference

完整 texture dimension specs 见 `references/dimensions/texture.md`。

### Background Treatments

| Treatment | Description | Best For |
|-----------|-------------|----------|
| Solid color | 单一背景色 | Clean, minimal |
| Split background | 两种颜色，斜切或垂直 | Contrast, sections |
| Gradient | 细微垂直或斜向 fade | Modern, dynamic |
| Textured | Pattern 或 texture overlay | Character, style |

### Typography Treatments

| Treatment | Description | Best For |
|-----------|-------------|----------|
| Size contrast | Headline vs body 相差 3-4 倍 | Impact, hierarchy |
| All-caps headers | Uppercase + letter spacing | Authority, structure |
| Monospace data | 数字/code 使用 fixed-width | Technical, precision |
| Hand-drawn | Organic、不完美 letterforms | Friendly, approachable |

### Geometric Accents

| Element | Description | Best For |
|---------|-------------|----------|
| Diagonal dividers | 倾斜 section separators | Energy, movement |
| Corner brackets | L-shaped frames | Focus, framing |
| Circles/hexagons | 图片的 shape frames | Modern, tech |
| Underline accents | Headers 下方粗线 | Emphasis, hierarchy |

## Consistency Requirements

| Element | Guideline |
|---------|-----------|
| Spacing | 全 deck margins 和 padding 保持一致 |
| Colors | 每张 slide 最多 3-4 种颜色，palette 全 deck 一致 |
| Typography | 相同内容类型使用相同 font families 和 sizes |
| Visual Language | 重复使用 patterns、shapes 和 treatments |

## Dimension Combination Guide

组合 dimensions 时考虑兼容性：

| Audience | Recommended Dimensions |
|----------|----------------------|
| Executives | clean + neutral + geometric + minimal |
| Beginners | organic + warm + humanist + minimal |
| General | any texture + any mood + humanist/geometric + balanced |
| Experts | grid/clean + cool + technical + balanced/dense |

| Content Type | Recommended Dimensions |
|--------------|----------------------|
| Tutorial | organic + warm + handwritten + balanced |
| Technical | grid + cool + technical + balanced |
| Business | clean + professional + geometric + balanced |
| Creative | organic + vibrant + humanist + balanced |
| Data-heavy | clean + cool + technical + dense |
