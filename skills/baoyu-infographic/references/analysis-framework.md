# Infographic Content Analysis Framework

将 instructional design 原则应用到信息图创建中的深度分析框架。

## Purpose

创建信息图前，彻底分析源材料，以便：

- 深入理解内容
- 为观看者识别清晰 learning objectives
- 以最大清晰度和记忆留存来组织信息
- 将内容匹配到最优 layout x style 组合
- 原样保留所有 source data

## Instructional Design Mindset

把内容分析当作**世界级 instructional designer** 来做：

| Principle | Application |
|-----------|-------------|
| **Deep Understanding** | 分析任何局部前，先阅读完整文档 |
| **Learner-Centered** | 聚焦观看者需要理解什么 |
| **Visual Storytelling** | 用视觉沟通，而不是只做装饰 |
| **Cognitive Load** | 在不损失准确性的前提下简化复杂想法 |
| **Data Integrity** | 永不改写、总结或意译 source facts |

## Analysis Dimensions

### 1. Content Type Classification

| Type | Characteristics | Best Layout | Best Style |
|------|-----------------|-------------|------------|
| **Timeline/History** | 顺序事件、日期、进展 | linear-progression | craft-handmade, aged-academia |
| **Process/Tutorial** | 分步说明、how-to | linear-progression, winding-roadmap | ikea-manual, technical-schematic |
| **Comparison** | A vs B、pros/cons、before-after | binary-comparison, comparison-matrix | corporate-memphis, bold-graphic |
| **Hierarchy** | 层级、优先级、金字塔 | hierarchical-layers, tree-branching | craft-handmade, corporate-memphis |
| **Relationships** | 连接、重叠、影响 | venn-diagram, hub-spoke, jigsaw | craft-handmade, subway-map |
| **Data/Metrics** | 统计、KPIs、测量值 | dashboard, periodic-table | corporate-memphis, technical-schematic |
| **Cycle/Loop** | 循环流程、feedback loops | circular-flow | craft-handmade, technical-schematic |
| **System/Structure** | 组件、架构、解剖结构 | structural-breakdown, bento-grid | technical-schematic, ikea-manual |
| **Journey/Narrative** | 故事、user flows、milestones | winding-roadmap, story-mountain | storybook-watercolor, comic-strip |
| **Overview/Summary** | 多主题、功能亮点 | bento-grid, periodic-table, dense-modules | chalkboard, bold-graphic |
| **Product/Buying Guide** | 多维对比、规格、坑点 | dense-modules | morandi-journal, pop-laboratory, retro-pop-grid, retro-popup-pop |

### 2. Learning Objective Identification

每张信息图应有 1-3 个清晰 learning objectives。

**好的 Learning Objectives**：

- 具体且可衡量
- 聚焦观看者会理解什么，而不是只看到什么
- 从观看者视角撰写

**Format**："After viewing this infographic, the viewer will understand..."

| Content Aspect | Objective Type |
|----------------|----------------|
| Core concept | "...what [topic] is and why it matters" |
| Process | "...how to [accomplish something]" |
| Comparison | "...the key differences between [A] and [B]" |
| Relationships | "...how [elements] connect to each other" |
| Data | "...the significance of [key statistics]" |

### 3. Audience Analysis

| Factor | Questions | Impact |
|--------|-----------|--------|
| **Knowledge Level** | 他们已经知道什么？ | 决定复杂度深度 |
| **Context** | 他们为什么看这张图？ | 决定强调点 |
| **Expectations** | 他们希望学到什么？ | 决定成功标准 |
| **Visual Preferences** | 专业、俏皮、技术感？ | 影响 style 选择 |

### 4. Complexity Assessment

| Level | Indicators | Layout Recommendation |
|-------|------------|----------------------|
| **Simple** (3-5 points) | 少量主要概念，关系清楚 | sparse layouts, single focus |
| **Moderate** (6-8 points) | 多个概念，一些关系 | balanced layouts, clear sections |
| **Complex** (9+ points) | 很多概念，关系复杂 | dense layouts, multiple sections |

### 5. Visual Opportunity Mapping

识别哪些内容可以被“展示”而不是“讲述”：

| Content Element | Visual Treatment |
|-----------------|------------------|
| Numbers/Statistics | 大号、高亮数字 |
| Comparisons | 并排、split screen |
| Processes | 箭头、编号步骤、flow |
| Hierarchies | 金字塔、层级、大小差异 |
| Relationships | 线条、连接、重叠形状 |
| Categories | 颜色编码、分组、sections |
| Timelines | 水平/垂直进展 |
| Quotes | Callout boxes、引号 |

### 6. Data Verbatim Extraction

**Critical**：所有事实信息必须严格按 source 原文保留。

| Data Type | Handling Rule |
|-----------|---------------|
| **Statistics** | 精确复制："73%"，不要写成 "about 70%" |
| **Quotes** | 逐字复制并保留 attribution |
| **Names** | 保留准确拼写 |
| **Dates** | 保留原始格式 |
| **Technical Terms** | 不要简化或替换 |
| **Lists** | 保留顺序和措辞 |

**Never**：

- 对数字取整
- 意译 quotes
- 替换成更简单的词
- 添加暗含信息
- 删除会影响含义的上下文

## Output Format

将分析结果保存到 `analysis.md`：

```yaml
---
title: "[Main topic title]"
topic: "[educational/technical/business/creative/etc.]"
data_type: "[timeline/hierarchy/comparison/process/etc.]"
complexity: "[simple/moderate/complex]"
point_count: [number of main points]
source_language: "[detected language]"
user_language: "[user's language]"
---

## Main Topic
[用 1-2 句话总结此内容主题]

## Learning Objectives
After viewing this infographic, the viewer should understand:
1. [Primary objective]
2. [Secondary objective]
3. [Tertiary objective if applicable]

## Target Audience
- **Knowledge Level**: [Beginner/Intermediate/Expert]
- **Context**: [他们为什么看这张图]
- **Expectations**: [他们希望学到什么]

## Content Type Analysis
- **Data Structure**: [信息自身如何关联]
- **Key Relationships**: [哪些内容彼此连接]
- **Visual Opportunities**: [哪些内容可以展示而不是讲述]

## Key Data Points (Verbatim)
[所有统计、引用和关键事实，严格按 source 原样记录]
- "[Exact data point 1]"
- "[Exact data point 2]"
- "[Exact quote with attribution]"

## Layout x Style Signals
- Content type: [type] → suggests [layout]
- Tone: [tone] → suggests [style]
- Audience: [audience] → suggests [style]
- Complexity: [level] → suggests [layout density]

## Design Instructions (from user input)
[从用户 steering prompt 中提取出的 style、color、layout 或视觉偏好]

## Recommended Combinations
1. **[Layout] + [Style]** (Recommended): [简短理由]
2. **[Layout] + [Style]**: [简短理由]
3. **[Layout] + [Style]**: [简短理由]
```

## Analysis Checklist

进入 structured content generation 前检查：

- [ ] 我是否读完了整个 source document？
- [ ] 我能否用 1-2 句话总结 main topic？
- [ ] 我是否识别了 1-3 个清晰 learning objectives？
- [ ] 我是否理解 target audience？
- [ ] 我是否正确分类了 content type？
- [ ] 我是否原样提取了所有 data points？
- [ ] 我是否识别了 visual opportunities？
- [ ] 我是否从 user input 中提取了 design instructions？
- [ ] 我是否推荐了 3 个 layout x style 组合？
