# Style Reference

## Core Styles

用于快速选择的简化 style 层：

| Core Style | Maps To | Best For |
|------------|---------|----------|
| `hand-drawn` | sketch-notes | **默认。** 暖奶油纸张、黑色手绘线条、pastel 色块 — 教育信息图、概念解释、onboarding、通用知识文章 |
| `vector` | vector-illustration | 知识文章、教程、技术内容 |
| `minimal-flat` | notion | 通用内容、知识分享、SaaS |
| `sci-fi` | blueprint | AI、前沿技术、system design |
| `editorial` | editorial | 流程、数据、新闻报道 |
| `scene` | warm/watercolor | 叙事、情绪、生活方式 |
| `poster` | screen-print | 观点、评论、文化、电影感 |

大多数情况下使用 Core Styles。**如果没有检测到强内容信号，默认使用 `hand-drawn`（→ sketch-notes）。** 需要更细控制时再看下方完整 Style Gallery。

---

## Style Gallery

| Style | Description | Best For |
|-------|-------------|----------|
| `vector-illustration` | 干净 flat vector art，形状大胆 | 知识文章、教程、技术内容 |
| `notion` | 极简手绘线稿 | 知识分享、SaaS、生产力 |
| `elegant` | 精致、成熟 | 商业、思想领导力 |
| `warm` | 友好、亲近 | 个人成长、生活方式、教育 |
| `minimal` | 极致干净、禅意 | 哲学、极简主义、核心概念 |
| `blueprint` | 技术示意图 | 架构、system design、engineering |
| `watercolor` | 柔和艺术感，自然温度 | 生活方式、旅行、创意 |
| `editorial` | 杂志式信息图 | 技术解释、新闻报道 |
| `scientific` | 学术化精确图解 | 生物、化学、技术研究 |
| `chalkboard` | 课堂黑板粉笔绘图风格 | 教育、教学、解释 |
| `fantasy-animation` | Ghibli/Disney-inspired 手绘感 | 故事书、魔法感、情绪化内容 |
| `flat` | 现代粗几何形状 | 现代数字内容、当代感 |
| `flat-doodle` | 可爱 flat 风格，粗轮廓 | 可爱、友好、亲近 |
| `intuition-machine` | 老纸张上的技术 briefing | 技术 briefings、学术内容 |
| `nature` | 有机 earthy illustration | 环境、wellness |
| `pixel-art` | 复古 8-bit 游戏美学 | 游戏、复古技术 |
| `playful` | 俏皮 pastel doodles | 有趣、轻松、教育 |
| `retro` | 80s/90s 霓虹几何 | 80s/90s 怀旧、强视觉 |
| `sketch` | 原始铅笔 notebook 风格 | 头脑风暴、创意探索 |
| `screen-print` | 粗 poster art，halftone textures，有限颜色 | 观点、评论、文化、电影感 |
| `sketch-notes` | 柔和手绘暖色笔记 | 教育、温暖笔记 |
| `ink-notes` | 纯白纸上黑墨线，少量语义强调色，hand-lettered（à la Mike Rohde's sketchnoting） | Before/After essays、tech manifestos、framework analogies |
| `vintage` | 老化羊皮纸历史感 | 历史、传统 |

完整规格：`references/styles/<style>.md`

## Type x Style Compatibility Matrix

| | sketch-notes | vector-illustration | notion | warm | minimal | blueprint | watercolor | elegant | editorial | scientific | screen-print |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| infographic | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓✓ | ✓ |
| scene | ✗ | ✓ | ✓ | ✓✓ | ✓ | ✗ | ✓✓ | ✓ | ✓ | ✗ | ✓✓ |
| flowchart | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✓✓ | ✗ | ✓ | ✓✓ | ✓ | ✗ |
| comparison | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓ | ✓ |
| framework | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✗ | ✓✓ | ✓ | ✓✓ | ✓ |
| timeline | ✓ | ✓ | ✓✓ | ✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓ |

✓✓ = 强烈推荐 | ✓ = 兼容 | ✗ = 不推荐

## Auto Selection by Type

当没有强 content signal 时，`sketch-notes` 是所有 diagrammatic type 的默认 primary。只有 Step 2 的内容分析给出明确方向（technical/data/narrative/opinion）时，才用其他 primary 覆盖。

| Type | Primary Style | Secondary Styles |
|------|---------------|------------------|
| infographic | sketch-notes | vector-illustration, notion, blueprint, editorial |
| scene | warm | watercolor, elegant |
| flowchart | sketch-notes | vector-illustration, notion, blueprint |
| comparison | sketch-notes | vector-illustration, notion, elegant |
| framework | sketch-notes | blueprint, vector-illustration, notion |
| timeline | elegant | sketch-notes, warm, editorial |

## Auto Selection by Content Signals

| Content Signals | Recommended Type | Recommended Style |
|-----------------|------------------|-------------------|
| **（无强信号 / 通用文章）** | **infographic** | **sketch-notes** |
| Knowledge, concept, tutorial, learning, guide, onboarding | infographic | sketch-notes, vector-illustration, notion |
| Productivity, SaaS, tool, app, software | infographic | sketch-notes, notion, vector-illustration |
| How-to, steps, workflow, process, tutorial | flowchart | sketch-notes, vector-illustration, notion |
| API, metrics, data, comparison, numbers | infographic | blueprint, vector-illustration |
| Tech, AI, programming, development, code | infographic | vector-illustration, blueprint, sketch-notes |
| Framework, model, architecture, principles | framework | blueprint, vector-illustration, sketch-notes |
| vs, pros/cons, before/after, alternatives | comparison | vector-illustration, notion, sketch-notes |
| Manifesto, mindset shift, workforce, OS, whiteboard, professional visual note | comparison / framework | ink-notes |
| Story, emotion, journey, experience, personal | scene | warm, watercolor |
| History, timeline, progress, evolution | timeline | elegant, warm |
| Business, professional, strategy, corporate | framework | elegant |
| Opinion, editorial, culture, philosophy, cinematic, dramatic, poster | scene | screen-print |
| Biology, chemistry, medical, scientific | infographic | scientific |
| Explainer, journalism, magazine, investigation | infographic | editorial |

## Style Characteristics by Type

### infographic + sketch-notes (default)

- 暖奶油纸张背景，黑色手绘线条带轻微晃动。
- 2–6 个圆角 pastel 信息框（light blue / mint / lavender / peach）。
- 顶部粗体手写标题。
- 短关键词标签、简单 icons、小 doodles（stars、underlines、sparkles）。
- 底部一句手写 takeaway。
- 空气感强、极简、diagram-style，绝不写实。
- 非常适合单页教育解释图和概念总结。

### infographic + vector-illustration

- 干净 flat vector shapes，粗几何形。
- 鲜明但和谐的 color palette。
- 通过 icons 和 labels 建立清楚视觉层级。
- 现代、专业、可读性高。
- 很适合知识文章和教程。

### flowchart + vector-illustration

- 粗箭头和 connectors。
- 带 icons 的清晰 step containers。
- 干净的进度流。
- 高对比度保证可读性。

### comparison + vector-illustration

- Split layout，视觉分隔清楚。
- 每一侧都有粗 iconography。
- 用颜色编码区分。
- 一眼可比较。

### framework + vector-illustration

- 几何 node representations。
- 清楚的层级结构。
- 粗连接线。
- 现代 system diagram 美学。

### infographic + blueprint

- 技术精确感、schematic lines。
- Grid-based layout，清楚 zones。
- Monospace labels，data-focused。
- 蓝/白配色。

### infographic + notion

- 手绘感、亲近。
- 柔和 icons、圆角元素。
- 中性色 palette、干净背景。
- 很适合 SaaS/productivity。

### scene + warm

- Golden hour lighting，温暖氛围。
- 柔和 gradients、自然纹理。
- 邀请感、个人感。
- 适合 storytelling。

### scene + watercolor

- 艺术绘画效果。
- 柔边、color bleeding。
- 梦幻、创意 mood。
- 最适合 lifestyle/travel。

### flowchart + notion

- 清楚 step indicators。
- 简单 arrow connections。
- 极少装饰。
- 聚焦流程清晰度。

### flowchart + blueprint

- 技术精确感。
- 详细 connection points。
- 工程美学。
- 用于复杂系统。

### comparison + elegant

- 精致 dividers。
- 平衡 typography。
- 专业外观。
- 商业对比。

### framework + blueprint

- 精确 node connections。
- 层级清楚。
- 系统架构感。
- 技术 frameworks。

### timeline + elegant

- 精致 markers。
- 精致 typography。
- 历史厚重感。
- 专业 presentations。

### timeline + warm

- 友好的进展感。
- 有机 flow。
- 个人旅程感。
- 成长叙事。

### scene + screen-print

- 粗 silhouettes、符号化构图。
- 2-5 种 flat colors，halftone textures。
- Figure-ground inversion（negative space 讲第二层故事）。
- 复古 poster 美学，概念化而非字面化。
- 适合观点文章和文化评论。

### comparison + screen-print

- Split duotone composition（每侧一种颜色）。
- 粗几何 dividers。
- 用符号 icon 代替细节渲染。
- 高对比、即时视觉冲击。

### framework + screen-print

- 带 stencil-cut edges 的几何 node representations。
- 有限 color coding（每个 concept level 一种颜色）。
- 干净的 silhouette-based iconography。
- Poster-style hierarchy，粗 typography。

---

## Palette Gallery

Palettes 会覆盖 style 的默认颜色。可以把任意 style 和任意 palette 组合：`--style vector-illustration --palette macaron`。

| Palette | Description | Best For |
|---------|-------------|----------|
| `macaron` | 暖奶油背景上的柔和 pastel 色块（blue, mint, lavender, peach） | 教育、知识、教程 |
| `warm` | 暖橙、terracotta、金黄、深棕 | 品牌、团队、产品、人文科技 |
| `neon` | 高饱和霓虹强调色，深色背景 | AI、未来感、赛博、实验性 |
| `mono-ink` | 纯白背景、黑墨线为主、少量语义强调色 | sketchnotes、manifestos、professional visual notes |
