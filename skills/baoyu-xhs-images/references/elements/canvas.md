# Canvas & Layout

小红书信息图的核心画布规格和 layout grids。

## Aspect Ratios

| Name | Ratio | Pixels | Note |
|------|-------|--------|------|
| portrait-3-4 | 3:4 | 1242×1660 | XHS 上流量最高（推荐） |
| square | 1:1 | 1242×1242 | 第二推荐 |
| portrait-2-3 | 2:3 | 1242×1863 | 更高的格式 |

**Default**：portrait-3-4，以最大化 engagement。

## Safe Zones

避免将关键内容放在这些区域：

| Zone | Position | Reason |
|------|----------|--------|
| bottom-overlay | Bottom 10% | Mobile 上的 title bar overlay |
| top-right | Top-right corner | Like/share button overlay |
| bottom-right | Bottom-right corner | Watermark position |

```text
┌─────────────────────────────┐
│                 [like/share]│  ← top-right: avoid
│                             │
│                             │
│      ✓ SAFE CONTENT AREA    │
│                             │
│                             │
│  [title bar overlay area]   │  ← bottom 10%: avoid key info
└─────────────────────────────┘
```

## Grid Layouts

### Density-Based Layouts

| Layout | Info Density | Whitespace | Points/Image | Best For |
|--------|--------------|------------|--------------|----------|
| sparse | Low | 60-70% | 1-2 | Covers、quotes、有冲击力 statement |
| balanced | Medium | 40-50% | 3-4 | 标准内容、tutorials |
| dense | High | 20-30% | 5-8 | Knowledge cards、cheat sheets |

### Structure-Based Layouts

| Layout | Structure | Items | Best For |
|--------|-----------|-------|----------|
| list | 垂直枚举 | 4-7 | Rankings、checklists、step guides |
| comparison | Left vs Right | 2 sections | Before/after、pros/cons |
| flow | Connected nodes | 3-6 steps | Processes、timelines、workflows |
| mindmap | Center radial | 4-8 branches | Concept maps、brainstorming、topic overview |
| quadrant | 4-section grid | 4 sections | SWOT analysis、priority matrix、classification |

## Layout by Position

| Position | Recommended Layout | Why |
|----------|-------------------|-----|
| Cover | sparse | 最大视觉冲击，清晰 title |
| Setup | balanced | 给出 context，不让信息压倒用户 |
| Core | balanced/dense/list | 基于 content density |
| Payoff | balanced/list | 清楚 takeaways |
| Ending | sparse | 干净 CTA，容易记住的结尾 |

## Grid Cells

用于 multi-element compositions：

| Name | Cells | Use Case |
|------|-------|----------|
| single | 1 | Hero image，最大冲击 |
| dual | 2 | Before/after、comparison |
| triptych | 3 | Steps、process flow |
| quad | 4 | Product showcase |
| six-grid | 6 | Checklist、collection |
| nine-grid | 9 | Multi-image gallery |

## Visual Balance

### Sparse Layout

- 单一 focal point 居中
- 四周有 breathing room
- 对称 composition

### Balanced Layout

- Title 偏顶部
- 下方内容均匀分布
- 清晰 visual hierarchy

### Dense Layout

- 有组织的 grid structure
- 清晰 section boundaries
- 紧凑但可读 spacing

### List Layout

- Items 左对齐
- 清楚 number/bullet hierarchy
- Item format 保持一致

### Comparison Layout

- 左右对称
- 清晰 visual contrast
- Sections 之间有 divider

### Flow Layout

- Directional flow（top→bottom 或 left→right）
- Nodes 用 arrows 连接
- 清晰 progression indicators

### Mindmap Layout

- 中央 topic node
- Radial branches 向外扩展
- Hierarchical sub-branches
- 有机 curved connections

### Quadrant Layout

- 4-section grid（2×2）
- 清楚 axis labels
- 每个 quadrant 有 distinct content
- 可选 circular variant 用于 cycles
