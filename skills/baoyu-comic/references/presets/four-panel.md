# four-panel

四格漫画预设 - 极简 four-panel 商业寓言 comics

## Base Configuration

| 维度 | 值 |
|-----------|-------|
| Art Style | minimalist |
| Tone | neutral |
| Layout | four-panel (default) |
| Aspect | 4:3 (landscape) |

等价于：`--art minimalist --tone neutral --layout four-panel --aspect 4:3`

## Unique Rules

此 preset 包含超出 art+tone 组合的特殊规则。使用 `--style four-panel` 时，必须应用下方所有规则。

### 起承转合 Narrative Structure (CRITICAL)

每部 comic 都必须遵循 four-panel 起承转合结构：

| Panel | 角色 | 要求 |
|-------|------|-------------|
| 1 (起 Setup) | 引入情境 | 展示可识别语境中的角色。建立“正常”状态或问题 |
| 2 (承 Development) | 承接 setup | 增加复杂性，展示尝试，或引入概念。利害关系更清晰 |
| 3 (转 Turn) | 转折或关键洞察 | **最重要的 panel。** 展示让寓言成立的意外反转、对比或 "aha" moment |
| 4 (合 Conclusion) | 解决与 takeaway | 展示结果、后果或学到的经验。可以是视觉 punchline 或总结 |

**关键**：不要偏离精确 4 panels。图片内不要第 5 格，不要标题 panel，不要 footer panel。

### Single-Page Story Rule (CRITICAL)

- 整个故事在一页内讲完，且精确 4 panels
- 页数：始终为 1（可加可选封面）
- 不要 multi-page four-panel stories；如果内容需要更多篇幅，创建多个独立 four-panel comics
- Storyboard 结构：Cover（可选）+ 1 page

### Accent Color System

- 图片主要是黑白 line art
- 每条 strip 精确使用 1-2 个 spot colors（默认：orange `#FF6B35`）
- 规则：
  - 关键概念标签或对象：用 accent color 填充或描边
  - Panel 3（转 Turn）应有最强色彩强调
  - 角色保持 B&W，颜色只用于概念/对象/标签
  - 4 个 panels 中保持一致 accent color（不要在 panels 之间切换颜色）

### Character Design Rules

- 简化的火柴人式角色
- 通过简单道具区分角色：领带、眼镜、帽子、公文包、围裙
- 无详细面部，最多点眼和线条嘴
- 角色应足够通用，以代表 archetypes（经理、员工、客户）
- 每条 strip 最多 2-3 个角色

### Text in Panels

- 对话和标签使用中文（或匹配源语言）
- 文本保持极简，每个 panel 最多 1-2 行短句
- 关键概念词可用 accent color 背景高亮
- 不使用 narrator boxes，只使用 dialogue 和 labels
- Speech bubbles：简单矩形或椭圆，细黑描边

### Optional Title & Caption

- 4 个 panels 上方可有简短描述性标题
- panels 下方可有可选单行 caption/moral
- 它们是页面构图的一部分，不是独立 panels

### Character Archetypes (Flexible)

基于内容创建简单火柴人角色。没有固定默认角色：

| 角色 | Archetype | 视觉线索 |
|------|-----------|------------|
| Protagonist | 面对情境的工作者/员工 | 简单人物，极少区分特征（眼镜、领带） |
| Authority | 老板/经理/专家 | 略大人物，或带教鞭/夹板等道具 |
| Object | 概念本身 | 带标签对象、图标，或用 accent color 高亮的文本 |

### Prompt Template

为 four-panel comics 生成 image prompts 时，包含这些关键词：

> A minimalist, clean line art digital comic strip in a four-panel grid layout (2×2). The style is simplified cartoon illustration with clear black outlines and a minimal color palette of black, white, and specific spot [accent color] for key concepts.

每个 panel 描述应说明：
- Panel 位置（Top Left / Top Right / Bottom Left / Bottom Right）
- 角色姿势和手势（简单、stick-figure style）
- 中文对话文本（hand-drawn style）
- 任何 accent-colored elements（概念标签、关键对象）

## Quality Markers

- ✓ 严格 2×2 grid，精确 4 panels
- ✓ 起承转合 narrative arc 清晰存在
- ✓ 90%+ 黑白，并策略性使用 spot color
- ✓ 简化火柴人角色
- ✓ 关键概念用 accent color 视觉高亮
- ✓ 文本极简且为中文（或源语言）
- ✓ 一页内完成单个完整故事
- ✓ Panel 3 提供清晰 "turn" 或 insight

## Best For

商业寓言、管理寓言、短洞察、职场寓言、概念对比、社交媒体教育内容、快速阅读 comics
