---
name: preferences-schema
description: baoyu-infographic 用户偏好的 EXTEND.md YAML schema
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

preferred_layout: null    # any of the 21 layouts (see Layout Gallery in SKILL.md) or null
preferred_style: null     # any of the 21 styles (see Style Gallery in SKILL.md) or null
preferred_aspect: null    # landscape|portrait|square|null  (custom W:H also accepted)

language: null            # zh|en|ja|ko|null (null = auto-detect from source)

preferred_image_backend: auto   # auto|ask|<backend-id>

custom_styles:            # extra style definitions merged with the 21 built-ins
  - name: my-brand
    description: "Short description shown in Step 3 recommendations"
    prompt_fragment: "Style traits to inject into Step 5 prompt"
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `preferred_layout` | string\|null | null | 预选 layout，会在 Step 3 中作为顶部推荐出现 |
| `preferred_style` | string\|null | null | 预选 style，会在 Step 3 中作为顶部推荐出现 |
| `preferred_aspect` | string\|null | null | Step 4 的默认 aspect（命名 preset 或 W:H 字符串） |
| `language` | string\|null | null | 输出语言（null = 从 source content 自动检测） |
| `preferred_image_backend` | string | `auto` | 图片 backend 选择。`auto` = 优先 runtime-native tool，回退到唯一已安装 backend，如存在多个非原生 backend 则询问。`ask` = 每次运行都确认。`<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`image_generate`）= 可用时固定此 backend，不可用时回退到 `auto`。缺省 = `auto`。 |
| `custom_styles` | array | [] | 除 21 个内置 styles 外额外可用的 styles |

Backend resolution logic 记录在 `SKILL.md` 的 `## Image Generation Tools` 部分。本文档只定义字段。

此 schema 中所有字段都只是默认值；它们影响 Step 3 推荐和 Step 4 默认值，但绝不会绕过 Step 4 confirmation（见 SKILL.md 中的 `## Confirmation Policy`）。

Example backend ids：

| Value | Meaning |
|-------|---------|
| `codex-imagegen` | Codex 内置 `imagegen` tool |
| `baoyu-image-gen` | `baoyu-image-gen` skill / script backend |
| `image_generate` | Hermes 等 generic runtime image tool |

## Layout Options

Canonical list 见 `SKILL.md` 中的 **Layout Gallery (21)** 表。常用选项：

| Value | Best For |
|-------|----------|
| `bento-grid` | 通用默认 — overview、多主题 |
| `linear-progression` | Timelines、processes、tutorials |
| `dense-modules` | 高密度 modules、data-rich guides |
| `hub-spoke` | 中心概念及相关项 |
| `dashboard` | Metrics、KPIs |

## Style Options

Canonical list 见 `SKILL.md` 中的 **Style Gallery (21)** 表。常用选项：

| Value | Description |
|-------|-------------|
| `craft-handmade` | 手绘、paper craft（默认） |
| `corporate-memphis` | Flat vector、鲜艳 |
| `morandi-journal` | Hand-drawn doodle、暖 Morandi tones |
| `pop-laboratory` | Blueprint grid、lab precision |
| `retro-pop-grid` | 1970s retro pop art、Swiss grid |

## Aspect Options

| Value | Ratio | Notes |
|-------|-------|-------|
| `landscape` | 16:9 | Slides、blog headers、web banners |
| `portrait` | 9:16 | Mobile、social、dense modules（`dense-modules` 默认） |
| `square` | 1:1 | Social posts、thumbnails |
| Custom W:H | e.g. `3:4`, `4:3`, `2.35:1` | 原样传入 prompt |

## Custom Style Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | 唯一 style identifier（kebab-case） |
| `description` | Yes | Step 3 recommendations 中显示的一行说明 |
| `prompt_fragment` | Yes | 追加到 Step 5 prompt body 的 style traits |

## Example: Minimal Preferences

```yaml
---
version: 1
preferred_layout: bento-grid
preferred_style: craft-handmade
language: zh
---
```

上方省略了 `preferred_image_backend`；缺省视为 `auto`。

## Example: Full Preferences

```yaml
---
version: 1

preferred_layout: dense-modules
preferred_style: morandi-journal
preferred_aspect: portrait

language: zh

preferred_image_backend: codex-imagegen

custom_styles:
  - name: my-brand
    description: "Brand-aligned warm pastel infographic"
    prompt_fragment: "Use brand pastel palette (#F2C7B6, #B6D7E8, #C8E0B4); rounded rectangles; warm hand-drawn outlines; ample whitespace."
---
```
