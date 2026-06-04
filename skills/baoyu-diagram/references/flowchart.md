# Flowchart Layout

## Shape Vocabulary

| Shape | 含义 | SVG Element |
|-------|---------|-------------|
| Rounded rect (large radius) | Start / End | `<rect rx="25">` |
| Rectangle | Process / Action | `<rect rx="6">` |
| Diamond | Decision | `<polygon>` rotated 45° |
| Parallelogram | Input / Output | `<polygon>` with skew |
| Cylinder | Data store | Ellipse + rect combo |

## Flow Direction

Primary flow：**top to bottom**。Branch flows 从 decisions 向左/右展开。

## Layout Algorithm

1. **识别 main path**（happy path / most common flow），它沿中心直线向下
2. **从 decisions 分支**："Yes" 沿中心继续向下，"No" 向右分支（空间紧张时向左）
3. **合并 paths**：使用 L-shaped connectors 将 branches 路由回 main path
4. **Loop-backs**：在 diagram 最左/右侧用 curved paths 向上路由

## Spacing

- Step-to-step vertical gap：60-80px（足够容纳 arrow + optional label）
- Decision diamond height：70px（point to point）
- Decision diamond width：100px（point to point）
- Branch horizontal offset：距中心 200px
- Merge connector clearance：距任意 box 20px

## Decision Labels

将 "Yes" / "No"（或 "True" / "False"、"是" / "否"）labels 直接放在 exit arrows 上，距 diamond edge 10px：

```svg
<!-- Decision diamond at center (400, 200) -->
<!-- Yes: downward -->
<line x1="400" y1="235" x2="400" y2="300" stroke="#64748b" marker-end="url(#arrow)"/>
<text x="412" y="260" fill="#34d399" font-size="8">Yes</text>

<!-- No: rightward -->
<line x1="450" y1="200" x2="550" y2="200" stroke="#64748b" marker-end="url(#arrow)"/>
<text x="480" y="193" fill="#fb7185" font-size="8">No</text>
```

## Coloring Strategy

- **Start/End nodes:** Highlight color（blue）
- **Process steps:** Primary（cyan）或 Secondary（emerald）
- **Decision diamonds:** Accent（amber），自然吸引视线
- **Error/exception paths:** Alert（rose）dashed arrows
- **Happy path arrows:** 比 branch arrows 略亮（通过 `stroke-opacity` 区分）

## Complex Flowcharts

对于 10+ steps 的 flowcharts：
- 将相关 steps 分组到 swim lanes（带 header bars 的 vertical columns）
- 在每个 swim lane 顶部添加 "phase" row header
- 对 swim lanes 使用 Architecture 中的 region boundary pattern
