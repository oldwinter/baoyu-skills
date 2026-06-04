---
name: preferences-schema
description: baoyu-article-illustrator 用户偏好的 EXTEND.md YAML schema
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

watermark:
  enabled: false
  content: ""
  position: bottom-right  # bottom-right|bottom-left|bottom-center|top-right

preferred_style:
  name: null              # Built-in or custom style name
  description: ""         # Override/notes

preferred_palette: null   # Built-in palette name (macaron|warm|neon) or null

language: null            # zh|en|ja|ko|auto

default_output_dir: null  # same-dir|illustrations-subdir|independent

preferred_image_backend: auto  # auto|ask|<backend-id>

generation_batch_size: 4       # 1-8, used when backend/runtime supports batch or parallel generation

custom_styles:
  - name: my-style
    description: "Style description"
    color_palette:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8", "#48CAE4"]
    visual_elements: "Clean lines, geometric shapes"
    typography: "Modern sans-serif"
    best_for: "Business, education"
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `watermark.enabled` | bool | false | 启用 watermark |
| `watermark.content` | string | "" | Watermark text（@username 或自定义内容） |
| `watermark.position` | enum | bottom-right | 图片上的位置 |
| `preferred_style.name` | string | null | Style name 或 null |
| `preferred_style.description` | string | "" | 自定义 notes/override |
| `preferred_palette` | string | null | Palette override（macaron、warm、neon 或 null） |
| `language` | string | null | 输出语言（null = auto-detect） |
| `default_output_dir` | enum | null | 输出目录偏好（null = 每次询问） |
| `preferred_image_backend` | string | `auto` | 图片 backend 选择。`auto` = 优先 runtime-native tool，回退到唯一已安装 backend，如存在多个非原生 backend 则询问。`ask` = 每次运行都确认。`<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`image_generate`）= 可用时固定此 backend，不可用时回退到 `auto`。缺省 = `auto`。解析逻辑见 `SKILL.md` 的 `## Image Generation Tools`。 |
| `generation_batch_size` | int | 4 | 当 backend 有原生 batch 支持或 runtime 可发起并行生成调用时，每批分发的图片数。无效值限制到 1-8。当前用户请求会覆盖此值。 |
| `custom_styles` | array | [] | 用户自定义 styles |

## Position Options

| Value | Description |
|-------|-------------|
| `bottom-right` | 右下角（默认，最常见） |
| `bottom-left` | 左下角 |
| `bottom-center` | 底部居中 |
| `top-right` | 右上角 |

## Output Directory Options

| Value | Description |
|-------|-------------|
| `same-dir` | 与文章同目录 |
| `illustrations-subdir` | `{article-dir}/illustrations/` 子目录 |
| `independent` | 工作目录中的 `illustrations/{topic-slug}/` |

## Custom Style Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | 唯一 style identifier（kebab-case） |
| `description` | Yes | 该 style 传达什么 |
| `color_palette.primary` | No | 主色（array） |
| `color_palette.background` | No | 背景色 |
| `color_palette.accents` | No | 强调色（array） |
| `visual_elements` | No | 装饰元素 |
| `typography` | No | 字体/lettering style |
| `best_for` | No | 推荐内容类型 |

## Example: Minimal Preferences

```yaml
---
version: 1
watermark:
  enabled: true
  content: "@myusername"
preferred_style:
  name: notion
---
```

## Example: Full Preferences

```yaml
---
version: 1
watermark:
  enabled: true
  content: "@myaccount"
  position: bottom-right

preferred_style:
  name: notion
  description: "Clean illustrations for tech articles"

language: zh

preferred_image_backend: codex-imagegen

generation_batch_size: 4

custom_styles:
  - name: corporate
    description: "Professional B2B style"
    color_palette:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8", "#48CAE4"]
    visual_elements: "Clean lines, subtle gradients, geometric shapes"
    typography: "Modern sans-serif, professional"
    best_for: "Business, SaaS, enterprise"
---
```
