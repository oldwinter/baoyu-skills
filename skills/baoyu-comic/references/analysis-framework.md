# Comic Content Analysis Framework

将 source content 转换为有效 visual storytelling 的深度分析框架。

## Purpose

创建 comic 前，彻底分析源材料，以便：

- 识别 target audience 及其需求
- 判断 comic 将交付什么价值
- 提取适合 visual storytelling 的叙事潜力
- 规划 character arcs 和关键时刻

## Analysis Dimensions

### 1. Core Content（理解 "What"）

**Central Message**

- 读者最应该带走的单一重要想法是什么？
- 能否用一句话表达？

**Key Concepts**

- 读者必须理解哪些核心概念？
- 这些概念应如何可视化？
- 哪些概念需要简化解释？

**Content Structure**

- Source material 是如何组织的？
- 自然的 narrative arc 是什么？
- Climax 和 turning points 在哪里？

**Evidence & Examples**

- 哪些具体 examples、data 或 stories 支撑主要想法？
- 哪些 examples 适合转换为 visual panels？
- 哪些内容可以展示，而不是讲述？

### 2. Context & Background（理解 "Why"）

**Source Origin**

- 谁创建了这份内容？他们的视角是什么？
- 原始目的是什么？
- 是否存在需要注意的 bias？

**Historical/Cultural Context**

- 故事发生在何时何地？
- 读者需要什么背景知识？
- 需要哪些特定时代/文化的视觉元素？

**Underlying Assumptions**

- Source 假定读者已经知道什么？
- 其中有哪些隐含 beliefs 或 values？
- Comic 应该挑战还是强化这些内容？

### 3. Audience Analysis

**Primary Audience**

- 谁会阅读这部 comic？
- 他们现有知识水平如何？
- 他们的兴趣和动机是什么？

**Secondary Audiences**

- 还有谁可能从这部 comic 受益？
- 他们的需求有何不同？

**Reader Questions**

- 读者会有什么问题？
- 他们可能带着哪些误解？
- 可以创造哪些 "aha moments"？

### 4. Value Proposition

**Knowledge Value**

- 读者会学到什么？
- 他们会获得什么新视角？
- 这会如何改变他们的理解？

**Emotional Value**

- 读者应该感受到什么情绪？
- 他们会与角色建立什么连接？
- 什么会让内容难忘？

**Practical Value**

- 读者能否应用所学？
- 这可能激发什么行动？
- 这可能引发什么对话？

### 5. Narrative Potential

**Story Arc Candidates**

- 内容中有哪些自然叙事？
- 冲突或张力在哪里？
- 发生了哪些 transformation？

**Character Potential**

- 关键人物是谁？
- 他们的 motivations 和 obstacles 是什么？
- 他们在过程中如何变化？

**Visual Opportunities**

- 哪些 scenes 有强视觉潜力？
- 哪里能把 abstract concepts 变成 concrete images？
- 哪些 metaphors 可以可视化？

**Dramatic Moments**

- Breakthrough/revelation moments 是哪些？
- 情绪高点在哪里？
- 什么制造 tension and release？

### 6. Adaptation Considerations

**What to Keep**

- Essential facts and ideas
- Key quotes or moments
- Core emotional beats

**What to Simplify**

- Complex explanations
- Dense technical details
- Lengthy descriptions

**What to Expand**

- 值得更多关注的 brief mentions
- 隐含 emotions 或 relationships
- Source 中没有展开的 visual details

**What to Omit**

- 离题信息
- 重复 examples
- 不服务 narrative 的内容

## Output Format

Analysis results 应保存到 `analysis.md`，包含：

1. **YAML Front Matter**：Metadata（title、topic、time_span、source_language、user_language、aspect_ratio、recommended_page_count、recommended_art、recommended_tone、recommended_layout）
2. **Target Audience**：Primary、secondary、tertiary audiences 及其 needs
3. **Value Proposition**：读者将获得什么（knowledge、emotional、practical）
4. **Core Themes**：包含 theme、narrative potential、visual opportunity 的表格
5. **Key Figures & Story Arcs**：包含 arcs、visual identity、key moments 的 character profiles
6. **Content Signals**：基于 content type 的 style 和 layout recommendations
7. **Recommended Approaches**：按适配度排序的 narrative approaches

### YAML Front Matter Example

```yaml
---
title: "Alan Turing: The Father of Computing"
topic: alan-turing-biography
time_span: 1912-1954
source_language: en
user_language: zh  # From EXTEND.md or detected
aspect_ratio: "3:4"
recommended_page_count: 16
recommended_art: ligne-claire  # ligne-claire|manga|realistic|ink-brush|chalk
recommended_tone: neutral      # neutral|warm|dramatic|romantic|energetic|vintage|action
recommended_layout: mixed      # standard|cinematic|dense|splash|mixed|webtoon
---
```

### Language Fields

| Field | Description |
|-------|-------------|
| `source_language` | Source content 的检测语言 |
| `user_language` | Comic 输出语言（来自 EXTEND.md > --lang > source_language） |

## Analysis Checklist

进入 storyboard 前检查：

- [ ] 我能否用一句话说出 core message？
- [ ] 我是否清楚谁会阅读这部 comic？
- [ ] 我是否识别了至少 3 种 comic 提供价值的方式？
- [ ] 是否有清晰 protagonist 和有吸引力的 arcs？
- [ ] 我是否找到了至少 5 个视觉冲击强的 moments？
- [ ] 我是否理解哪些内容要 keep、simplify、expand、omit？
- [ ] 我是否识别了 emotional peaks and valleys？
