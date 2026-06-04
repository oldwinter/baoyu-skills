# Style Presets

`--preset X` 会展开为 type + style + optional palette 组合。用户可以覆盖任意维度。

## Default Preset

当内容分析没有发现强信号（通用知识文章、混合主题文章、没有明确 data/comparison/narrative 线索）时，在 Step 3 Q1 中推荐 **`hand-drawn-edu`** 作为 primary option。它是温暖友好的教育信息图默认项，适合多数文章，并且普遍可读。

## By Category

### Technical & Engineering

| --preset | Type | Style | Palette | Best For |
|----------|------|-------|---------|----------|
| `tech-explainer` | `infographic` | `blueprint` | — | API docs、system metrics、技术深潜 |
| `system-design` | `framework` | `blueprint` | — | 架构图、system design |
| `architecture` | `framework` | `vector-illustration` | — | 组件关系、模块结构 |
| `science-paper` | `infographic` | `scientific` | — | 研究发现、实验结果、学术内容 |

### Knowledge & Education

| --preset | Type | Style | Palette | Best For |
|----------|------|-------|---------|----------|
| `knowledge-base` | `infographic` | `vector-illustration` | — | 概念解释、教程、how-to |
| `saas-guide` | `infographic` | `notion` | — | 产品指南、SaaS docs、工具 walkthrough |
| `tutorial` | `flowchart` | `vector-illustration` | — | 分步教程、设置指南 |
| `process-flow` | `flowchart` | `notion` | — | Workflow 文档、onboarding flows |
| `warm-knowledge` | `infographic` | `vector-illustration` | `warm` | 产品展示、团队介绍、feature cards、品牌内容 |
| `edu-visual` | `infographic` | `vector-illustration` | `macaron` | 知识总结、概念解释、教育文章 |
| `hand-drawn-edu` | `infographic` | `sketch-notes` | `macaron` | **默认 preset。** 手绘教育信息图 — 暖奶油纸张、黑色线条、pastel 色块。适合单页解释图、概念总结、onboarding、通用知识文章 |
| `hand-drawn-edu-flow` | `flowchart` | `sketch-notes` | `macaron` | 手绘流程解释图 — 使用同一温暖教育风格呈现 step-by-step workflow |
| `hand-drawn-edu-compare` | `comparison` | `sketch-notes` | `macaron` | 温暖教育风格的手绘并排对比 |
| `ink-notes-compare` | `comparison` | `ink-notes` | `mono-ink` | Before/After essays、Traditional vs New、OS-style comparisons、mindset-shift narratives |
| `ink-notes-flow` | `flowchart` | `ink-notes` | `mono-ink` | 专业流程解释、workforce pipelines、手绘技术 walkthrough |
| `ink-notes-framework` | `framework` | `ink-notes` | `mono-ink` | 系统类比、command-center diagrams、architecture-as-metaphor、tech manifestos |

### Data & Analysis

| --preset | Type | Style | Palette | Best For |
|----------|------|-------|---------|----------|
| `data-report` | `infographic` | `editorial` | — | Data journalism、metrics reports、dashboards |
| `versus` | `comparison` | `vector-illustration` | — | 技术对比、framework shootouts |
| `business-compare` | `comparison` | `elegant` | — | 产品评估、strategy options |

### Narrative & Creative

| --preset | Type | Style | Palette | Best For |
|----------|------|-------|---------|----------|
| `storytelling` | `scene` | `warm` | — | 个人文章、反思、成长故事 |
| `lifestyle` | `scene` | `watercolor` | — | 旅行、wellness、生活方式、创意 |
| `history` | `timeline` | `elegant` | — | 历史概览、milestones |
| `evolution` | `timeline` | `warm` | — | 进展叙事、成长旅程 |

### Editorial & Opinion

| --preset | Type | Style | Palette | Best For |
|----------|------|-------|---------|----------|
| `opinion-piece` | `scene` | `screen-print` | — | Op-eds、commentary、critical essays |
| `editorial-poster` | `comparison` | `screen-print` | — | 辩论、对立观点 |
| `cinematic` | `scene` | `screen-print` | — | 戏剧化叙事、文化文章 |

## Content Type → Preset Recommendations

在 Step 3 中使用此表，根据 Step 2 内容分析推荐 presets：

| Content Type (Step 2) | Primary Preset | Alternatives |
|------------------------|----------------|--------------|
| **General / No strong signal** | `hand-drawn-edu` | `edu-visual`, `knowledge-base` |
| Education / Knowledge | `hand-drawn-edu` | `edu-visual`, `knowledge-base`, `tutorial` |
| Tutorial | `hand-drawn-edu-flow` | `tutorial`, `process-flow`, `hand-drawn-edu` |
| SaaS / Product | `hand-drawn-edu` | `saas-guide`, `knowledge-base`, `process-flow`, `warm-knowledge` |
| Technical | `tech-explainer` | `system-design`, `architecture`, `hand-drawn-edu` |
| Methodology / Framework | `system-design` | `architecture`, `process-flow` |
| Data / Metrics | `data-report` | `versus`, `tech-explainer` |
| Comparison / Review | `versus` | `business-compare`, `hand-drawn-edu-compare`, `editorial-poster`, `ink-notes-compare` |
| Manifesto / Mindset shift / Professional visual note | `ink-notes-compare` | `ink-notes-framework`, `ink-notes-flow` |
| Narrative / Personal | `storytelling` | `lifestyle`, `evolution` |
| Opinion / Editorial | `opinion-piece` | `cinematic`, `editorial-poster` |
| Historical / Timeline | `history` | `evolution` |
| Academic / Research | `science-paper` | `tech-explainer`, `data-report` |

## Override Examples

- `--preset tech-explainer --style notion` = infographic type + notion style
- `--preset storytelling --type timeline` = timeline type + warm style

显式 `--type`/`--style` flags 始终覆盖 preset 值。
