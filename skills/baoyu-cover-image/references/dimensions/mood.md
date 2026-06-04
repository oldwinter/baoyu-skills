---
name: mood-dimension
description: 封面图的情绪强度维度
---

# Mood Dimension

控制 cover images 的情绪强度和视觉重量。

## Values

| Value | Contrast | Saturation | Weight | Energy |
|-------|:--------:|:----------:|:------:|:------:|
| `subtle` | Low | Muted | Light | Calm |
| `balanced` | Medium | Normal | Medium | Moderate |
| `bold` | High | Vivid | Heavy | Dynamic |

## Detail

### subtle

平静、克制的视觉存在感。

**Characteristics**：

- 元素之间低对比
- 柔和、低饱和颜色
- 轻视觉重量
- 温和、精致美学
- 柔和边缘和过渡

**Use Cases**：

- Thought leadership content
- Professional/corporate communications
- Meditation、wellness topics
- Academic or scholarly articles
- Luxury brand aesthetics

**Color Guidance**：

- Pastels、earth tones、neutrals
- 低饱和（30-50%）
- 柔和 gradients
- 最少颜色变化（2-3 colors）

### balanced

通用、和谐的视觉存在感。

**Characteristics**：

- 中等对比
- 自然饱和度
- 平衡 visual weight
- 清楚但不激进
- 标准 aesthetic approach

**Use Cases**：

- General articles（默认）
- 大多数 blog content
- Educational material
- Product documentation
- News and updates

**Color Guidance**：

- 标准饱和度（50-70%）
- Complementary color schemes
- 清楚 foreground/background 分离
- 适中颜色变化（3-4 colors）

### bold

动态、高冲击的视觉存在感。

**Characteristics**：

- 元素之间高对比
- 鲜明、高饱和颜色
- 重视觉重量
- 有能量、吸引注意
- 锐利边缘和强形状

**Use Cases**：

- Product launches
- Promotional announcements
- Event marketing
- Call-to-action content
- Entertainment/gaming topics

**Color Guidance**：

- 高饱和（70-100%）
- Vibrant primary colors
- 强 contrast ratios
- 动态 color combinations（4+ colors）

## Type Compatibility

| Type | subtle | balanced | bold |
|------|:------:|:--------:|:----:|
| hero | ✓ | ✓✓ | ✓✓ |
| conceptual | ✓✓ | ✓✓ | ✓ |
| typography | ✓ | ✓✓ | ✓✓ |
| metaphor | ✓✓ | ✓✓ | ✓ |
| scene | ✓✓ | ✓✓ | ✓ |
| minimal | ✓✓ | ✓✓ | ✗ |

✓✓ = 强烈推荐 | ✓ = 兼容 | ✗ = 不推荐

## Palette Interaction

Mood 会调整 base palette 特征：

| Palette Category | subtle | balanced | bold |
|------------------|--------|----------|------|
| Warm palettes (warm, earth, pastel) | 更多 whitespace，更柔和 tones | 标准颜色 | 更深、更丰富的 warm tones |
| Cool palettes (cool, mono, elegant) | 更轻线条，muted colors | 标准颜色 | 更强对比，更锐利 definition |
| Dark palettes (dark, vivid) | 降低对比，柔和 glow | 标准颜色 | 最大冲击，鲜明饱和 |
| Vintage palettes (retro) | 更 faded，sepia-heavy | 标准颜色 | 更大胆 retro contrasts |
| Duotone palettes (duotone) | Pair 之间更柔和对比 | 标准双色 split | 最大对比，强烈分离 |

## Rendering Interaction

Mood 会调整 rendering 特征：

| Rendering | subtle | balanced | bold |
|-----------|--------|----------|------|
| flat-vector | 更细 strokes，更轻 fills | 标准 weight | 更粗 strokes，更强 fills |
| hand-drawn | 更轻 pencil pressure，更多空间 | 标准 strokes | 更重 marker strokes，更密 elements |
| painterly | 稀释 washes，更多白色 | 标准 brush | 更厚 paint，饱和 strokes |
| digital | 减少 shadows，降低对比 | 标准 rendering | 更强 shadows，更锐边缘 |
| pixel | 更少颜色，更简单 shapes | 标准 palette | 更多颜色，更密 pixel detail |
| chalk | 更轻 chalk，露出更多 board | 标准 chalk | 重 chalk，鲜明颜色，密集 marks |
| screen-print | 更少颜色（2），更轻 halftone | 标准 3-4 colors，中等 halftone | 更多颜色（4-5），密 halftone，更强 misregistration |

## Auto Selection

省略 `--mood` 时，按信号选择：

| Signals | Mood Level |
|---------|------------|
| Professional, corporate, thought leadership, academic, luxury | `subtle` |
| General, educational, standard, blog, documentation | `balanced` |
| Launch, announcement, promotion, event, gaming, entertainment | `bold` |

Default: `balanced`
