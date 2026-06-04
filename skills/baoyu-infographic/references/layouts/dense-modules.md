# dense-modules

高密度模块化 layout，包含 6-7 个带类型的信息模块，并填充具体数据。

## 结构

- 每张图片有 6-7 个不同模块，每个模块服务特定信息功能
- 每个模块都包含具体数据：品牌名、数字、百分比、参数
- 留白最少，紧凑间距优先于呼吸感
- 为最大化信息密度，可接受较小文本
- 每个模块用坐标标签或 section marker 标识（例如 MOD-1、SEC-A）

## Module Archetypes

| 模块 | 用途 | 内容要求 |
|--------|---------|---------------------|
| **Brand/Selection Array** | 带推荐的选项网格 | 4-8 个项目，含图标、名称、简短说明；高亮 "best choice" |
| **Specification Scale** | 质量/测量标尺 | 3-5 个等级，带精确数值增量和质量指示（emoji 表情、勾选） |
| **Deep Dive/Detail** | 关键项目的技术拆解 | 放大 callouts、内部组件、剖面或爆炸图 |
| **Scenario Comparison** | 并列使用场景 | 3-6 个场景，每个场景有具体推荐和数据 |
| **Identification Tips** | How-to checklist | 3-5 个检查方法：look/test/check/ask 格式 |
| **Warning/Pitfall Zone** | 需要避免的关键错误 | 3-5 个 pitfall 及后果，1-2 个正确做法；高视觉对比 |
| **Quick Reference** | 紧凑摘要 | 密集表格、单行摘要、decision flowchart 或 key takeaways |

## Variants

| 变体 | 重点 | 视觉强调 |
|---------|-------|-----------------|
| **Coordinate-labeled** | 精确性和系统性 | 每个模块有字母数字坐标（A-01、B-05、C-12）、尺规/轴线标记 |
| **Grid-cell** | 秩序和结构 | 模块位于严格矩形单元中，用粗线分隔，Swiss grid 感 |
| **Free-flowing** | 有机密度 | 杂志式布局，点线框、不同模块大小，并用箭头连接 |

## Best For

- 产品选择指南和购买指南
- 多维对比内容
- 数据丰富的教育材料
- "Avoid pitfalls" / "complete guide" 格式
- 面向 Xiaohongshu 等有高密度视觉要求平台的内容

## Visual Elements

- 模块边界标记（粗线、点线框或坐标网格）
- 每个模块的质量指示（emoji 表情、勾选、叉号、皇冠）
- 带高亮数字的数据 callout boxes
- 对比箭头和进展指示器
- pitfall 模块的 warning/alert 视觉标记
- 角落 metadata（页码、timestamps、小条码）

## Text Placement

- 主标题位于顶部，醒目且有冲击力
- 副标题包含模块数量（"X大维度全面解析..."）
- 模块标题放在彩色徽章或带标签框内
- 正文紧凑，模块内部可多列
- 数字用强调色高亮，略大于正文

## Information Density Rules

- 每个角落都应包含有用信息或 metadata
- 不要只有装饰作用的空白
- 可缩小文本以容纳更多内容，信息优先于字号
- 每个模块必须有具体数据点，而不是泛泛描述
- 在密度和可读性之间平衡：密集但有组织

## Recommended Pairings

- `pop-laboratory`：带坐标标记和 blueprint grid 的技术精度
- `morandi-journal`：doodle illustration 和有机框架带来的手绘温暖感
- `retro-pop-grid`：1970s pop art，严格网格单元和大胆对比
- `retro-popup-pop`：vintage desktop popups，chunky pixel UI，适合 retro-tech 密集指南
- `corporate-memphis`：适合产品对比的干净商务感
- `technical-schematic`：适合技术产品指南的工程精度
