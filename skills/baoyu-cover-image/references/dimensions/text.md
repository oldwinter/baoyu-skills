---
name: text-dimension
description: 封面图的文本密度维度
---

# Text Dimension

控制 cover images 上的 text density 和信息层级。

## Values

| Value | Title | Subtitle | Tags | Visual Area |
|-------|:-----:|:--------:|:----:|:-----------:|
| `none` | - | - | - | 100% |
| `title-only` | ✓ | - | - | 85% |
| `title-subtitle` | ✓ | ✓ | - | 75% |
| `text-rich` | ✓ | ✓ | ✓ (2-4) | 60% |

## Detail

### none

无 text elements 的纯视觉封面。

**Use Cases**：

- Photography-focused covers
- Abstract art pieces
- Visual-only social sharing
- 标题会在外部添加时

**Composition**：

- 完整 visual area 可用
- 不保留 text zones
- 强调 visual metaphor

### title-only

单一 headline，最大冲击。

**Use Cases**：

- 大多数 article covers（默认）
- 清晰单一信息
- 强 brand recognition

**Composition**：

- Title：醒目位置
- Reserved zone：顶部或底部 15%
- Visual 支撑 title message

**Title Guidelines**：

- 使用 source content 或用户提供的 exact title
- 不要发明或修改 titles
- 匹配内容语言

### title-subtitle

Title + supporting context。

**Use Cases**：

- 需要澄清的 technical articles
- 带 episode/part info 的 series
- 有双重信息的内容

**Composition**：

- Title：primary element
- Subtitle：secondary element
- Reserved zone：25%
- Title/subtitle 之间层级清楚

**Title Guidelines**：

- 使用 source content 或用户提供的 exact title
- 不要发明或修改 titles

**Subtitle Guidelines**：

- 澄清或 contextualize title
- 可包含 series name、author、date
- 比 title 更小、更不突出

### text-rich

带多个 text elements 的信息密集封面。

**Use Cases**：

- Infographic-style covers
- Event announcements with details
- Promotional material with features
- 有多个 key points 的内容

**Composition**：

- Title：primary focus
- Subtitle：supporting info
- Tags：2-4 个 keyword labels
- Reserved zone：40%
- 清晰 visual hierarchy

**Title Guidelines**：

- 使用 source content 或用户提供的 exact title
- 不要发明或修改 titles

**Tag Guidelines**：

- 最多 2-4 个 tags
- 短 keywords（每个 1-2 words）
- 作为 badges/labels 放置
- 可突出：category、date、author、key features

## Type Compatibility

| Type | none | title-only | title-subtitle | text-rich |
|------|:----:|:----------:|:--------------:|:---------:|
| hero | ✓ | ✓✓ | ✓✓ | ✓ |
| conceptual | ✓✓ | ✓✓ | ✓ | ✓ |
| typography | ✗ | ✓ | ✓✓ | ✓✓ |
| metaphor | ✓✓ | ✓ | ✓ | ✗ |
| scene | ✓✓ | ✓ | ✓ | ✗ |
| minimal | ✓✓ | ✓✓ | ✓ | ✗ |

✓✓ = 强烈推荐 | ✓ = 兼容 | ✗ = 不推荐

## Auto Selection

省略 `--text` 时，按信号选择：

| Signals | Text Level |
|---------|------------|
| Visual-only, photography, abstract, art | `none` |
| Article, blog, standard cover | `title-only` |
| Series, tutorial, technical with context | `title-subtitle` |
| Announcement, features, multiple points, infographic | `text-rich` |

Default: `title-only`
