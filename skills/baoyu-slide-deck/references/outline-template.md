# Outline Template

带 style instructions 的 slide deck outline 标准结构。

## Outline Format

```markdown
# Slide Deck Outline

**Topic**: [topic description]
**Style**: [preset name OR "custom"]
**Dimensions**: [texture] + [mood] + [typography] + [density]
**Audience**: [target audience]
**Language**: [output language]
**Slide Count**: N slides
**Generated**: YYYY-MM-DD HH:mm

---

<STYLE_INSTRUCTIONS>
Design Aesthetic: [结合各 dimension 特征的 2-3 句描述]

Background:
  Texture: [from texture dimension]
  Base Color: [from mood dimension palette]

Typography:
  Headlines: [from typography dimension - 描述视觉外观]
  Body: [from typography dimension - 描述视觉外观]

Color Palette:
  Primary Text: [Name] ([Hex]) - [usage]
  Background: [Name] ([Hex]) - [usage]
  Accent 1: [Name] ([Hex]) - [usage]
  Accent 2: [Name] ([Hex]) - [usage]

Visual Elements:
  - [element 1 from texture + mood combination]
  - [element 2 with rendering guidance]
  - ...

Density Guidelines:
  - Content per slide: [from density dimension]
  - Whitespace: [from density dimension]

Style Rules:
  Do: [guidelines from dimension combinations]
  Don't: [anti-patterns from dimension combinations]
</STYLE_INSTRUCTIONS>

---

[Slide entries follow...]
```

## Building STYLE_INSTRUCTIONS from Dimensions

使用 custom dimensions 或 presets 时，通过组合以下内容构建 STYLE_INSTRUCTIONS：

### 1. Design Aesthetic

把四个 dimensions 的特征组合成 2-3 句话：

| Texture | Contribution |
|---------|--------------|
| clean | "Clean, digital precision with crisp edges" |
| grid | "Technical grid overlay with engineering precision" |
| organic | "Hand-drawn feel with soft textures" |
| pixel | "Chunky pixel aesthetic with 8-bit charm" |
| paper | "Aged paper texture with vintage character" |

| Mood | Contribution |
|------|--------------|
| professional | "Professional navy and gold palette" |
| warm | "Warm earth tones creating approachable atmosphere" |
| cool | "Cool analytical blues and grays" |
| vibrant | "Bold, high-saturation colors with energy" |
| dark | "Deep cinematic backgrounds with glowing accents" |
| neutral | "Minimal grayscale sophistication" |

### 2. Background

来自 `references/dimensions/texture.md`：

- Texture description
- Base color from mood palette

### 3. Typography

来自 `references/dimensions/typography.md`：

- Headline visual description（不是 font names）
- Body text visual description（不是 font names）

**Important**：为 image generation 描述外观，例如 "bold geometric sans-serif with perfect circular O shapes"，不要写 "Inter font"。

### 4. Color Palette

来自 `references/dimensions/mood.md`：

- 复制所选 mood 的 palette specifications
- 包含 hex codes 和 usage notes

### 5. Visual Elements

组合 texture 和 mood 特征：

| Combination | Visual Elements |
|-------------|-----------------|
| clean + professional | Clean charts, outlined icons, structured grids |
| grid + cool | Technical schematics, dimension lines, blueprints |
| organic + warm | Hand-drawn icons, brush strokes, doodles |
| pixel + vibrant | Pixel art icons, retro game elements |
| paper + warm | Vintage stamps, aged elements, sepia overlays |

### 6. Density Guidelines

来自 `references/dimensions/density.md`：

- Content per slide limits
- Whitespace requirements
- Element count guidelines

### 7. Style Rules

组合 dimension-specific rules：

**Do rules by texture**：

- clean：保持 sharp edges，使用 grid alignment
- grid：展示 precise measurements，使用 technical diagrams
- organic：允许 imperfection，使用 subtle overlaps 叠层
- pixel：保持 aliased edges，使用 chunky elements
- paper：添加 subtle aging effects，使用 warm tones

**Don't rules by texture**：

- clean：不要使用 hand-drawn elements
- grid：不要使用 organic curves
- organic：不要使用 perfect geometry
- pixel：不要 smooth edges
- paper：不要使用 bright digital colors

## Cover Slide Template

```markdown
## Slide 1 of N

**Type**: Cover
**Filename**: 01-slide-cover.png

// NARRATIVE GOAL
[这张 slide 在 story arc 中达成什么]

// KEY CONTENT
Headline: [main title]
Sub-headline: [supporting tagline]

// VISUAL
[详细视觉描述 - 具体元素、构图、mood]

// LAYOUT
Layout: [optional: layout name from gallery, e.g., title-hero]
[Composition, hierarchy, spatial arrangement]
```

## Content Slide Template

```markdown
## Slide X of N

**Type**: Content
**Filename**: {NN}-slide-{slug}.png

// NARRATIVE GOAL
[这张 slide 在 story arc 中达成什么]

// KEY CONTENT
Headline: [main message - narrative, not label]
Sub-headline: [supporting context]
Body:
- [point 1 with specific detail]
- [point 2 with specific detail]
- [point 3 with specific detail]

// VISUAL
[详细视觉描述]

// LAYOUT
Layout: [optional: layout name from gallery]
[Composition, hierarchy, spatial arrangement]
```

## Back Cover Slide Template

```markdown
## Slide N of N

**Type**: Back Cover
**Filename**: {NN}-slide-back-cover.png

// NARRATIVE GOAL
[有意义的收尾，不只是 "thank you"]

// KEY CONTENT
Headline: [memorable closing statement or call-to-action]
Body: [optional summary points or next steps]

// VISUAL
[强化 core message 的视觉]

// LAYOUT
Layout: [optional: layout name from gallery]
[Clean, impactful composition]
```

## STYLE_INSTRUCTIONS Block

`<STYLE_INSTRUCTIONS>` block 是此 outline 中 style information 的 SINGLE SOURCE OF TRUTH。

| Section | Content | Source |
|---------|---------|--------|
| Design Aesthetic | 整体视觉方向 | Combined from all dimensions |
| Background | Base color 和 texture details | texture + mood dimensions |
| Typography | Font descriptions（视觉描述，不是名称） | typography dimension |
| Color Palette | 带 hex codes 和 usage 的命名颜色 | mood dimension |
| Visual Elements | 带 rendering instructions 的图形元素 | texture + mood dimensions |
| Density Guidelines | Content limits 和 whitespace | density dimension |
| Style Rules | Do/Don't guidelines | Combined from dimensions |

**Important**：

- Typography descriptions 必须描述视觉外观（例如 "rounded sans-serif"、"bold geometric"），因为 image generators 无法使用 font names
- Prompts 应从此 outline 提取 STYLE_INSTRUCTIONS，而不是重新读取 style files

## Preset → Dimensions Reference

使用 preset 时，在 `references/dimensions/presets.md` 中查找 dimensions：

| Preset | Dimensions |
|--------|------------|
| blueprint | grid + cool + technical + balanced |
| sketch-notes | organic + warm + handwritten + balanced |
| corporate | clean + professional + geometric + balanced |
| minimal | clean + neutral + geometric + minimal |
| ... | 完整 mapping 见 presets.md |

## Section Dividers

在以下位置使用 `---`（horizontal rule）：

- Header metadata 和 STYLE_INSTRUCTIONS 之间
- STYLE_INSTRUCTIONS 和第一张 slide 之间
- 每个 slide entry 之间

## Slide Numbering

- Cover 始终是 Slide 1
- Content slides 使用连续编号
- Back Cover 始终是最后一张 slide (N)
- Filename prefix 匹配 slide position：`01-`、`02-` 等

## Filename Slugs

从 slide content 生成有意义的 slugs：

| Slide Type | Slug Pattern | Example |
|------------|--------------|---------|
| Cover | `cover` | `01-slide-cover.png` |
| Content | `{topic-slug}` | `02-slide-problem-statement.png` |
| Back Cover | `back-cover` | `10-slide-back-cover.png` |

Slug rules：

- Kebab-case（小写、hyphens）
- 从 headline 或 main topic 派生
- 最多 30 个字符
- 在 deck 内唯一
