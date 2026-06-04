---
name: baoyu-diagram
description: 创建各种专业深色主题 SVG diagrams，包括 architecture diagrams、flowcharts、sequence diagrams、structural diagrams、mind maps、timelines、illustrative/conceptual diagrams 等。当用户要求任何技术或概念图、系统可视化、process flow、data flow、component relationship、network topology、decision tree、org chart、state machine，或任何 structure/logic/process 的视觉表达时使用此 skill。用户说 "画个图"、"画一个架构图"、"diagram"、"flowchart"、"sequence diagram"、"draw me a ..."，或上传内容并要求可视化时也触发。输出始终是独立 `.svg` 文件。
version: 1.117.3
---

# Diagram Generator

创建多种 diagram types 的专业 SVG diagrams。所有输出都是单个自包含 `.svg` 文件，内嵌 styles 和 fonts。

## 支持的 Diagram Types

| Type | 何时使用 | 关键特征 |
|------|-------------|-------------------|
| **Architecture** | System components 与 relationships | Grouped boxes、connection arrows、region boundaries |
| **Flowchart** | Decision logic、process steps | Diamond decisions、rounded step boxes、directional flow |
| **Sequence** | actors 之间按时间排序的 interactions | Vertical lifelines、horizontal messages、activation bars |
| **Structural** | Class diagrams、ER diagrams、org charts | Compartmented boxes、typed relationships（inheritance、composition） |
| **Mind Map** | Brainstorming、topic exploration | Central node、radiating branches、organic layout |
| **Timeline** | Chronological events | Horizontal/vertical axis、event markers、period spans |
| **Illustrative** | Conceptual explanations、comparisons | Free-form layout、icons、annotations、visual metaphors |
| **State Machine** | State transitions、lifecycle | Rounded state nodes、labeled transitions、start/end markers |
| **Data Flow** | Data transformation pipelines | Process bubbles、data stores、external entities |

## Design System

### Color Palette

用于 component categories 的语义颜色：

| Category | Fill (rgba) | Stroke | 用途 |
|----------|-------------|--------|---------|
| Primary | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan) | Frontend、user-facing、inputs |
| Secondary | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald) | Backend、services、processing |
| Tertiary | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet) | Database、storage、persistence |
| Accent | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber) | Cloud、infrastructure、regions |
| Alert | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose) | Security、errors、warnings |
| Connector | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange) | Buses、queues、middleware |
| Neutral | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate) | External、generic、unknown |
| Highlight | `rgba(59, 130, 246, 0.3)` | `#60a5fa` (blue) | Active state、focus、current step |

对 flowcharts 和 sequence diagrams，按角色（actor、decision、process）分配颜色，而不是按技术分配。

### Typography

使用内嵌 SVG `@font-face` 或 system monospace fallback：

```svg
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap');
  text { font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace; }
</style>
```

按角色设置字号：
- **Title:** 16px, weight 700
- **Component name:** 11-12px, weight 600
- **Sublabel / description:** 9px, weight 400, color `#94a3b8`
- **Annotation / note:** 8px, weight 400
- **Tiny label（箭头上）:** 7-8px

### 核心视觉元素

**Background:** `#0f172a` (slate-900)，带细微 grid：
```svg
<defs>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/>
  </pattern>
</defs>
<rect width="100%" height="100%" fill="#0f172a"/>
<rect width="100%" height="100%" fill="url(#grid)"/>
```

**Arrowhead marker（standard）：**
```svg
<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
</marker>
```

**Arrowhead marker（colored）— 按需为每种颜色创建：**
```svg
<marker id="arrow-cyan" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee"/>
</marker>
```

**Open arrowhead（用于 async/return messages）：**
```svg
<marker id="arrow-open" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="#64748b" stroke-width="1.5"/>
</marker>
```

### SVG 结构与 Layering

按以下顺序绘制元素，以获得正确 z-ordering（SVG 从后向前绘制）：

1. Background fill + grid pattern
2. Region/group boundaries（dashed outlines）
3. Connection arrows 和 lines
4. Opaque masking rects（与 component boxes 同位置，`fill="#0f172a"`）
5. Component boxes（semi-transparent fill + stroke）
6. Text labels
7. Legend（bottom-right 或 bottom area，位于所有 boundaries 外）
8. Title block（top-left）

Opaque masking rect 技巧很关键；如果没有它，semi-transparent component fills 会透出下方箭头：
```svg
<!-- Mask layer: opaque background to hide arrows -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="#0f172a"/>
<!-- Visual layer: styled component -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1.5"/>
<text x="180" y="125" fill="white" font-size="11" font-weight="600" text-anchor="middle">API Gateway</text>
<text x="180" y="141" fill="#94a3b8" font-size="9" text-anchor="middle">Kong / Nginx</text>
```

### 间距规则

这些规则用于防止重叠，请严格遵守：

- **Component box height:** 50-70px（standard），80-120px（large/complex）
- **Minimum gap between components:** vertical 40px，horizontal 30px
- **Arrow label clearance:** 距任意 box edge 10px
- **Region boundary padding:** contained components 周围内边距 20px
- **Legend placement:** 至少低于最低 diagram element 20px
- **Title block:** 距 top-left 20px，位于 diagram content area 外
- **viewBox:** 始终扩展到容纳全部内容，并在四周留 30px padding

### Component Patterns

**Standard box（service/process）：**
```svg
<rect x="X" y="Y" width="160" height="60" rx="6" fill="#0f172a"/>
<rect x="X" y="Y" width="160" height="60" rx="6" fill="FILL" stroke="STROKE" stroke-width="1.5"/>
<text x="CX" y="Y+24" fill="white" font-size="11" font-weight="600" text-anchor="middle">Name</text>
<text x="CX" y="Y+40" fill="#94a3b8" font-size="9" text-anchor="middle">description</text>
```

**Decision diamond（flowchart）：**
```svg
<g transform="translate(CX, CY)">
  <polygon points="0,-35 50,0 0,35 -50,0" fill="#0f172a"/>
  <polygon points="0,-35 50,0 0,35 -50,0" fill="rgba(120,53,15,0.3)" stroke="#fbbf24" stroke-width="1.5"/>
  <text y="4" fill="white" font-size="10" font-weight="600" text-anchor="middle">Condition?</text>
</g>
```

**Database cylinder:**
```svg
<g transform="translate(X, Y)">
  <rect x="0" y="10" width="120" height="50" rx="2" fill="#0f172a"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="#0f172a"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="#0f172a"/>
  <rect x="0" y="10" width="120" height="50" fill="rgba(76,29,149,0.4)"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1.5"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1.5"/>
  <line x1="0" y1="10" x2="0" y2="60" stroke="#a78bfa" stroke-width="1.5"/>
  <line x1="120" y1="10" x2="120" y2="60" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="60" y="40" fill="white" font-size="11" font-weight="600" text-anchor="middle">PostgreSQL</text>
</g>
```

**Region boundary:**
```svg
<rect x="X" y="Y" width="W" height="H" rx="12" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,4"/>
<text x="X+12" y="Y+16" fill="#fbbf24" font-size="9" font-weight="600">AWS us-east-1</text>
```

**Security group:**
```svg
<rect x="X" y="Y" width="W" height="H" rx="8" fill="none" stroke="#fb7185" stroke-width="1" stroke-dasharray="4,4"/>
<text x="X+10" y="Y+14" fill="#fb7185" font-size="8" font-weight="500">VPC / Security Group</text>
```

## 特定类型 Layout 指南

将此 SKILL.md 文件所在目录路径确定为 `{baseDir}`。开始 layout 前，读取具体 diagram type 的 reference 文件。Reference files 位于 `{baseDir}/references/`，包含详细 layout algorithms 和 examples。

### Architecture Diagrams
→ Read `{baseDir}/references/architecture.md`

要点：left-to-right 或 top-to-bottom data flow。将相关 services 分组到 region boundaries 中。层之间使用 buses/connectors。将 databases 放在底部或右侧。

### Flowcharts
→ Read `{baseDir}/references/flowchart.md`

要点：top-to-bottom primary flow。decisions 使用 diamonds，并在 exit arrows 上标注 Yes/No。start/end 使用 rounded rectangles。happy path 使用 Highlight color。

### Sequence Diagrams
→ Read `{baseDir}/references/sequence.md`

要点：actors 作为顶部 boxes，使用 vertical dashed lifelines，messages 使用 horizontal arrows（solid=sync，dashed=return）。时间向下流动。Activation bars 表示 processing。复杂时给 messages 编号。

### Structural Diagrams
→ Read `{baseDir}/references/structural.md`

要点：compartmented boxes（class diagrams 中为 name / attributes / methods）。Relationship lines：solid with filled diamond=composition，solid with empty diamond=aggregation，dashed arrow=dependency，solid triangle=inheritance。

### Mind Maps
从 central concept 放射的 free-form layout。branches 使用 organic curves（带 cubic beziers 的 `<path>`）。使用 palette 变化 branch colors。central node 字号更大，向外逐级减小。

### Timelines
Horizontal 或 vertical axis line。Event markers 作为轴线上的 circles 或 diamonds。Description text 交替偏移到两侧以避免重叠。用颜色区分 event types。

### State Machines
Rounded-rect states；composite states 使用 double-border。initial state 使用 filled circle，final state 使用 bullseye。self-transitions 使用 curved arrows。所有 transitions 用 `event [guard] / action` 格式标注。

## Output Rules

1. 输出**单个 `.svg` 文件**；除 Google Fonts import 外无外部依赖
2. 设置 `viewBox` 以容纳所有内容并留 30px padding；不要设置固定 `width`/`height` 属性（让 SVG 响应式缩放）
3. 在根 `<svg>` 元素上包含 `xmlns="http://www.w3.org/2000/svg"`
4. 将所有 `<style>`、`<defs>`、markers 和 patterns 放在 SVG 顶部
5. 居中 labels 使用 `text-anchor="middle"`；确保文本不溢出 boxes
6. **中文文本支持**：当 labels 包含中文字符时，使用 `font-family: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', sans-serif'` 并增加 box widths；CJK 字符更宽
7. **保存位置**：如果输入是文件，保存到 `{inputFileDir}/diagram/`。否则保存到 `{projectDir}/diagram/{topic-slug}/`。如目录不存在则创建

## Script

将此 SKILL.md 文件所在目录路径确定为 `{baseDir}`。Script path：`{baseDir}/scripts/main.ts`。

解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。

### SVG → @2x PNG

保存 SVG 后，将其转换为 @2x PNG：

```bash
${BUN_X} {baseDir}/scripts/main.ts <svg-path> [options]
```

Options：
- `-s, --scale <n>` — Scale factor（默认：2）
- `-o, --output <path>` — 自定义输出路径（默认：`<input>@2x.png`）
- `--json` — JSON output

## Process

1. 从用户请求识别 diagram type
2. 如果该 type 有相关 reference 文件，读取它
3. 规划 layout：列出所有 components，确定 grouping 和 flow direction，计算位置
4. 按上面的 layering order 写 SVG
5. 验证 spacing rules：无重叠，legends 位于 boundaries 外，viewBox 足够大
6. 保存 SVG 文件
7. 运行 `${BUN_X} {baseDir}/scripts/main.ts <svg-path>` 生成 @2x PNG
8. 将两个文件都展示给用户
