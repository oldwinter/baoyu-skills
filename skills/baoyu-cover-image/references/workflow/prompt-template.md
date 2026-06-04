# Step 3: Prompt Template

保存到 `prompts/cover.md`：

```markdown
---
type: cover
palette: [confirmed palette]
rendering: [confirmed rendering]
references:
  - ref_id: 01
    filename: refs/ref-01-{slug}.{ext}
    usage: direct | style | palette
  - ref_id: 02
    filename: refs/ref-02-{slug}.{ext}
    usage: direct | style | palette
---

# Content Context
Article title: [full original title from source]
Content summary: [2-3 sentence summary of key points and themes]
Keywords: [5-8 key terms extracted from content]

# Visual Design
Cover theme: [2-3 words visual interpretation]
Type: [confirmed type]
Palette: [confirmed palette]
Rendering: [confirmed rendering]
Font: [confirmed font]
Text level: [confirmed text level]
Mood: [confirmed mood]
Aspect ratio: [confirmed ratio]
Language: [confirmed language]

# Text Elements
[Based on text level:]
- none: "No text elements"
- title-only: "Title: [exact title from source or user]"
- title-subtitle: "Title: [title] / Subtitle: [context]"
- text-rich: "Title: [title] / Subtitle: [context] / Tags: [2-4 keywords]"

# Mood Application
[Based on mood level:]
- subtle: "Use low contrast, muted colors, light visual weight, calm aesthetic"
- balanced: "Use medium contrast, normal saturation, balanced visual weight"
- bold: "Use high contrast, vivid saturated colors, heavy visual weight, dynamic energy"

# Font Application
[Based on font style:]
- clean: "Use clean geometric sans-serif typography. Modern, minimal letterforms."
- handwritten: "Use warm hand-lettered typography with organic brush strokes. Friendly, personal feel."
- serif: "Use elegant serif typography with refined letterforms. Classic, editorial character."
- display: "Use bold decorative display typography. Heavy, expressive headlines."

# Composition
Type composition:
- [Type-specific layout and structure]

Visual composition:
- Main visual: [metaphor derived from content meaning]
- Layout: [positioning based on type and aspect ratio]
- Decorative: [palette-specific elements that reinforce content theme]

Color scheme: [primary, background, accent from palette definition, adjusted by mood]
Color constraint: Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
Rendering notes: [key characteristics from rendering definition — lines, texture, depth, element style]
Type notes: [key characteristics from type definition]
Palette notes: [key characteristics from palette definition]

[Watermark section if enabled]

[Reference images section if provided — REQUIRED, see below]
```

## Reference-Driven Design ⚠️ HIGH PRIORITY

当提供 reference images 时，它们是 **primary visual input**，必须强烈影响输出。Cover 应看起来属于与 references 相同的 visual family。

**只传 `--ref` 不够。** Image generation models 经常忽略 reference images，除非 prompt text 明确描述要复现什么。始终把 `--ref` 与详细 textual instructions 结合使用。

## Content-Driven Design

- Article title 和 summary 决定 visual metaphor choice
- Keywords 指导 decorative elements 和 symbols
- Skill 控制 visual style；content 驱动 meaning

## Visual Element Selection

将 content themes 匹配到 icon vocabulary：

| Content Theme | Suggested Elements |
|---------------|-------------------|
| Programming/Dev | Code window、terminal、API brackets、gear |
| AI/ML | Brain、neural network、robot、circuit |
| Growth/Business | Chart、rocket、plant、mountain、arrow |
| Security | Lock、shield、key、fingerprint |
| Communication | Speech bubble、megaphone、mail、handshake |
| Tools/Methods | Wrench、checklist、pencil、puzzle |

Full library：[../visual-elements.md](../visual-elements.md)

## Type-Specific Composition

| Type | Composition Guidelines |
|------|------------------------|
| `hero` | Large focal visual（60-70% area），title overlay on visual，dramatic composition |
| `conceptual` | Abstract shapes representing core concepts，information hierarchy，clean zones |
| `typography` | Title as primary element（40%+ area），minimal supporting visuals，strong hierarchy |
| `metaphor` | Concrete object/scene representing abstract idea，symbolic elements，emotional resonance |
| `scene` | Atmospheric environment，narrative elements，mood-setting lighting and colors |
| `minimal` | Single focal element，generous whitespace（60%+），essential shapes only |

## Title Guidelines

当 text level 包含 title：

- **Source**：使用用户提供的 exact title，或从 source content 提取
- **Do NOT invent titles**：忠于原文
- 匹配 confirmed language

## Watermark Application

如果 preferences 启用 watermark，把以下内容加入 prompt：

```text
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting from the main content.
```

Reference：`config/watermark-guide.md`

## Reference Image Handling

当用户提供 reference images（`--ref` 或 pasted images）：

### ⚠️ CRITICAL - Frontmatter References

当 reference files 保存到 `refs/` 时，**必须在 YAML frontmatter 中添加 `references` field**：

```yaml
---
type: cover
palette: warm
rendering: flat-vector
references:
  - ref_id: 01
    filename: refs/ref-01-podcast-thumbnail.jpg
    usage: style
---
```

| Field | Description |
|-------|-------------|
| `ref_id` | 顺序编号（01、02、...） |
| `filename` | 相对于 prompt file parent directory 的路径 |
| `usage` | `direct` / `style` / `palette` |

如果没有保存 reference files（只做 verbal style extraction），**完全省略 `references` field**。

### When to Include References in Frontmatter

| Situation | Frontmatter Action | Generation Action |
|-----------|-------------------|-------------------|
| Reference file saved to `refs/` | 添加到 `references` list ✓ | 通过 `--ref` parameter 传入 |
| Style extracted verbally（无 file） | 省略 `references` field | 只在 prompt body 中描述 |
| Frontmatter 中的 file path 不存在 | ERROR：修复或移除 | Generation 会失败 |

**写入带 references 的 prompt 前，先验证**：`test -f refs/ref-NN-{slug}.{ext}`

### Reference Usage Types

| Usage | When to Use | Generation Action |
|-------|-------------|-------------------|
| `direct` | Reference 与目标输出高度接近 | 传给 `--ref` parameter |
| `style` | 只提取 visual style characteristics | 在 prompt text 中描述 style |
| `palette` | 只提取 color palette | 在 prompt 中包含 colors |

### Step 1: Analyze References

对每张 reference image 提取：

- **Style**：Rendering technique、line quality、texture
- **Composition**：Layout、visual hierarchy、focal points
- **Color mood**：Palette characteristics（不含具体 color names 时也要描述）
- **Elements**：使用的 key visual elements 和 symbols

### Step 2: Embed in Prompt ⚠️ CRITICAL

**只传 `--ref` 不够。** Image generation models 经常忽略 reference images，除非 prompt text 明确、强力描述要复现什么。无论是否使用 `--ref`，都必须写出详细 textual instructions。

**如果保存了 file（无论 backend 是否支持 `--ref`）**：

- 如果 skill 支持，把 ref images 通过 `--ref` parameter 传入
- **始终**在 prompt body 添加详细 mandatory section：

```text
# Reference Style — MUST INCORPORATE

CRITICAL: The generated cover MUST visually reference the provided images. The cover must feel like it belongs to the same visual family.

## From Ref 1 ([filename]) — REQUIRED elements:
- [Brand element]: [Specific description of logo/wordmark treatment, e.g., "The logo uses vertical parallel lines (|||) for the letter 'm'. Reproduce this exact treatment."]
- [Signature pattern]: [Specific description, e.g., "Woven intersecting curves forming a diamond/lozenge grid pattern. This MUST appear prominently as a banner, border, or background section."]
- [Colors]: [Exact hex values, e.g., "Dark teal #2D4A3E background, cream #F5F0E0 text"]
- [Typography]: [Specific treatment, e.g., "Uppercase text with wide letter-spacing"]
- [Layout element]: [Specific spatial element, e.g., "Bottom banner strip in dark color"]

## From Ref 1 ([filename]) — Characters (if people present):
- **Character 1**: [Appearance, e.g., "Woman, long wavy blonde hair"] → MUST stylize: [e.g., "flat-vector, simplified face, keep blonde hair, label: 'Nicole Forsgren'"]
- **Character 2**: [Appearance, e.g., "Man, short dark hair, stubble"] → MUST stylize: [e.g., "flat-vector, simplified face, keep dark hair, label: 'Gergely Orosz'"]
- **Placement**: [e.g., "Right third, side by side, facing left toward main visual"]
- **Style**: Match rendering style, NOT photorealistic

## From Ref 2 ([filename]) — REQUIRED elements:
[Same detailed breakdown]

## Integration approach:
[Specific layout instruction describing how reference elements combine with the cover content, e.g., "Use a SPLIT LAYOUT: main illustration area (warm cream background) occupies ~65% of the image, while a dark teal BANNER STRIP (with the woven line pattern from Ref 2) runs along the bottom ~35%, containing branding elements from Ref 1."]
```

**Key rules**：

- 每个 visual element 都单独一条 bullet，并带 "MUST" 或 "REQUIRED"
- Descriptions 必须 **specific enough to reproduce**，不要模糊（例如 "clean style"）
- Integration approach 必须描述 **exact spatial arrangement**
- Generation 后验证 reference elements 是否可见；如不可见，加强 prompt 并 regenerate

**如果 style/palette 是 verbal extraction（没有保存 file）**：

- 不要向 prompt 添加 references metadata
- 直接把 extracted info append 到 prompt body，使用同样的 MUST INCORPORATE format：

```text
# Reference Style — MUST INCORPORATE (extracted from visual analysis)

CRITICAL: Apply these specific visual elements extracted from the reference images.

## REQUIRED elements:
- [Same detailed bullet format as above]

## Integration approach:
[Same spatial layout instruction]
```

### Reference Analysis Template

分析 reference images 时使用该格式。提取 **specific、concrete、reproducible** details，不要写 vague summaries。

| Aspect | Analysis Points | Good Example | Bad Example |
|--------|-----------------|--------------|-------------|
| **Brand elements** | Logos、wordmarks、distinctive typography | "Logo 'm' formed by 3 vertical lines" | "Has a logo" |
| **Signature patterns** | Unique motifs、textures、geometric patterns | "Woven curves forming diamond grid" | "Has patterns" |
| **Colors** | Exact hex values 或近似值 | "#2D4A3E dark teal, #F5F0E0 cream" | "Dark and light" |
| **Layout** | Spatial zones、banner placement、proportions | "Bottom 30% is dark banner with branding" | "Has a banner" |
| **Typography** | Font style、weight、case、spacing、position | "Uppercase, wide letter-spacing, right-aligned" | "Has text" |
| **Rendering** | Line quality、texture、depth treatment | "Topographic contour lines as background texture" | "Clean style" |
| **Elements** | Icon vocabulary、decorative motifs | "Geometric intersecting line ornaments at corners" | "Has decorations" |

**Output**：每个 extracted element 都应写成可 copy-paste 的 prompt instruction，并以 "MUST" 或 "REQUIRED" 开头。
