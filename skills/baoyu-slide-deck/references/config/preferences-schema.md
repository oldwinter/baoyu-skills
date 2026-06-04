# EXTEND.md Schema

`.baoyu-skills/baoyu-slide-deck/EXTEND.md` 中用户偏好的结构。

## Full Schema

```yaml
# Slide Deck Preferences

## Defaults
style: blueprint              # Preset name OR "custom"
audience: general             # beginners | intermediate | experts | executives | general
language: auto                # auto | en | zh | ja | etc.
review: true                  # true = review outline before generation
preferred_image_backend: auto # auto | ask | <backend-id>
generation_batch_size: 4      # 1-8, used when backend/runtime supports batch or parallel slide generation

## Custom Dimensions (only when style: custom)
dimensions:
  texture: clean              # clean | grid | organic | pixel | paper
  mood: professional          # professional | warm | cool | vibrant | dark | neutral
  typography: geometric       # geometric | humanist | handwritten | editorial | technical
  density: balanced           # minimal | balanced | dense

## Custom Styles (optional)
custom_styles:
  my-style:
    texture: organic
    mood: warm
    typography: humanist
    density: minimal
    description: "My custom warm and friendly style"
```

## Field Descriptions

### Defaults

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `style` | string | `blueprint` | Preset name、`custom` 或 custom style name |
| `audience` | string | `general` | 默认 target audience |
| `language` | string | `auto` | 输出语言（auto = 从输入检测） |
| `review` | boolean | `true` | 生成前展示 outline review |
| `preferred_image_backend` | string | `auto` | 图片 backend 选择。`auto` = 优先 runtime-native tool，回退到唯一已安装 backend，如存在多个非原生 backend 则询问。`ask` = 每次运行都确认。`<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`image_generate`）= 可用时固定此 backend，不可用时回退到 `auto`。缺省 = `auto`。解析逻辑见 `SKILL.md` 的 `## Image Generation Tools` 部分。 |
| `generation_batch_size` | int | 4 | 当 backend 有原生 batch 支持或 runtime 可发起并行生成调用时，每批分发的 slide images 数。无效值限制到 1-8。当前用户请求会覆盖此值。 |

### Custom Dimensions

仅当 `style: custom` 时使用。直接定义 dimension values。

| Field | Options | Default |
|-------|---------|---------|
| `texture` | clean, grid, organic, pixel, paper | clean |
| `mood` | professional, warm, cool, vibrant, dark, neutral | professional |
| `typography` | geometric, humanist, handwritten, editorial, technical | geometric |
| `density` | minimal, balanced, dense | balanced |

### Custom Styles

定义可复用的 custom dimension combinations。

```yaml
custom_styles:
  style-name:
    texture: <texture>
    mood: <mood>
    typography: <typography>
    density: <density>
    description: "Optional description"
```

然后这样使用：`/baoyu-slide-deck content.md --style style-name`

## Minimal Examples

### 只修改默认 style

```yaml
style: sketch-notes
```

### 偏好不 review

```yaml
review: false
```

### Custom default dimensions

```yaml
style: custom
dimensions:
  texture: organic
  mood: professional
  typography: humanist
  density: minimal
```

### 定义可复用 custom style

```yaml
custom_styles:
  brand-style:
    texture: clean
    mood: vibrant
    typography: editorial
    density: balanced
    description: "Company brand style"
```

## File Locations

优先级顺序（第一个找到的生效）：

1. `.baoyu-skills/baoyu-slide-deck/EXTEND.md` (project)
2. `$HOME/.baoyu-skills/baoyu-slide-deck/EXTEND.md` (user)

## First-Time Setup

当不存在 EXTEND.md 时，skill 会询问初始偏好：

1. Preferred style（preset 或 custom）
2. Default audience
3. Language preference
4. Review preference
5. Save location（project 或 user）

在所选位置创建 EXTEND.md。
