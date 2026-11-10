---
name: baoyu-diagram
description: 创建专业 diagrams，并通过 CSS custom properties 配置 dark/light theme。当用户要求任何技术或概念图、系统可视化、process flow、data flow、component relationship、network topology、decision tree、org chart、state machine，或任何 structure/logic/process 的视觉表达时使用此 skill。用户说 "画个图"、"画一个架构图"、"diagram"、"flowchart"、"sequence diagram"、"draw me a ..."，或上传内容并要求可视化时也触发。输出 dark-theme SVG、light-theme SVG，以及各自的 @2x PNG。
version: 1.118.0
---

# Diagram Generator

创建 SVG diagrams。每个 SVG 内嵌自己的 styles，使用 CSS custom properties 实现 theming，并且不通过网络加载任何资源。

## Output Files

对于保存为 `<name>.svg` 的 diagram，必须生成以下文件：

| File | What it is | Made by |
|------|-----------|---------|
| `<name>.svg` | Source SVG，CSS variables 使用 dark theme 值 | 你（LLM） |
| `<name>.light.svg` | 相同 markup，light theme 值 | `theme-switch.ts --theme=light` |
| `<name>@2x.png` | 2x 缩放的 dark PNG | `main.ts` |
| `<name>.light@2x.png` | 2x 缩放的 light PNG | `main.ts --theme light` |

如果用户只要一个 theme，或只要 SVG，就只生成对应文件。

## Themes

所有颜色都是 CSS custom properties，定义在 SVG `<style>` 的 `:root` block 中；markup 通过 `var(--bg)`、`var(--color-primary-fill)` 等引用。绝不要在 SVG attributes 中硬编码颜色值。

Theme 值位于 `{baseDir}/themes/<name>.json`：一个扁平 JSON object，把 CSS property names（以 `--` 开头的 keys）映射到颜色。其他 keys（例如 `"description"`）是 metadata，scripts 会忽略。内置：`dark.json`、`light.json`。

**Custom themes：** 把新的 `.json` 放进 `themes/`，无需修改 scripts：

```json
// themes/my-brand.json
{
  "description": "Corporate brand theme",
  "--bg": "#ffffff",
  "--text": "#1a1a2e",
  "--text-muted": "#6b7280",
  "--arrow": "#9ca3af",
  "--color-primary-fill": "rgba(37,99,235,0.12)",
  "--color-primary-stroke": "#2563eb",
  "--color-secondary-fill": "rgba(22,163,74,0.12)",
  "--color-secondary-stroke": "#16a34a"
}
```

通过 `--theme=my-brand` 应用（`theme-switch.ts`、`main.ts` 和 `flatten-vars.ts` 都支持）。Custom theme 中省略的 variables 不会被替换。为 custom theme 生成 SVG 时，在 `:root` block 中使用它的值。

### CSS Custom Properties

| Variable | Dark Theme Default | Light Theme Value | Usage |
|----------|-------------------|-------------------|-------|
| `--bg` | `#0f172a` | `#f8fafc` | Page background |
| `--bg-grid` | `#1e293b` | `#e2e8f0` | Grid pattern stroke |
| `--mask` | `#0f172a` | `#f8fafc` | Opaque mask fill（与 --bg 相同） |
| `--text` | `white` | `#0f172a` | Primary text color |
| `--text-muted` | `#94a3b8` | `#475569` | Secondary/sublabel text |
| `--arrow` | `#64748b` | `#64748b` | Arrow/connector lines（不变） |
| `--color-primary-fill` | `rgba(8,51,68,0.4)` | `rgba(6,182,212,0.12)` | Frontend、user-facing、inputs |
| `--color-primary-stroke` | `#22d3ee` | `#0891b2` | Primary border |
| `--color-secondary-fill` | `rgba(6,78,59,0.4)` | `rgba(5,150,105,0.12)` | Backend、services、processing |
| `--color-secondary-stroke` | `#34d399` | `#059669` | Secondary border |
| `--color-tertiary-fill` | `rgba(76,29,149,0.4)` | `rgba(124,58,237,0.12)` | Database、storage、persistence |
| `--color-tertiary-stroke` | `#a78bfa` | `#7c3aed` | Tertiary border |
| `--color-accent-fill` | `rgba(120,53,15,0.3)` | `rgba(217,119,6,0.12)` | Cloud、infrastructure、regions |
| `--color-accent-stroke` | `#fbbf24` | `#d97706` | Accent border |
| `--color-alert-fill` | `rgba(136,19,55,0.4)` | `rgba(225,29,72,0.12)` | Security、errors、warnings |
| `--color-alert-stroke` | `#fb7185` | `#e11d48` | Alert border |
| `--color-connector-fill` | `rgba(251,146,60,0.3)` | `rgba(234,88,12,0.12)` | Buses、queues、middleware |
| `--color-connector-stroke` | `#fb923c` | `#ea580c` | Connector border |
| `--color-neutral-fill` | `rgba(30,41,59,0.5)` | `rgba(100,116,139,0.12)` | External、generic、unknown |
| `--color-neutral-stroke` | `#94a3b8` | `#64748b` | Neutral border |
| `--color-highlight-fill` | `rgba(59,130,246,0.3)` | `rgba(59,130,246,0.12)` | Active state、focus、current step |
| `--color-highlight-stroke` | `#60a5fa` | `#3b82f6` | Highlight border |

## Design System

### Typography

使用本地安装的 monospace font stack。不要 `@import` web fonts，也不要引用任何 remote resource：SVG 必须离线渲染一致，PNG converter 也无法获取字体。

```svg
<style>
  text { font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Noto Sans Mono', 'DejaVu Sans Mono', monospace; }
</style>
```

按角色设置字号：
- **Title：** 16px，weight 700，fill：`var(--text)`
- **Component name：** 11-12px，weight 600，fill：`var(--text)`
- **Sublabel / description：** 9px，weight 400，fill：`var(--text-muted)`
- **Annotation / note：** 8px，weight 400
- **Tiny label（箭头上的标签）：** 7-8px

### Core Visual Elements

**Background + Grid：**

```svg
<defs>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--bg-grid)" stroke-width="0.5"/>
  </pattern>
</defs>
<rect width="100%" height="100%" fill="var(--bg)"/>
<rect width="100%" height="100%" fill="url(#grid)"/>
```

**Arrowhead marker（standard）：**

```svg
<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="var(--arrow)"/>
</marker>
```

**Arrowhead marker（colored）— 按需为每种颜色创建：**

```svg
<marker id="arrow-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary-stroke)"/>
</marker>
```

**Open arrowhead（用于 async/return messages）：**

```svg
<marker id="arrow-open" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="var(--arrow)" stroke-width="1.5"/>
</marker>
```

### SVG Structure & Layering

按以下顺序绘制（SVG 从后向前绘制）：

1. Background fill + grid pattern
2. Region/group boundaries（dashed outlines）
3. Connection arrows 和 lines
4. Opaque masking rects（与 component boxes 同位置，`fill="var(--mask)"`）
5. Component boxes（semi-transparent fill + stroke，通过 CSS variables）
6. Text labels
7. Legend（右下或底部区域，位于所有 boundaries 之外）
8. Title block（左上）

Opaque mask rect 是必需的；否则 semi-transparent component fills 会透出下方箭头：

```svg
<!-- Mask layer: opaque background to hide arrows -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="var(--mask)"/>
<!-- Visual layer: styled component -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="var(--color-primary-fill)" stroke="var(--color-primary-stroke)" stroke-width="1.5"/>
<text x="180" y="125" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">API Gateway</text>
<text x="180" y="141" fill="var(--text-muted)" font-size="9" text-anchor="middle">Kong / Nginx</text>
```

### Spacing Rules

严格遵守以下规则以防止重叠：

- **Component box height：** 50-70px（standard），80-120px（large/complex）
- **Minimum gap between components：** 垂直 40px，水平 30px
- **Arrow label clearance：** 距任何 box edge 10px
- **Region boundary padding：** 距内部所含 components 的边缘 20px
- **Legend placement：** 至少位于最低 diagram element 下方 20px
- **Title block：** 距左上角 20px，位于 diagram content area 之外
- **viewBox：** 始终扩展到容纳所有内容，并在四边留 30px padding

### Component Patterns

**Standard box（service/process）：**

```svg
<rect x="X" y="Y" width="160" height="60" rx="6" fill="var(--mask)"/>
<rect x="X" y="Y" width="160" height="60" rx="6" fill="var(--color-primary-fill)" stroke="var(--color-primary-stroke)" stroke-width="1.5"/>
<text x="CX" y="Y+24" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">Name</text>
<text x="CX" y="Y+40" fill="var(--text-muted)" font-size="9" text-anchor="middle">description</text>
```

**Decision diamond（flowchart）：**

```svg
<g transform="translate(CX, CY)">
  <polygon points="0,-35 50,0 0,35 -50,0" fill="var(--mask)"/>
  <polygon points="0,-35 50,0 0,35 -50,0" fill="var(--color-accent-fill)" stroke="var(--color-accent-stroke)" stroke-width="1.5"/>
  <text y="4" fill="var(--text)" font-size="10" font-weight="600" text-anchor="middle">Condition?</text>
</g>
```

**Database cylinder：**

```svg
<g transform="translate(X, Y)">
  <rect x="0" y="10" width="120" height="50" rx="2" fill="var(--mask)"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="var(--mask)"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="var(--mask)"/>
  <rect x="0" y="10" width="120" height="50" fill="var(--color-tertiary-fill)"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="var(--color-tertiary-fill)" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="var(--color-tertiary-fill)" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <line x1="0" y1="10" x2="0" y2="60" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <line x1="120" y1="10" x2="120" y2="60" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <text x="60" y="40" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">PostgreSQL</text>
</g>
```

**Region boundary：**

```svg
<rect x="X" y="Y" width="W" height="H" rx="12" fill="none" stroke="var(--color-accent-stroke)" stroke-width="1" stroke-dasharray="8,4"/>
<text x="X+12" y="Y+16" fill="var(--color-accent-stroke)" font-size="9" font-weight="600">AWS us-east-1</text>
```

**Security group：**

```svg
<rect x="X" y="Y" width="W" height="H" rx="8" fill="none" stroke="var(--color-alert-stroke)" stroke-width="1" stroke-dasharray="4,4"/>
<text x="X+10" y="Y+14" fill="var(--color-alert-stroke)" font-size="8" font-weight="500">VPC / Security Group</text>
```

## Diagram Types & Layout

将本 SKILL.md 文件所在目录路径确定为 `{baseDir}`。开始 layout 前，如果 `{baseDir}/references/` 中存在该 type 的 reference，先读取它。

| Type | When to use | Reference | Layout key points |
|------|-------------|-----------|-------------------|
| Architecture | System components 与 relationships | `references/architecture.md` | LTR 或 TTB data flow；把相关 services 分组到 region boundaries；层之间使用 buses/connectors；databases 放在底部或右侧 |
| Flowchart | Decision logic、process steps | `references/flowchart.md` | top-to-bottom primary flow；decisions 用 diamonds，exit arrows 标注 Yes/No；start/end 用 rounded rects；happy path 用 Highlight color |
| Sequence | actors 之间按时间排序的 interactions | `references/sequence.md` | actors 作为顶部 boxes，vertical dashed lifelines；horizontal messages（solid=sync，dashed=return）；时间向下流动；activation bars；复杂时给 messages 编号 |
| Structural | Class/ER diagrams、org charts | `references/structural.md` | compartmented boxes（name / attributes / methods）；filled diamond=composition，empty diamond=aggregation，dashed arrow=dependency，solid triangle=inheritance |
| Mind Map | Brainstorming、topic exploration | — | 从 central concept 放射的 layout；cubic-bezier `<path>` branches；变化 branch colors；字号向外递减 |
| Timeline | Chronological events | — | horizontal 或 vertical axis；circle/diamond event markers、period spans；descriptions 交替放在两侧；按 event type 着色 |
| State Machine | State transitions、lifecycle | — | rounded-rect states，composite states 用 double border；filled circle = initial，bullseye = final；curved self-transitions；transitions 标注 `event [guard] / action` |
| Illustrative | Conceptual explanations、comparisons | — | free-form layout、icons、annotations、visual metaphors |
| Data Flow | Data transformation pipelines | — | process bubbles、data stores、external entities |

## Output Rules

1. 每个 SVG 都是 **single file with no external resources**：不要 `@import`、web fonts、remote images 或 scripts
2. 设置 `viewBox` 以容纳所有内容并留 30px padding；不要设置固定 `width`/`height` 属性
3. 在根 `<svg>` 元素上包含 `xmlns="http://www.w3.org/2000/svg"`
4. 将所有 `<style>`、`<defs>`、markers 和 patterns 放在顶部
5. 居中 labels 使用 `text-anchor="middle"`；文本不得溢出 boxes
6. **中文文本：** 使用 `font-family: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', sans-serif'` 并加宽 boxes；CJK 字符更宽
7. **必须使用 CSS variables：** 每个颜色都是 `var(--...)` 引用，theme switching 才能工作
8. **保存位置：** 输入是文件 → `{inputFileDir}/diagram/`；否则 `{projectDir}/diagram/{topic-slug}/`。目录不存在则创建

## Scripts

将本 SKILL.md 文件所在目录路径确定为 `{baseDir}`。Scripts 位于 `{baseDir}/scripts/`：

- `theme-switch.ts` — 用另一 theme 的 variable 值写出 SVG
- `main.ts` — 把 SVG 转换为 @2x PNG
- `flatten-vars.ts` — 把 CSS variables 内联为字面颜色（仅供其他非浏览器工具使用；`main.ts` 会自行处理）

解析 `${BUN_X}` runtime：已安装 `bun` → `bun`；`npx` 可用 → `npx -y bun`；否则建议安装 bun。

### Theme switch

```bash
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light [--output=path/to/output.svg]
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=dark
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=my-brand   # {baseDir}/themes/<name>.json
```

用目标 theme 的值替换 `:root { ... }` 定义；`var(--...)` 引用保持不变，源文件不被修改。不带 `--output` 时，在输入文件旁写出 `<name>.<theme>.svg`。源文件本身已带 dark 值，因此无需对它执行 `--theme=dark`。

### Dependencies

`main.ts` 需要 `sharp`，已在 `{baseDir}/scripts/package.json` 中 pin 并带 lockfile。安装一次：

```bash
cd {baseDir}/scripts && ${BUN_X} install
```

如果缺少 `sharp`，`main.ts` 会停止并报错，错误中给出该命令；它绝不自行安装任何东西。此时先交付 SVG 文件，并告诉用户如何启用 PNG 输出。`theme-switch.ts` 和 `flatten-vars.ts` 没有依赖。

### SVG → @2x PNG

```bash
${BUN_X} {baseDir}/scripts/main.ts <svg-path> [options]
```

Options：
- `-t, --theme <name>` — 用于解析 CSS variables 的 theme（默认 `dark`；任意 `{baseDir}/themes/<name>.json` 均可）
- `-s, --scale <n>` — Scale factor（默认 2）
- `-o, --output <path>` — 自定义输出路径（默认 `<input>@2x.png`）
- `--json` — JSON output

`sharp`（librsvg）不理解 CSS `var()`，因此 `main.ts` 会把每个 `var(--xxx)` 替换为 theme 的字面值，并移除 `:root` block。如果 SVG 引用了 theme 和 SVG 都未定义的 variable，则失败。硬编码颜色的 SVG（legacy diagrams）按原样转换。

如果只想 flatten 而不转换（例如给其他 renderer 使用）：

```bash
${BUN_X} {baseDir}/scripts/flatten-vars.ts <svg-path> <output-path> [--theme=<name>]
```

## Process

1. 识别 diagram type；如果存在对应 reference 文件则读取
2. 规划 layout：列出 components、grouping 和 flow direction，计算位置
3. 按上面的 layering order 写 SVG，颜色只用 CSS variables，`:root { ... }` block 使用 CSS Custom Properties 表中的 dark defaults
4. 验证 spacing rules：无重叠、legends 位于 boundaries 外、viewBox 足够大
5. 保存为 `<name>.svg`（dark 版本）
6. 运行 `${BUN_X} {baseDir}/scripts/theme-switch.ts <name>.svg --theme=light` → `<name>.light.svg`
7. 运行 `${BUN_X} {baseDir}/scripts/main.ts <name>.svg` → `<name>@2x.png`
8. 运行 `${BUN_X} {baseDir}/scripts/main.ts <name>.svg --theme light -o <name>.light@2x.png` → `<name>.light@2x.png`
9. 把 Output Files 中列出的文件展示给用户
