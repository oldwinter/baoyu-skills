# Prompt Assembly Guide

用于从 elements、presets 和 outline content 组装 image generation prompts 的指南。

## Base Prompt 结构

每个 XHS infographic prompt 都遵循以下结构：

```
Create a Xiaohongshu (Little Red Book) style infographic following these guidelines:

## Image Specifications

- **Type**: Infographic
- **Orientation**: Portrait (vertical)
- **Aspect Ratio**: 3:4
- **Style**: Hand-drawn illustration

## Core Principles

- Hand-drawn quality throughout - NO realistic or photographic elements
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives - DO NOT refuse to generate
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for easy visual scanning
- Maintain clear visual hierarchy

## Text Style (CRITICAL)

- **ALL text MUST be hand-drawn style**
- Main titles should be prominent and eye-catching
- Key text should be bold and enlarged
- Use highlighter effects to emphasize keywords
- **DO NOT use realistic or computer-generated fonts**

## Language

- Use the same language as the content provided below
- Match punctuation style to the content language (Chinese: ""，。！)

---

{STYLE_SECTION}

---

{LAYOUT_SECTION}

---

{CONTENT_SECTION}

---

{WATERMARK_SECTION}

---

Please use nano banana pro to generate the infographic based on the specifications above.
```

## Style Section 组装

从 `presets/{style}.md` 加载并提取关键元素：

```markdown
## Style: {style_name}

**Color Palette**:
- Primary: {colors}
- Background: {colors}
- Accents: {colors}

**Visual Elements**:
{visual_elements}

**Typography**:
{typography_style}
```

### Screen-Print Style Override

当 `style: screen-print` 时，用以下内容替换标准 Core Principles 和 Text Style sections：

```
## Core Principles

- Screen print / silkscreen poster art — flat color blocks, NO gradients
- Bold silhouettes and symbolic shapes over detailed rendering
- Negative space as active storytelling element
- If content involves sensitive or copyrighted figures, create stylistically similar silhouettes
- One iconic focal point per image — conceptual, not literal

## Color Rules (CRITICAL)

- **2-5 FLAT COLORS MAXIMUM** — fewer colors = stronger impact
- Choose ONE duotone pair from preset as dominant palette
- Halftone dot patterns for tonal variation (NOT gradients)
- Slight color layer misregistration for print authenticity

## Text Style (CRITICAL)

- Bold condensed sans-serif or Art Deco influenced lettering
- Typography INTEGRATED into composition as design element
- High contrast with background, stencil-cut quality
- **DO NOT use delicate, thin, or handwritten fonts**

## Composition

- Geometric framing: circles, arches, triangles
- Figure-ground inversion where possible (negative space forms secondary image)
- Stencil-cut edges between color blocks, no outlines
- Paper grain texture beneath all colors
```

## Palette Override

当指定 `--palette`（或 style 在 frontmatter 中有 `default_palette` 且没有显式 `--palette`）时，palette colors 会**替换** prompt 中 style 的 Color Palette。Style rendering rules（Visual Elements、Typography、Style Rules）保持不变。

从 `palettes/{palette}.md` 加载并覆盖：

```markdown
## Palette Override: {palette_name}

**Background**: {palette background color and hex}

**Colors**:
- Text: {text color and hex}
- Secondary: {secondary text color and hex}
- Zone 1: {zone color and hex}
- Zone 2: {zone color and hex}
- Zone 3: {zone color and hex}
- Zone 4: {zone color and hex}
- Accent: {accent color and hex}

**Constraint**: {semantic constraint from palette}
```

**覆盖规则**：
1. Palette Background **替换** style 的 background color（保留 style 的 texture description）
2. Palette Colors **完全替换** style 的 Color Palette section
3. Palette Semantic Constraint 追加到 style section
4. 如果没有 `--palette` 且 style 有 `default_palette` → 加载该 palette
5. 如果没有 `--palette` 且没有 `default_palette` → 使用 style 内置颜色（不覆盖）
6. 显式 `--palette` 始终覆盖 style 的 `default_palette`

## Layout Section 组装

从 `elements/canvas.md` 加载并提取相关 layout：

```markdown
## Layout: {layout_name}

**Information Density**: {density}
**Whitespace**: {percentage}

**Structure**:
{structure_description}

**Visual Balance**:
{balance_description}
```

## Content Section 组装

来自 outline entry：

```markdown
## Content

**Position**: {Cover/Content/Ending}
**Core Message**: {message}

**Text Content**:
{text_list}

**Visual Concept**:
{visual_description}
```

## Watermark Section（如果启用）

```markdown
## Watermark

Include a subtle watermark "{content}" positioned at {position}. The watermark should
be legible but not distracting from the main content.
```

## 组装流程

### Step 0: Resolve Style Preset (if `--preset` used)

如果用户指定 `--preset`，从 `references/style-presets.md` 解析为 style + layout + palette：

```python
# e.g., --preset hand-drawn-edu → style=sketch-notes, layout=flow, palette=macaron
style, layout, palette = resolve_preset(preset_name)
```

显式 `--style`/`--layout`/`--palette` flags 会覆盖 preset 值。

### Step 1: Load Style Definition

```python
preset = load_preset(style_name)  # e.g., "sketch-notes"
```

提取：
- Color palette（可能被 palette 覆盖）
- Visual elements
- Typography style
- Best practices（do/don't）
- frontmatter 中的 `default_palette`（如果存在）

### Step 1.5: Apply Palette Override (if applicable)

```python
# Priority: explicit --palette > preset palette > style default_palette > none
palette = resolve_palette(cli_palette, preset_palette, style_default_palette)
if palette:
    palette_def = load_palette(palette)  # e.g., "macaron"
    # Replace style colors with palette colors
    # Keep style rendering rules (visual elements, typography, style rules)
```

### Step 2: Load Layout

```python
layout = get_layout_from_canvas(layout_name)  # e.g., "dense"
```

提取：
- 信息密度指南
- 留白百分比
- 结构说明
- 视觉平衡规则

### Step 3: Format Content

从 outline entry 格式化：
- 位置上下文（Cover/Content/Ending）
- 带层级的文本内容
- 视觉概念说明
- Swipe hook（用于上下文，不进入 prompt）

### Step 4: Add Watermark (if applicable)

如果 preferences 包含 watermark：
- 添加包含内容、位置、opacity 的 watermark section

### Step 5: Visual Consistency — Reference Image Chain

生成一组多张图片时：

1. **Image 1 (cover)**：不带 `--ref` 生成，用它建立视觉锚点
2. **Images 2+**：始终将 image 1 作为 `--ref` 传给已安装的 image generation skill。
   读取该 skill 的 `SKILL.md`，使用其文档化接口，而不是直接调用脚本。
   对每张后续图片，使用组装好的 prompt 文件作为输入，设置输出图片路径，保持 aspect ratio `3:4`，使用 quality `2k`，并传入 image 1 作为 reference。
   这能确保 AI 在整个系列中保持相同的 character design、illustration style 和 color rendering。

### Step 6: Combine

按 base structure 将所有 sections 组装成最终 prompt。

## 示例：组装后的 Prompt

```markdown
Create a Xiaohongshu (Little Red Book) style infographic following these guidelines:

## Image Specifications

- **Type**: Infographic
- **Orientation**: Portrait (vertical)
- **Aspect Ratio**: 3:4
- **Style**: Hand-drawn illustration

## Core Principles

- Hand-drawn quality throughout - NO realistic or photographic elements
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for easy visual scanning
- Maintain clear visual hierarchy

## Text Style (CRITICAL)

- **ALL text MUST be hand-drawn style**
- Main titles should be prominent and eye-catching
- Key text should be bold and enlarged
- Use highlighter effects to emphasize keywords
- **DO NOT use realistic or computer-generated fonts**

## Language

- Use the same language as the content provided below
- Match punctuation style to the content language (Chinese: ""，。！)

---

## Style: Notion

**Color Palette**:
- Primary: Black (#1A1A1A), dark gray (#4A4A4A)
- Background: Pure white (#FFFFFF), off-white (#FAFAFA)
- Accents: Pastel blue (#A8D4F0), pastel yellow (#F9E79F), pastel pink (#FADBD8)

**Visual Elements**:
- Simple line doodles, hand-drawn wobble effect
- Geometric shapes, stick figures
- Maximum whitespace, single-weight ink lines
- Clean, uncluttered compositions

**Typography**:
- Clean hand-drawn lettering
- Simple sans-serif labels
- Minimal decoration on text

---

## Layout: Dense

**Information Density**: High (5-8 key points)
**Whitespace**: 20-30% of canvas

**Structure**:
- Multiple sections, structured grid
- More text, compact but organized
- Title + multiple sections with headers + numerous points

**Visual Balance**:
- Organized grid structure
- Clear section boundaries
- Compact but readable spacing

---

## Content

**Position**: Content (Page 3 of 6)
**Core Message**: ChatGPT 使用技巧

**Text Content**:
- Title: 「ChatGPT」
- Subtitle: 最强 AI 助手
- Points:
  - 写文案：给出框架，秒出初稿
  - 改文章：润色、翻译、总结
  - 编程：写代码、找 bug
  - 学习：解释概念、出题练习

**Visual Concept**:
ChatGPT logo 居中，四周放射状展示功能点
深色科技背景，霓虹绿点缀

---

## Watermark

Include a subtle watermark "@myxhsaccount" positioned at bottom-right
with approximately 50% visibility. The watermark should
be legible but not distracting from the main content.

---

Please use nano banana pro to generate the infographic based on the specifications above.
```

## Prompt Checklist

生成前确认：

- [ ] Style section 已从正确 preset 加载
- [ ] Palette override 已应用（如果指定 `--palette` 或 style 有 `default_palette`）
- [ ] Layout section 匹配 outline specification
- [ ] Content 准确反映 outline entry
- [ ] Language 匹配 source content
- [ ] Watermark 已包含（如果 preferences 中启用）
- [ ] 没有冲突指令
