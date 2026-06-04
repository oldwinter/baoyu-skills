---
name: preferences-schema
description: baoyu-cover-image 用户偏好的 EXTEND.md YAML schema
---

# Preferences Schema

## 完整 Schema

```yaml
---
version: 3

watermark:
  enabled: false
  content: ""
  position: bottom-right  # bottom-right|bottom-left|bottom-center|top-right

preferred_type: null      # hero|conceptual|typography|metaphor|scene|minimal or null for auto-select

preferred_palette: null   # warm|elegant|cool|dark|earth|vivid|pastel|mono|retro|duotone|macaron or null for auto-select

preferred_rendering: null # flat-vector|hand-drawn|painterly|digital|pixel|chalk or null for auto-select

preferred_text: title-only  # none|title-only|title-subtitle|text-rich

preferred_mood: balanced    # subtle|balanced|bold

default_aspect: "2.35:1"  # 2.35:1|16:9|1:1

quick_mode: false         # Skip confirmation when true

language: null            # zh|en|ja|ko|auto (null = auto-detect)

preferred_image_backend: auto  # auto|ask|<backend-id>

custom_palettes:
  - name: my-palette
    description: "Palette description"
    colors:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8"]
    decorative_hints: "Clean lines, geometric shapes"
    best_for: "Business, tech content"
---
```

## 字段参考

| 字段 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------------|
| `version` | int | 3 | Schema 版本 |
| `watermark.enabled` | bool | false | 启用 watermark |
| `watermark.content` | string | "" | Watermark text（@username 或 custom） |
| `watermark.position` | enum | bottom-right | 图片上的位置 |
| `preferred_type` | string | null | Type name，或 null 表示自动选择 |
| `preferred_palette` | string | null | Palette name，或 null 表示自动选择 |
| `preferred_rendering` | string | null | Rendering name，或 null 表示自动选择 |
| `preferred_text` | string | title-only | Text density 级别 |
| `preferred_mood` | string | balanced | Mood intensity 级别 |
| `default_aspect` | string | "2.35:1" | 默认 aspect ratio |
| `quick_mode` | bool | false | 跳过 confirmation step |
| `language` | string | null | 输出语言（null = auto-detect） |
| `preferred_image_backend` | string | `auto` | Image backend selection。`auto` = 优先 runtime-native tool，fallback 到唯一 installed backend，多个 non-native 时询问。`ask` = 每次运行都确认。`<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`image_generate`）= 该 backend 可用时固定使用，不可用时 fallback 到 `auto`。Absent = `auto`。Resolution logic 见 `SKILL.md` 的 `## Image Generation Tools` section。 |
| `custom_palettes` | array | [] | 用户定义 palettes |

## Type 选项

| 值 | 说明 |
|-------|-------------|
| `hero` | 强视觉冲击，title overlay |
| `conceptual` | 概念可视化，抽象核心观点 |
| `typography` | 以文字为中心的 layout，突出 title |
| `metaphor` | Visual metaphor，用具象表达抽象 |
| `scene` | 有氛围的 scene，叙事感 |
| `minimal` | Minimalist composition，充足 whitespace |

## Palette 选项

| 值 | 说明 |
|-------|-------------|
| `warm` | Friendly、approachable：orange、golden yellow、terracotta |
| `elegant` | Sophisticated、refined：soft coral、muted teal、dusty rose |
| `cool` | Technical、professional：engineering blue、navy、cyan |
| `dark` | Cinematic、premium：electric purple、cyan、magenta |
| `earth` | Natural、organic：forest green、sage、earth brown |
| `vivid` | Energetic、bold：bright red、neon green、electric blue |
| `pastel` | Gentle、whimsical：soft pink、mint、lavender |
| `mono` | Clean、focused：black、near-black、white |
| `retro` | Nostalgic、vintage：muted orange、dusty pink、maroon |

## Rendering 选项

| 值 | 说明 |
|-------|-------------|
| `flat-vector` | Clean outlines、uniform fills、geometric icons |
| `hand-drawn` | Sketchy、organic、imperfect strokes、paper texture |
| `painterly` | Soft brush strokes、color bleeds、watercolor feel |
| `digital` | Polished、precise edges、subtle gradients、UI components |
| `pixel` | Pixel grid、dithering、chunky 8-bit shapes |
| `chalk` | Chalk strokes、dust effects、blackboard texture |

## Text 选项

| 值 | 说明 |
|-------|-------------|
| `none` | 纯视觉，无 text elements |
| `title-only` | 单个 headline |
| `title-subtitle` | Title + subtitle |
| `text-rich` | Title + subtitle + keyword tags（2-4） |

## Mood 选项

| 值 | 说明 |
|-------|-------------|
| `subtle` | 低 contrast、muted colors、平静美学 |
| `balanced` | 中等 contrast、正常 saturation、通用 |
| `bold` | 高 contrast、vivid colors、动态能量 |

## Position 选项

| 值 | 说明 |
|-------|-------------|
| `bottom-right` | 右下角（default，最常见） |
| `bottom-left` | 左下角 |
| `bottom-center` | 底部居中 |
| `top-right` | 右上角 |

## Aspect Ratio 选项

| 值 | 说明 | 最适合 |
|-------|-------------|----------|
| `2.35:1` | Cinematic widescreen | Article headers、blog covers |
| `16:9` | Standard widescreen | Presentations、video thumbnails |
| `1:1` | Square | Social media、profile images |

## Custom Palette 字段

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `name` | Yes | 唯一 palette identifier（kebab-case） |
| `description` | Yes | Palette 传达的感觉 |
| `colors.primary` | No | 主色（hex array） |
| `colors.background` | No | Background color（hex） |
| `colors.accents` | No | Accent colors（hex array） |
| `decorative_hints` | No | Decorative elements 和 patterns |
| `best_for` | No | 推荐内容类型 |

## 示例：最小偏好

```yaml
---
version: 3
watermark:
  enabled: true
  content: "@myhandle"
preferred_type: null
preferred_palette: elegant
preferred_rendering: hand-drawn
preferred_text: title-only
preferred_mood: balanced
quick_mode: false
---
```

## 示例：完整偏好

```yaml
---
version: 3
watermark:
  enabled: true
  content: "myblog.com"
  position: bottom-right

preferred_type: conceptual

preferred_palette: cool

preferred_rendering: digital

preferred_text: title-subtitle

preferred_mood: subtle

default_aspect: "16:9"

quick_mode: true

language: en

preferred_image_backend: codex-imagegen

custom_palettes:
  - name: corporate-tech
    description: "Professional B2B tech palette"
    colors:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8", "#48CAE4"]
    decorative_hints: "Clean lines, subtle gradients, circuit patterns"
    best_for: "SaaS, enterprise, technical"
---
```

## 从 v2 迁移

加载 v2 schema 时自动 upgrade：

| v2 字段 | v3 字段 | 迁移 |
|----------|----------|-----------|
| `version: 2` | `version: 3` | Update |
| `preferred_style` | `preferred_palette` + `preferred_rendering` | 使用 preset mapping table |
| `custom_styles` | `custom_palettes` | Rename，并重构 fields |

**Style → Palette + Rendering mapping**：

| v2 `preferred_style` | v3 `preferred_palette` | v3 `preferred_rendering` |
|----------------------|----------------------|-------------------------|
| `elegant` | `elegant` | `hand-drawn` |
| `blueprint` | `cool` | `digital` |
| `chalkboard` | `dark` | `chalk` |
| `dark-atmospheric` | `dark` | `digital` |
| `editorial-infographic` | `cool` | `digital` |
| `fantasy-animation` | `pastel` | `painterly` |
| `flat-doodle` | `pastel` | `flat-vector` |
| `intuition-machine` | `retro` | `digital` |
| `minimal` | `mono` | `flat-vector` |
| `nature` | `earth` | `hand-drawn` |
| `notion` | `mono` | `digital` |
| `pixel-art` | `vivid` | `pixel` |
| `playful` | `pastel` | `hand-drawn` |
| `retro` | `retro` | `digital` |
| `sketch-notes` | `warm` | `hand-drawn` |
| `vector-illustration` | `retro` | `flat-vector` |
| `vintage` | `retro` | `hand-drawn` |
| `warm` | `warm` | `hand-drawn` |
| `watercolor` | `earth` | `painterly` |
| null（auto） | null | null |

**Custom style 迁移**：

| v2 字段 | v3 字段 |
|----------|----------|
| `custom_styles[].name` | `custom_palettes[].name` |
| `custom_styles[].description` | `custom_palettes[].description` |
| `custom_styles[].color_palette` | `custom_palettes[].colors` |
| `custom_styles[].visual_elements` | `custom_palettes[].decorative_hints` |
| `custom_styles[].typography` | （已移除，由 rendering 决定） |
| `custom_styles[].best_for` | `custom_palettes[].best_for` |

## 从 v1 迁移

加载 v1 schema 时自动 upgrade 到 v3：

| v1 字段 | v3 字段 | 默认值 |
|----------|----------|---------------|
| (missing) | `version` | 3 |
| (missing) | `preferred_palette` | null |
| (missing) | `preferred_rendering` | null |
| (missing) | `preferred_text` | title-only |
| (missing) | `preferred_mood` | balanced |
| (missing) | `quick_mode` | false |

v1 `--no-title` flag 映射为 `preferred_text: none`。
