# Prompt Construction

## Prompt File Format

每个 prompt 文件使用 YAML frontmatter + 正文：

```yaml
---
illustration_id: 01
type: infographic
style: blueprint
references:                    # ⚠️ 只有文件真实存在于 references/ 目录时才填写
  - ref_id: 01
    filename: 01-ref-diagram.png
    usage: direct              # direct | style | palette
---

[下方填写对应类型的模板内容...]
```

**⚠️ CRITICAL - 何时包含 `references` 字段**：

| Situation | Action |
|-----------|--------|
| 参考文件已保存到 `references/` | 在 frontmatter 中包含 ✓ |
| 只用文字提取 style（没有文件） | 不要写入 frontmatter，改为追加到 prompt 正文 |
| Frontmatter 中有文件路径但文件不存在 | ERROR - 移除 references 字段 |

**Reference Usage Types**（仅当文件存在时使用）：

| Usage | Description | Generation Action |
|-------|-------------|-------------------|
| `direct` | 主要视觉参考 | 传给 `--ref` 参数 |
| `style` | 只提取 style 特征 | 在 prompt 文本中描述 style |
| `palette` | 提取 color palette | 在 prompt 中包含颜色 |

**如果没有参考文件，但通过文字提取了 style/palette**，直接追加到 prompt 正文：

```text
COLORS (from reference):
- Primary: #E8756D coral
- Secondary: #7ECFC0 mint
...

STYLE (from reference):
- Clean lines, minimal shadows
- Gradient backgrounds
...
```

---

## Default Composition Requirements

**默认应用到所有 prompts**：

| Requirement | Description |
|-------------|-------------|
| **Clean composition** | 简洁布局，避免视觉杂乱 |
| **White space** | 充足边距，元素周围有呼吸感 |
| **No complex backgrounds** | 只用纯色或细微渐变，避免繁忙纹理 |
| **Centered or content-appropriate** | 主视觉居中，或按内容需要摆放 |
| **Matching graphics** | 图形元素要与内容主题一致 |
| **Highlight core info** | 用留白凸显关键信息 |

**添加到所有 prompts**：

```text
构图干净，留白充足。背景简单或无背景。主元素居中，或按内容需要摆放。
```

---

## Color Specification Rules

Prompt 中的颜色使用 hex codes 只作为**渲染指导**，用于告诉模型使用哪些颜色，而不是要求显示成文字。

**⚠️ CRITICAL**：图像生成模型有时会把颜色名和 hex 值画成可见文本标签（例如把 "Macaron Blue #A8D8EA" 画进图里）。必须防止这种情况。

**添加到所有包含 COLORS 区块的 prompts**：

```text
Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
```

---

## Character Rendering

描绘人物时：

| Guideline | Description |
|-----------|-------------|
| **Style** | 简化的 cartoon silhouettes 或符号化表情 |
| **Avoid** | 写实人物、细节面孔 |
| **Diversity** | 展示多人时使用不同体型 |
| **Emotion** | 通过姿态和简单手势表达 |

**添加到包含人物的所有 prompts**：

```text
Human figures: simplified stylized silhouettes or symbolic representations, not photorealistic.
```

---

## Text in Illustrations

| Element | Guideline |
|---------|-----------|
| **Size** | 大、醒目、立刻可读 |
| **Style** | 优先使用 handwritten fonts，增加温度 |
| **Content** | 只保留简洁关键词和核心概念 |
| **Language** | 与文章语言一致 |

**添加到包含文字的 prompts**：

```text
图中文字应大且醒目，使用手写风格字体。保持极简，只聚焦关键词。
```

---

## Principles

好的 prompts 必须包含：

1. **Layout Structure First**：先描述构图、区域、流向。
2. **Specific Data/Labels**：使用文章中的真实数字和术语。
3. **Visual Relationships**：说明元素如何连接。
4. **Semantic Colors**：基于含义选择颜色（red=warning, green=efficient）。
5. **Style Characteristics**：线条处理、纹理、情绪。
6. **Aspect Ratio**：以 ratio 和 complexity level 结尾。

## Type-Specific Templates

### Infographic

```text
[Title] - Data Visualization

Layout: [grid/radial/hierarchical]

ZONES:
- Zone 1: [包含具体数值的数据点]
- Zone 2: [包含指标的对比]
- Zone 3: [总结/结论]

LABELS: [文章中的具体数字、百分比、术语]
COLORS: [语义化颜色映射]
STYLE: [style 特征]
ASPECT: 16:9
```

**Infographic + sketch-notes + macaron palette**（默认 / `hand-drawn-edu` preset）：

```text
单页手绘教育信息图，干净的 presentation 风格。
暖奶油色纸张背景，黑色手绘线条带轻微晃动，柔和 pastel 色块。
整体简单、友好、一眼易懂。只使用 diagram-style visuals，不要写实或摄影图像。

PALETTE: macaron — 暖奶油底上的柔和 pastel 色块
COLORS: Warm Cream background (#F5F0E8); Black (#1A1A1A) 用于所有线条、文字、
        箭头和 doodles；分区填充使用 Light Blue (#A8D8EA), Mint Green
        (#B5E5CF), Lavender (#D5C6E0), Peach (#FFD5C2)；Coral Red
        (#E8655A) 只少量用于一两个强调点。

LAYOUT (top → bottom):
- TOP: 粗体手写标题，尺寸偏大、略带晃动，可加装饰下划线或小 doodle。
- MIDDLE: 2–6 个圆角矩形信息框，按干净 grid、row 或 radial pattern 排列。
          每个框 = 一个 section、一种 pastel 填充色、一个简单 icon 或 sketchy
          cartoon element、一个简短 keyword/phrase。用手绘箭头连接相关区域。
- BOTTOM: 一句简短手写 takeaway，总结核心想法。

ELEMENTS: 带清晰分区的圆角信息框、带小 inline labels 的波浪/直线手绘箭头、
          简单 icons 和 sketchy cartoon elements（stick figures、工具、物体）、
          小 doodle 装饰（stars、sparkles、underlines、dots、asterisks），少量使用。

STYLE: 极简、组织清楚、空气感强。色块不完全填满轮廓，带轻微 "hand-painted"
       外溢。所有文字都是 hand-lettered，不要 computer fonts。只用短标签和关键词，
       不要长段落。各 section 之间留白充足。
```

**Infographic + vector-illustration**：

```text
Flat vector illustration infographic. 所有元素都有干净黑色轮廓。
COLORS: Cream background (#F5F0E6), Coral Red (#E07A5F), Mint Green (#81B29A), Mustard Yellow (#F2CC8F)
ELEMENTS: 几何化简化 icons，无 gradients，使用俏皮装饰元素（dots, stars）
```

**Infographic + vector-illustration + warm palette**：

```text
Flat vector illustration infographic. 所有元素都有干净黑色轮廓。
PALETTE OVERRIDE (warm): 只使用暖色 palette，不要冷色。
COLORS: Soft Peach background (#FFECD2), Warm Orange (#ED8936),
        Terracotta (#C05621), Golden Yellow (#F6AD55), Deep Brown (#744210)
ELEMENTS: 几何化简化 icons，无 gradients，圆角，模块化 card layout，icon style 保持一致。
```

### Scene

```text
[Title] - Atmospheric Scene

FOCAL POINT: [主主体]
ATMOSPHERE: [光线、情绪、环境]
MOOD: [要传达的情绪]
COLOR TEMPERATURE: [warm/cool/neutral]
STYLE: [style 特征]
ASPECT: 16:9
```

### Flowchart

```text
[Title] - Process Flow

Layout: [left-right/top-down/circular]

STEPS:
1. [Step name] - [简短说明]
2. [Step name] - [简短说明]
...

CONNECTIONS: [箭头类型、决策点]
STYLE: [style 特征]
ASPECT: 16:9
```

**Flowchart + vector-illustration**：

```text
Flat vector flowchart，使用粗箭头和几何 step containers。
COLORS: Cream background (#F5F0E6), steps in Coral/Mint/Mustard, black outlines
ELEMENTS: 圆角矩形、粗箭头、每步一个简单 icon
```

**Flowchart + sketch-notes + macaron palette**：

```text
暖奶油色纸张上的手绘教育 flowchart。所有线条都有轻微晃动。
PALETTE: macaron — 柔和 pastel 色块
COLORS: Warm Cream background (#F5F0E8), zone fills in Macaron Blue (#A8D8EA),
        Lavender (#D5C6E0), Mint (#B5E5CF), Coral Red (#E8655A) for emphasis
ELEMENTS: 圆角 cards，虚线/实线边框，带 labels 的波浪手绘箭头，
          简单 stick-figure characters，doodle decorations (stars, underlines)
STYLE: 色块不完全填满轮廓，手绘 lettering，留白充足
```

**Flowchart + ink-notes + mono-ink palette**：

```text
纯白背景上的专业手绘 visual-note flowchart。黑色墨线略带晃动，
à la Mike Rohde sketchnoting。
PALETTE: mono-ink — 黑色墨线为主，少量语义强调色
COLORS: Pure White background (#FFFFFF), Near Black (#1A1A1A) 用于所有线条、
        文字和 figures；Coral Red (#E8655A) 只用于风险/强调，
        Muted Teal (#5FA8A8) 只用于正向/解决状态
ELEMENTS: 从左到右的阶段框，圆角矩形框架，阶段之间用波浪手绘箭头连接，
          简单 stick-figure characters，上方带角色标签（例如 "ML Engineer",
          "Team Lead"），未来/空状态用虚线边框框，每个阶段配小 doodle icon
STYLE: 手写标题（粗体、偏大），手写阶段标签和 annotations，留白充足，
       底部 tagline 总结 takeaway
```

### Comparison

```text
[Title] - Comparison View

LEFT SIDE - [Option A]:
- [Point 1]
- [Point 2]

RIGHT SIDE - [Option B]:
- [Point 1]
- [Point 2]

DIVIDER: [视觉分隔线]
STYLE: [style 特征]
ASPECT: 16:9
```

**Comparison + vector-illustration**：

```text
Flat vector comparison with split layout. 视觉分隔清晰。
COLORS: Left side Coral (#E07A5F), Right side Mint (#81B29A), cream background
ELEMENTS: 粗 icons，黑色轮廓，居中 divider line
```

**Comparison + vector-illustration + warm palette**：

```text
Flat vector comparison with split layout. 视觉分隔清晰。
PALETTE OVERRIDE (warm): 只使用暖色 palette，不要冷色。
COLORS: Left side Warm Orange (#ED8936), Right side Terracotta (#C05621),
        Soft Peach background (#FFECD2), Deep Brown (#744210) accents
ELEMENTS: 粗 icons，黑色轮廓，居中 divider line
```

**Comparison + ink-notes + mono-ink palette**（Before/After, Traditional vs New）：

```text
纯白背景上的专业手绘 sketchnote comparison。黑色墨线略带晃动，
à la Mike Rohde sketchnoting。
PALETTE: mono-ink — 黑色墨线为主，少量语义强调色
COLORS: Pure White background (#FFFFFF), Near Black (#1A1A1A) 用于所有轮廓、
        文字、figures、arrows；Coral Red (#E8655A) 保留给 risks/gaps
        （left/Before side）；Muted Teal (#5FA8A8) 保留给 positives
        （right/After side）。强调色少于画布 10%。
LAYOUT: Left | Right split，中间是垂直手绘 divider。顶部左侧手写 "Before"，
        顶部右侧手写 "After"。
LEFT SIDE: Stick figure(s) 上方有角色标签，speech bubble 展示 pain point，
           手写 bullet pain-point list。
RIGHT SIDE: Stick figure(s) 展示 new state，手写 bullet improvement list，
            小型 positive-action icons。
BRIDGE: 弧形手绘 "mindset shift" arrow 从 left → right，带小 inline label 描述转变。
BOTTOM: 单行手写 tagline，总结 takeaway。
STYLE: 手写 headings（粗体、偏大），手写 body annotations，留白充足，
       不要 computer fonts、gradients、shadows。
```

### Framework

```text
[Title] - Conceptual Framework

STRUCTURE: [hierarchical/network/matrix]

NODES:
- [Concept 1] - [role]
- [Concept 2] - [role]

RELATIONSHIPS: [节点如何连接]
STYLE: [style 特征]
ASPECT: 16:9
```

**Framework + vector-illustration**：

```text
Flat vector framework diagram，使用几何节点和粗连接线。
COLORS: Cream background (#F5F0E6), nodes in Coral/Mint/Mustard/Blue, black outlines
ELEMENTS: 节点使用圆角矩形或圆形，粗连接线
```

**Framework + vector-illustration + warm palette**：

```text
Flat vector framework diagram，使用几何节点和粗连接线。
PALETTE OVERRIDE (warm): 只使用暖色 palette，不要冷色。
COLORS: Soft Peach background (#FFECD2), nodes in Warm Orange (#ED8936),
        Terracotta (#C05621), Golden Yellow (#F6AD55), black outlines
ELEMENTS: 节点使用圆角矩形或圆形，粗连接线
```

**Framework + ink-notes + mono-ink palette**（command center, OS analogy）：

```text
纯白背景上的专业手绘 sketchnote framework。黑色墨线略带晃动，
à la Mike Rohde sketchnoting。
PALETTE: mono-ink — 黑色墨线为主，少量语义强调色
COLORS: Pure White background (#FFFFFF), Near Black (#1A1A1A) 用于所有线条、
        文字和 figures；Dusty Lavender (#9B8AB5) 只用于中性 category tags；
        Coral Red (#E8655A) 少量用于强调。强调色少于 10%。
STRUCTURE: 中央圆角矩形 frame 作为 "the system"，内部有手写标题。
           内层是带标签的 sub-components（node labels 在上方）。
           外层是来自边缘 stick-figure operators/users 的 feeder arrows，
           每个人物有 role labels。
ELEMENTS: 边缘有带 role tags 的 stick figures（"Team Lead", "Operator"），
          波浪手绘 connector arrows 带小 inline labels，每个 component 配小 doodle icon，
          future/empty capabilities 使用虚线边框 placeholder(s)。
BOTTOM: 单行手写 tagline。
STYLE: 手写 headings，手写 annotations，留白充足，不要 computer fonts 或 gradients。
```

### Timeline

```text
[Title] - Chronological View

DIRECTION: [horizontal/vertical]

EVENTS:
- [Date/Period 1]: [milestone]
- [Date/Period 2]: [milestone]

MARKERS: [视觉标记]
STYLE: [style 特征]
ASPECT: 16:9
```

### Screen-Print Style Override

当 `style: screen-print` 时，用以下说明替换标准 style instructions：

```text
Screen print / silkscreen poster art. 平面色块，NO gradients。
COLORS: 最多 2-5 种颜色。[从 style palette 或 duotone pair 中选择]
TEXTURE: Halftone dot patterns，轻微色层套印偏移，paper grain
COMPOSITION: 粗 silhouettes，几何 framing，用 negative space 讲述第二层故事
FIGURES: 只用 silhouettes，不要细节面孔，stencil-cut edges
TYPOGRAPHY: 粗 condensed sans-serif 融入构图（不是覆盖式文字）
```

**Scene + screen-print**：

```text
Conceptual poster scene。单一符号化焦点，不要字面插图。
COLORS: Duotone pair (e.g., Burnt Orange #E8751A + Deep Teal #0A6E6E) on Off-Black #121212
COMPOSITION: 居中 silhouette 或 geometric frame，60%+ negative space
TEXTURE: Halftone dots，paper grain，轻微 print misregistration
```

**Comparison + screen-print**：

```text
Split poster composition。每一侧由 duotone pair 中的一种颜色主导。
LEFT: [Color A] side with silhouette/icon for [Option A]
RIGHT: [Color B] side with silhouette/icon for [Option B]
DIVIDER: 几何形状或 negative space boundary
TEXTURE: 两侧之间使用 halftone transitions
```

---

## Palette Override

当指定 palette（通过 `--palette` 或 preset）时，它会覆盖 style 的默认颜色：

1. 读取 style file → 获取渲染规则（Visual Elements、Style Rules、line treatment）
2. 读取 palette file（`palettes/<palette>.md`）→ 获取 Colors + Background
3. Palette Colors **替换** style 默认 Color Palette
4. Palette Background **替换** style Background color（保留 style 的 texture 描述）
5. 构建 prompt：style rendering instructions + palette colors

**Prompt frontmatter** 在指定 palette 时包含 palette：

```yaml
---
illustration_id: 01
type: infographic
style: vector-illustration
palette: macaron
---
```

**Example**：`vector-illustration` + `macaron` palette：

```text
Flat vector illustration infographic. 所有元素都有干净黑色轮廓。
PALETTE: macaron — 柔和 pastel 色块
COLORS: Warm Cream background (#F5F0E8), Macaron Blue (#A8D8EA), Mint (#B5E5CF),
        Lavender (#D5C6E0), Peach (#FFD5C2), Coral Red (#E8655A) for emphasis
ELEMENTS: 几何化简化 icons，无 gradients，俏皮装饰元素
```

未指定 palette 时，继续使用 style 内置 Color Palette。

---

## What to Avoid

- 模糊描述（例如 "a nice image"）
- 字面化隐喻插图
- 缺少具体 labels/annotations
- 泛泛的装饰元素

## Watermark Integration

如果 preferences 启用了 watermark，追加：

```text
Include a subtle watermark "[content]" positioned at [position].
```
