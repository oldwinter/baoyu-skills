# Structural Diagram Layout

覆盖：class diagrams、ER diagrams、component diagrams、package diagrams、org charts。

## Class Diagram

### Class Box (3-compartment)

```svg
<g transform="translate(X, Y)">
  <!-- Mask -->
  <rect width="180" height="120" rx="6" fill="#0f172a"/>
  <!-- Box -->
  <rect width="180" height="120" rx="6" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1.5"/>
  <!-- Class name compartment -->
  <text x="90" y="24" fill="white" font-size="11" font-weight="700" text-anchor="middle">ClassName</text>
  <!-- Divider 1 -->
  <line x1="0" y1="35" x2="180" y2="35" stroke="#22d3ee" stroke-width="0.5" stroke-opacity="0.5"/>
  <!-- Attributes -->
  <text x="10" y="52" fill="#94a3b8" font-size="8">- id: int</text>
  <text x="10" y="64" fill="#94a3b8" font-size="8">- name: string</text>
  <!-- Divider 2 -->
  <line x1="0" y1="75" x2="180" y2="75" stroke="#22d3ee" stroke-width="0.5" stroke-opacity="0.5"/>
  <!-- Methods -->
  <text x="10" y="92" fill="#94a3b8" font-size="8">+ getName(): string</text>
  <text x="10" y="104" fill="#94a3b8" font-size="8">+ setName(s: string)</text>
</g>
```

对 abstract classes，将 class name 设为 italic。对 interfaces，在 name 上方用更小字体添加 `«interface»`。

### Relationship Lines

| Relationship | Line Style | Arrow/End |
|-------------|------------|-----------|
| Inheritance | Solid | 指向 parent 的 empty triangle (▷) |
| Implementation | Dashed | 指向 interface 的 empty triangle |
| Composition | Solid | owner end 使用 filled diamond (◆) |
| Aggregation | Solid | owner end 使用 empty diamond (◇) |
| Dependency | Dashed | dependency target 使用 open arrowhead |
| Association | Solid | open arrowhead 或无 |

**Markers:**

```svg
<!-- Inheritance triangle -->
<marker id="inherit" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto">
  <polygon points="0 0, 12 5, 0 10" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>
</marker>

<!-- Composition diamond -->
<marker id="composition" markerWidth="12" markerHeight="8" refX="0" refY="4" orient="auto">
  <polygon points="0 4, 6 0, 12 4, 6 8" fill="#94a3b8"/>
</marker>

<!-- Aggregation diamond -->
<marker id="aggregation" markerWidth="12" markerHeight="8" refX="0" refY="4" orient="auto">
  <polygon points="0 4, 6 0, 12 4, 6 8" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>
</marker>
```

### Cardinality Labels

放在 relationship line 的两端，距 box edge 偏移 5-8px：

```svg
<text x="X" y="Y" fill="#94a3b8" font-size="8">1..*</text>
```

## ER Diagram

与 class diagrams 类似，但：
- 使用 2-compartment boxes（entity name + attributes）
- primary keys 使用 `PK` 前缀并加粗
- foreign keys 使用 `FK` 前缀
- relationship lines 使用 crow's foot notation：

```svg
<!-- One end (single line) -->
<line x1="X1" y1="Y" x2="X1+15" y2="Y" stroke="#94a3b8" stroke-width="1.5"/>
<!-- Many end (crow's foot) -->
<line x1="X2-15" y1="Y-6" x2="X2" y2="Y" stroke="#94a3b8" stroke-width="1.5"/>
<line x1="X2-15" y1="Y+6" x2="X2" y2="Y" stroke="#94a3b8" stroke-width="1.5"/>
<line x1="X2-15" y1="Y" x2="X2" y2="Y" stroke="#94a3b8" stroke-width="1.5"/>
```

## Org Chart

- Top-down tree layout
- Root 位于顶部居中
- 每一层均匀间隔（vertical gap 100-120px）
- Siblings 横向均匀分布
- Connection lines：从 parent bottom center 垂直到 horizontal bar，再垂直到每个 child top center
- 使用颜色表示 departments 或 hierarchy levels

## Layout Tips

- 先统计最宽层级，以确定总 diagram width
- 在 viewBox 中横向居中 tree
- 对深树（5+ levels），考虑改用 horizontal layout
