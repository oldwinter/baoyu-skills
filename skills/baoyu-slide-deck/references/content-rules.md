# Content & Style Rules

用于保障 slide deck 内容质量和 style consistency 的准则。

## Content Rules

### 1. Respect Reader Attention
- 每张 slide 应传达一个 main idea
- 移除冗余信息
- 优先保证清晰，而不是追求面面俱到

### 2. Data Traceability
- 所有统计数据必须包含 source attribution
- 含数据的 slides 需直接标注来源
- 使用具体数字，而不是模糊说法

### 3. Self-Contained Prompts
- 每个细节都必须出现在 image prompt 中
- 不要使用外部引用（如 "like slide 2"）
- 明确包含所有 colors、layouts 和 content

### 4. No Placeholders
- 每个元素都必须完整指定
- 不要出现 "[insert data here]" 或 "TBD"
- 所有 text content 必须在生成前定稿

## Style Rules

### 1. Narrative Headlines
Headlines 要讲故事，而不是给内容贴标签。

| Bad | Good |
|-----|------|
| "Key Statistics" | "Usage doubled in 6 months" |
| "Our Solution" | "One platform replaces five tools" |
| "Benefits" | "Teams save 10 hours weekly" |

### 2. Avoid AI Clichés
移除这些表达模式：
- "Dive into", "explore", "journey"
- "Let's look at", "let me show you"
- "Exciting", "amazing", "revolutionary"
- "In conclusion", "to summarize"

### 3. Meaningful Back Cover
不要只是 "Thank you" 或 "Questions?"

包含以下之一：
- 清晰的 call-to-action
- 令人记住的 key takeaway
- 引发思考的 closing statement
- 带明确目的的 contact information

### 4. Consistent Visual Language
贯穿整个 deck：
- 相同 icon style
- 相同 color usage patterns
- 相同 layout grid system
- 相同 typography hierarchy

## Slide Structure

| Position | Type | 用途 |
|----------|------|---------|
| 1 | Cover | Title、visual hook、topic introduction |
| 2 to N-1 | Content | Key points、data、explanations |
| N | Back Cover | Summary、call-to-action、memorable close |

## Key Specifications

| Specification | Value |
|---------------|-------|
| Aspect Ratio | 16:9 (landscape) |
| Slide Count | 基于内容动态确定 |
| Required Slides | Cover + Back Cover minimum |
| Footers | None (no slide numbers, logos) |
| Language Priority | `--lang` → source language → ask user |
| Tone | 直接、自信（避免 AI phrases） |

## Style Quick Reference

| Style | Visual Summary |
|-------|----------------|
| `sketch-notes` | Hand-drawn、warm off-white、conceptual icons |
| `blueprint` | Technical schematics、grid texture、blue tones |
| `bold-editorial` | High contrast、dark backgrounds、magazine impact |
| `vector-illustration` | Flat vector、black outlines、retro colors |
| `minimal` | 最大 whitespace、single accent、zen-like |
| `storytelling` | Full-bleed imagery、cinematic、emotional |
| `warm` | Soft gradients、rounded shapes、wellness palette |
| `notion` | Dashboard aesthetic、clean data viz、SaaS-inspired |
| `corporate` | Navy/gold、structured layouts、business polish |
| `playful` | Vibrant coral/teal/yellow、dynamic、energetic |

完整 style specifications：`references/styles/<style>.md`
