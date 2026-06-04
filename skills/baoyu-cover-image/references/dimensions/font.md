---
name: font-dimension
description: 封面图的 typography style 维度
---

# Font Dimension

控制 typography style 和字符气质。

## Values

| Font | Visual Style | Line Quality | Character |
|------|--------------|--------------|-----------|
| `clean` | Geometric sans-serif | Sharp, uniform | Modern, precise, neutral |
| `handwritten` | Hand-lettered, brush | Organic, varied | Warm, personal, friendly |
| `serif` | Classic serifs, elegant | Refined, structured | Editorial, authoritative |
| `display` | Bold, decorative | Heavy, expressive | Attention-grabbing, playful |

## Detail

### clean

现代、通用、中性气质 typography。

**Characteristics**：

- Geometric sans-serif letterforms
- 锐利、统一 line weight
- 干净边缘，无 flourishes
- 所有尺寸下高可读
- 最少个性，最大清晰度

**Use Cases**：

- Technical documentation
- Professional/corporate content
- Minimal design approaches
- Data-driven articles
- Modern brand aesthetics

**Prompt Hints**：

- Use clean geometric sans-serif typography
- Modern, minimal letterforms
- Sharp edges, uniform stroke weight
- High contrast against background

### handwritten

温暖、有机、带个人气质 typography。

**Characteristics**：

- Hand-lettered 或 brush style
- 有机、多变 line weight
- 自然不完美
- 亲近、人味
- 轻松但有意图

**Use Cases**：

- Personal stories
- Lifestyle content
- Wellness and self-improvement
- Creative tutorials
- Friendly brand voices

**Prompt Hints**：

- Use warm hand-lettered typography with organic brush strokes
- Friendly, personal feel
- Natural variation in stroke weight
- Approachable, human character

### serif

经典、优雅、带 editorial 权威感 typography。

**Characteristics**：

- Traditional serif letterforms
- 精致、结构化 strokes
- 优雅 proportions
- Timeless sophistication
- 正式、可信感

**Use Cases**：

- Editorial content
- Academic articles
- Luxury brand content
- Historical topics
- Literary pieces

**Prompt Hints**：

- Use elegant serif typography with refined letterforms
- Classic, editorial character
- Structured, proportional spacing
- Authoritative, sophisticated feel

### display

用于最大冲击力的大胆、装饰性 typography。

**Characteristics**：

- 厚重、有表现力 letterforms
- Decorative elements
- 强视觉存在感
- 俏皮或戏剧化 character
- 为 headlines 设计

**Use Cases**：

- Announcements
- Entertainment content
- Promotional materials
- Event marketing
- Gaming topics

**Prompt Hints**：

- Use bold decorative display typography
- Heavy, expressive headlines
- Strong visual impact
- Attention-grabbing character

## Default

`clean` — 通用，能与大多数 rendering styles 搭配。

## Rendering Compatibility

| Font × Rendering | flat-vector | hand-drawn | painterly | digital | pixel | chalk | screen-print |
|------------------|:-----------:|:----------:|:---------:|:-------:|:-----:|:-----:|:------------:|
| clean | ✓✓ | ✗ | ✗ | ✓✓ | ✓ | ✗ | ✓ |
| handwritten | ✓ | ✓✓ | ✓✓ | ✓ | ✗ | ✓✓ | ✗ |
| serif | ✓ | ✗ | ✓ | ✓✓ | ✗ | ✗ | ✓ |
| display | ✓✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓ | ✓✓ |

✓✓ = 强烈推荐 | ✓ = 兼容 | ✗ = 不推荐

## Type Compatibility

| Font × Type | hero | conceptual | typography | metaphor | scene | minimal |
|-------------|:----:|:----------:|:----------:|:--------:|:-----:|:-------:|
| clean | ✓ | ✓✓ | ✓✓ | ✓ | ✗ | ✓✓ |
| handwritten | ✓✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓ |
| serif | ✓ | ✓ | ✓✓ | ✓ | ✓ | ✓ |
| display | ✓✓ | ✓ | ✓✓ | ✓ | ✓ | ✗ |

## Palette Interaction

Font style 会适配 palette 特征：

| Palette Category | clean | handwritten | serif | display |
|------------------|-------|-------------|-------|---------|
| Warm (warm, earth, pastel) | 更柔和 weight | 自然适配 | Warm tones | 俏皮能量 |
| Cool (cool, mono, elegant) | 完美匹配 | 形成对比 | 经典搭配 | 大胆 statement |
| Dark (dark, vivid) | 高对比 | Glow effects | 戏剧化 | 最大冲击 |
| Vintage (retro) | 现代对比 | 怀旧适配 | 符合时代 | Retro headlines |
| Duotone (duotone) | 锐利对比 | 不推荐 | 戏剧化搭配 | 电影感冲击 |

## Auto Selection

省略 `--font` 时，按信号选择：

| Signals | Font |
|---------|------|
| Personal, lifestyle, human, warm, friendly, story | `handwritten` |
| Technical, professional, clean, modern, minimal, data | `clean` |
| Editorial, academic, luxury, classic, literary | `serif` |
| Announcement, entertainment, promotion, bold, event, gaming | `display` |

Default: `clean`
