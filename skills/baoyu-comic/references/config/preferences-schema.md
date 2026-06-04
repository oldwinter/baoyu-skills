---
name: preferences-schema
description: baoyu-comic 用户偏好的 EXTEND.md YAML schema
---

# Preferences Schema

## 完整 Schema

```yaml
---
version: 2

watermark:
  enabled: false
  content: ""
  position: bottom-right  # bottom-right|bottom-left|bottom-center|top-right

preferred_art: null       # ligne-claire|manga|realistic|ink-brush|chalk|minimalist
preferred_tone: null      # neutral|warm|dramatic|romantic|energetic|vintage|action
preferred_layout: null    # standard|cinematic|dense|splash|mixed|webtoon|four-panel
preferred_aspect: null    # 3:4|4:3|16:9

language: null            # zh|en|ja|ko|auto

preferred_image_backend: auto  # auto|ask|<backend-id>

generation_batch_size: 4       # 1-8, used when backend/runtime supports batch or parallel page generation

character_presets:
  - name: my-characters
    roles:
      learner: "Name"
      mentor: "Name"
      challenge: "Name"
      support: "Name"
---
```

## 字段参考

| 字段 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------------|
| `version` | int | 2 | Schema 版本 |
| `watermark.enabled` | bool | false | 启用 watermark |
| `watermark.content` | string | "" | Watermark 文本（@username 或 custom） |
| `watermark.position` | enum | bottom-right | 图片上的位置 |
| `preferred_art` | string | null | Art style（ligne-claire、manga、realistic、ink-brush、chalk、minimalist） |
| `preferred_tone` | string | null | Tone（neutral、warm、dramatic、romantic、energetic、vintage、action） |
| `preferred_layout` | string | null | Layout 偏好，或 null |
| `preferred_aspect` | string | null | Aspect ratio（3:4、4:3、16:9） |
| `language` | string | null | 输出语言（null = auto-detect） |
| `preferred_image_backend` | string | `auto` | Image backend 选择。`auto` = 优先 runtime-native tool，fallback 到唯一 installed backend，多个 non-native 时询问。`ask` = 每次运行都确认。`<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`image_generate`）= 该 backend 可用时固定使用，不可用时 fallback 到 `auto`。Absent = `auto`。Resolution logic 见 `SKILL.md` 的 `## Image Generation Tools` section。 |
| `generation_batch_size` | int | 4 | 当 backend 支持原生 batch，或 runtime 可发起并行生成调用时，每批派发的页面图片数量。无效值限制到 1-8。当前用户请求会覆盖此值。 |
| `character_presets` | array | [] | ohmsha 等风格使用的预设角色分工 |

## Art Style 选项

| 值 | 中文 | 说明 |
|-------|------|-------------|
| `ligne-claire` | 清线 | 统一线条、平涂色彩、欧洲漫画传统 |
| `manga` | 日漫 | 大眼睛、manga 惯例、情绪表现力强 |
| `realistic` | 写实 | Digital painting，真实比例 |
| `ink-brush` | 水墨 | 中国笔触、ink wash 效果 |
| `chalk` | 粉笔 | Blackboard 美学，手绘温度 |
| `minimalist` | 极简 | 干净黑色线稿、有限 spot color、火柴人角色 |

## Tone 选项

| 值 | 中文 | 说明 |
|-------|------|-------------|
| `neutral` | 中性 | 平衡、理性、教育感 |
| `warm` | 温馨 | 怀旧、个人化、有安慰感 |
| `dramatic` | 戏剧 | 高对比、强烈、有力量 |
| `romantic` | 浪漫 | 柔和、美丽、装饰元素 |
| `energetic` | 活力 | 明亮、动态、令人兴奋 |
| `vintage` | 复古 | 历史感、旧化、时代真实性 |
| `action` | 动作 | Speed lines、impact effects、战斗感 |

## Position 选项

| 值 | 说明 |
|-------|-------------|
| `bottom-right` | 右下角（默认，适合大多数分镜布局） |
| `bottom-left` | 左下角 |
| `bottom-center` | 底部居中（适合 webtoon 竖向滚动） |
| `top-right` | 右上角（避免使用 - 会和页码冲突） |

## Character Preset 字段

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `name` | Yes | 唯一 preset identifier |
| `roles.learner` | No | 代表学习者/主角的角色 |
| `roles.mentor` | No | 代表老师/向导的角色 |
| `roles.challenge` | No | 代表障碍/反派的角色 |
| `roles.support` | No | 提供支持/comic relief 的角色 |

## 示例：最小偏好

```yaml
---
version: 2
watermark:
  enabled: true
  content: "@myusername"
preferred_art: ligne-claire
preferred_tone: neutral
---
```

## 示例：完整偏好

```yaml
---
version: 2
watermark:
  enabled: true
  content: "@comicstudio"
  position: bottom-right

preferred_art: manga
preferred_tone: neutral

preferred_layout: webtoon

preferred_aspect: "3:4"

language: zh

preferred_image_backend: codex-imagegen

generation_batch_size: 4

character_presets:
  - name: tech-tutorial
    roles:
      learner: "小明"
      mentor: "教授"
      challenge: "难题怪"
      support: "小助手"
  - name: doraemon
    roles:
      learner: "大雄"
      mentor: "哆啦A梦"
      challenge: "胖虎"
      support: "静香"
---
```

## 从 v1 迁移

如果你有包含 `preferred_style` 的 v1 preferences 文件，请按下面方式迁移：

| 旧 `preferred_style.name` | 新 `preferred_art` | 新 `preferred_tone` |
|---------------------------|---------------------|---------------------|
| classic | ligne-claire | neutral |
| dramatic | ligne-claire | dramatic |
| warm | ligne-claire | warm |
| sepia | realistic | vintage |
| vibrant | manga | energetic |
| ohmsha | manga | neutral |
| realistic | realistic | neutral |
| wuxia | ink-brush | action |
| shoujo | manga | romantic |
| chalkboard | chalk | neutral |
