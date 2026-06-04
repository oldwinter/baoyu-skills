# Layout Gallery

单张 slides 的可选 layout hints。在 outline 的 `// LAYOUT` section 中指定。

## Slide-Specific Layouts

| Layout | 说明 | 适合 |
|--------|-------------|----------|
| `title-hero` | 大型居中 title + subtitle | Cover slides、section breaks |
| `quote-callout` | 带 attribution 的 featured quote | Testimonials、key insights |
| `key-stat` | 单个大数字作为 focal point | Impact statistics、metrics |
| `split-screen` | 一半 image，一半 text | Feature highlights、comparisons |
| `icon-grid` | 带 labels 的 icons 网格 | Features、capabilities、benefits |
| `two-columns` | 内容放入均衡 columns | Paired information、dual points |
| `three-columns` | 内容分为三列 | Triple comparisons、categories |
| `image-caption` | Full-bleed image + text overlay | Visual storytelling、emotional |
| `agenda` | 带 highlights 的 numbered list | Session overview、roadmap |
| `bullet-list` | Structured bullet points | Simple content、lists |

## Infographic-Derived Layouts

| Layout | 说明 | 适合 |
|--------|-------------|----------|
| `linear-progression` | 从左到右的 sequential flow | Timelines、step-by-step |
| `binary-comparison` | Side-by-side A vs B | Before/after、pros-cons |
| `comparison-matrix` | Multi-factor grid | Feature comparisons |
| `hierarchical-layers` | Pyramid 或 stacked levels | Priority、importance |
| `hub-spoke` | Central node + radiating items | Concept maps、ecosystems |
| `bento-grid` | 不同尺寸 tiles | Overview、summary |
| `funnel` | 逐级收窄 stages | Conversion、filtering |
| `dashboard` | 带 charts/numbers 的 metrics | KPIs、data display |
| `venn-diagram` | 重叠 circles | Relationships、intersections |
| `circular-flow` | 连续 cycle | Recurring processes |
| `winding-roadmap` | 带 milestones 的 curved path | Journey、timeline |
| `tree-branching` | Parent-child hierarchy | Org charts、taxonomies |
| `iceberg` | Visible vs hidden layers | Surface vs depth |
| `bridge` | Gap with connection | Problem-solution |

**Usage**：在 slide 的 `// LAYOUT` section 中添加 `Layout: <name>`。

## Layout 选择提示

**让 Layout 匹配 Content**：
| Content Type | Recommended Layouts |
|--------------|-------------------|
| Single narrative | `bullet-list`, `image-caption` |
| Two concepts | `split-screen`, `binary-comparison` |
| Three items | `three-columns`, `icon-grid` |
| Process/Steps | `linear-progression`, `winding-roadmap` |
| Data/Metrics | `dashboard`, `key-stat` |
| Relationships | `hub-spoke`, `venn-diagram` |
| Hierarchy | `hierarchical-layers`, `tree-branching` |

**Layout Flow Patterns**：
| Position | Recommended Layouts |
|----------|-------------------|
| Opening | `title-hero`, `agenda` |
| Middle | Content-specific layouts |
| Closing | `quote-callout`, `key-stat` |

**常见错误**：
- 对 2 个 items 使用 3-column layout（会留下空列）
- 将 charts/tables 堆在 text 下方（应改用 side-by-side）
- 使用 image layouts 却没有真实 images
- 为强调而使用 quote layouts（只用于有 attribution 的真实 quotes）
