# Structured Content Template

用于生成结构化信息图内容的模板，为视觉设计者提供清楚输入。

## Purpose

本文档连接 content analysis 和 visual design：

- 将源材料转成 designer-ready 格式
- 把 learning objectives 组织成视觉 sections
- 原样保留所有 source data
- 将内容与 design instructions 分离

## Instructional Design Process

### Phase 1: High-Level Outline

1. **Title**：用有吸引力的标题抓住本质
2. **Overview**：简短说明（1-2 句话）
3. **Learning Objectives**：列出观看者会理解什么

### Phase 2: Section Development

对每个 learning objective：

1. **Key Concept**：该 section 的一句话总结
2. **Content**：从 source 原样提取的要点
3. **Visual Element**：视觉上应展示什么
4. **Text Labels**：headlines、subheads、labels 的准确文本

### Phase 3: Data Integrity Check

验证所有 source data：

- 精确复制（不意译）
- 正确 attribution（针对 quotes）
- 格式一致

## Critical Rules

| Rule | Requirement | Example |
|------|-------------|---------|
| **Output format** | 只输出 Markdown | 使用正确 headers、lists、code blocks |
| **Tone** | Expert trainer | 知识充分、清楚、鼓励式 |
| **No new information** | 只使用 source content | 不添加 source 中没有的例子 |
| **Verbatim data** | 精确复制 | "73% increase" 不写成 "significant increase" |

## Structured Content Format

```markdown
# [Infographic Title]

## Overview
[简短说明此信息图传达什么 - 1-2 句话]

## Learning Objectives
The viewer will understand:
1. [Primary objective]
2. [Secondary objective]
3. [Tertiary objective if applicable]

---

## Section 1: [Section Title]

**Key Concept**: [该 section 的一句话总结]

**Content**:
- [Point 1 - verbatim from source]
- [Point 2 - verbatim from source]
- [Point 3 - verbatim from source]

**Visual Element**: [描述视觉上应展示什么]
- Type: [icon/chart/illustration/diagram/photo]
- Subject: [展示对象]
- Treatment: [呈现方式]

**Text Labels**:
- Headline: "[Exact text for headline]"
- Subhead: "[Exact text for subhead]"
- Labels: "[Label 1]", "[Label 2]", "[Label 3]"

---

## Section 2: [Section Title]

**Key Concept**: [一句话总结]

**Content**:
- [Point 1]
- [Point 2]

**Visual Element**: [描述]

**Text Labels**:
- Headline: "[text]"
- Labels: "[Label 1]", "[Label 2]"

---

[继续为每个 section 编写...]

---

## Data Points (Verbatim)

所有统计、数字和 quotes 都严格按 source 原样记录：

### Statistics
- "[Exact statistic 1]"
- "[Exact statistic 2]"
- "[Exact statistic 3]"

### Quotes
- "[Exact quote]" — [Attribution]

### Key Terms
- **[Term 1]**: [Definition from source]
- **[Term 2]**: [Definition from source]

---

## Design Instructions

从用户 steering prompt 中提取：

### Style Preferences
- [任何 color preferences]
- [任何 mood/aesthetic preferences]
- [任何 artistic style preferences]

### Layout Preferences
- [任何 structure preferences]
- [任何 organization preferences]

### Other Requirements
- [来自用户的其他 visual requirements]
- [如有，target platform]
- [如有，brand guidelines]
```

## Section Types by Content

### For Process/Steps

```markdown
## Section N: Step N - [Step Title]

**Key Concept**: [此 step 完成什么]

**Content**:
- Action: [要做什么]
- Details: [如何做]
- Note: [重要注意事项]

**Visual Element**:
- Type: numbered step icon
- Subject: [代表该 action 的视觉]
- Arrow: leads to next step

**Text Labels**:
- Headline: "Step N: [Title]"
- Action: "[Imperative verb + object]"
```

### For Comparison

```markdown
## Section N: [Item A] vs [Item B]

**Key Concept**: [两者区别是什么]

**Content**:
| Aspect | [Item A] | [Item B] |
|--------|----------|----------|
| [Factor 1] | [Value] | [Value] |
| [Factor 2] | [Value] | [Value] |

**Visual Element**:
- Type: split comparison
- Left: [Item A representation]
- Right: [Item B representation]

**Text Labels**:
- Headline: "[Item A] vs [Item B]"
- Left label: "[Item A name]"
- Right label: "[Item B name]"
```

### For Hierarchy

```markdown
## Section N: [Level Name]

**Key Concept**: [此 level 代表什么]

**Content**:
- Position: [Top/Middle/Bottom]
- Priority: [Importance level]
- Contains: [Elements at this level]

**Visual Element**:
- Type: layer/tier
- Size: [relative to other levels]
- Position: [where in hierarchy]

**Text Labels**:
- Level title: "[Name]"
- Description: "[Brief description]"
```

### For Data/Statistics

```markdown
## Section N: [Metric Name]

**Key Concept**: [该数据说明什么]

**Content**:
- Value: [Exact number/percentage]
- Context: [它意味着什么]
- Comparison: [Benchmark if any]

**Visual Element**:
- Type: [chart/number highlight/gauge]
- Emphasis: [如何吸引注意]

**Text Labels**:
- Main number: "[Exact value]"
- Label: "[Metric name]"
- Context: "[Brief context]"
```

## Quality Checklist

完成 structured content 前检查：

- [ ] Title 是否抓住主信息？
- [ ] Learning objectives 是否清晰且可衡量？
- [ ] 每个 section 是否映射到一个 objective？
- [ ] 所有 content 是否都原样来自 source？
- [ ] Visual elements 是否描述清楚？
- [ ] Text labels 是否精确指定？
- [ ] Data points 是否已收集并验证？
- [ ] Design instructions 是否已分离？
- [ ] 是否没有添加新信息？
