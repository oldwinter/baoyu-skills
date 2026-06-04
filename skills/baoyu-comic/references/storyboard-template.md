# Storyboard Template

## Storyboard Document Format

```markdown
---
title: "[Comic Title]"
topic: "[topic description]"
time_span: "[e.g., 1912-1954]"
narrative_approach: "[chronological/thematic/character-focused]"
recommended_style: "[style name]"
recommended_layout: "[layout name or varies]"
aspect_ratio: "3:4"    # 3:4 (portrait), 4:3 (landscape), 16:9 (widescreen)
language: "[zh/en/ja/etc.]"
page_count: [N]
generated: "YYYY-MM-DD HH:mm"
---

# [Comic Title] - Knowledge Comic Storyboard

**Character Reference**: characters/characters.png

---

## Cover

**Filename**: 00-cover-[slug].png
**Core Message**: [one-liner]

**Visual Design**:
- Title typography style
- Main visual composition
- Color scheme
- Subtitle / time span notation

**Visual Prompt**:
[详细 image generation prompt]

---

## Page 1 / N

**Filename**: 01-page-[slug].png
**Layout**: [standard/cinematic/dense/splash/mixed]
**Narrative Layer**: [Main narrative / Narrator layer / Mixed]
**Core Message**: [此页传达什么]

### Panel Layout

**Panel Count**: X
**Layout Type**: [grid/irregular/splash]

#### Panel 1 (Size: 1/3 page, Position: Top)

**Scene**: [时间、地点]
**Image Description**:
- Camera angle: [bird's eye / low angle / eye level / close-up / wide shot]
- Characters: [姿势、表情、动作]
- Environment: [场景细节、时代标记]
- Lighting: [氛围描述]
- Color tone: [palette reference]

**Text Elements**:
- Dialogue bubble (oval): "Character line"
- Narrator box (rectangular): 「Narrator commentary」
- Caption bar: [Background info text]

#### Panel 2...

**Page Hook**: [页尾 cliffhanger 或 transition]

**Visual Prompt**:
[完整 page image generation prompt]

---

## Page 2 / N
...
```

## Cover Design Principles

- 具有学术分量，同时保持视觉吸引力
- 标题 typography 体现 knowledge/science theme
- 构图暗示 core theme（character silhouette、iconic symbol、concept diagram）
- 使用 subtitle 或 time span 呈现史诗感范围

## Panel Composition Guidelines

| Panel Type | Recommended Count | Usage |
|-----------|-------------------|-------|
| Main narrative | 每页 3-5 个 | Story progression |
| Concept diagram | 每页 1-2 个 | 可视化抽象概念 |
| Narrator panel | 每页 0-1 个 | Commentary、transition |
| Splash (full/half) | 偶尔使用 | 重大时刻 |

## Panel Size Reference

- **Full page (Splash)**：重大时刻、关键突破
- **Half page**：重要场景、turning points
- **1/3 page**：标准 narrative panels
- **1/4 or smaller**：快速推进、连续动作

## Concept Visualization Techniques

将 abstract concepts 转成 concrete visuals：

| Abstract Concept | Visual Approach |
|-----------------|-----------------|
| Neural network | 发光节点和连接线 |
| Gradient descent | 球沿山谷地形滚下 |
| Data flow | 发光粒子流过管道 |
| Algorithm iteration | 向上盘旋的楼梯 |
| Breakthrough moment | 破碎屏障、穿透光线 |
| Logical proof | 积木组装 |
| Uncertainty | 分叉路径、雾、多重影子 |

## Text Element Design

| Text Type | Style | Usage |
|-----------|-------|-------|
| Character dialogue | Oval speech bubble | 主叙事对白 |
| Narrator commentary | Rectangular box | 解释、评论 |
| Caption bar | Edge-mounted rectangle | 时间、地点信息 |
| Thought bubble | Cloud shape | 角色内心独白 |
| Term label | Bold / special color | 技术术语首次出现 |

## Prompt Structure for Consistency

每个 page prompt 都应包含 character reference：

```text
[CHARACTER REFERENCE]
（本页出现角色在 characters.md 中的关键细节）

[PAGE CONTENT]
（具体场景、panel layout 和 visual elements）

[CONSISTENCY REMINDER]
Maintain exact character appearances as defined in character reference.
- [Character A]: [key identifying features]
- [Character B]: [key identifying features]
```
