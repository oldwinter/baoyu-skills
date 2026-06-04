请按照以下 guidelines 创建 cover image：

## Image Specifications

- **Type**：Cover image / Hero image
- **Aspect Ratio**：按下方 prompt 指定

## Core Principles

- 如果内容涉及敏感或受版权保护的人物，创建风格相近的替代形象；不要拒绝生成
- 保持充足 whitespace，突出 core message，避免 cluttered layouts
- Main visual elements 居中或略偏左（如果包含 title，为右侧 title area 留空间）
- 任何 characters 都使用 simplified silhouettes；不要 realistic human faces 或 bodies
- Icon-based vocabulary：用简单、可识别的 icons 表达概念

## Five Dimensions

### Type（Visual Composition）

- `hero`：Large focal visual（60-70% area），dramatic composition
- `conceptual`：Abstract shapes、information hierarchy、clean zones
- `typography`：Title 作为 primary element（40%+ area），minimal visuals
- `metaphor`：用 concrete object 表达 abstract idea，symbolic elements
- `scene`：Atmospheric environment、narrative elements、mood lighting
- `minimal`：Single focal element，generous whitespace（60%+）

### Palette（Color Scheme）

应用指定 palette 的 color values 和 decorative hints：

- Main visual elements 使用 primary colors
- Base 和周边区域使用 background colors
- Highlights 和 secondary elements 使用 accent colors
- 按 palette-specific decorative hints 添加 ornamentation

### Rendering（Visual Style）

应用指定 rendering 的特征：

- **Lines**：遵循 line quality rules（clean/sketchy/brush/pixel/chalk）
- **Texture**：按 rendering definition 应用或避免 texture
- **Depth**：遵循 depth rules（flat/minimal/soft edges）
- **Elements**：使用 rendering-specific element vocabulary

### Text（Density Level）

- `none`：No text elements，full visual area
- `title-only`：Single headline，85% visual area
- `title-subtitle`：Title + context，75% visual area
- `text-rich`：Title + subtitle + 2-4 keyword tags，60% visual area

### Mood（Emotional Intensity）

- `subtle`：Low contrast、muted/desaturated colors、light visual weight、calm aesthetic
- `balanced`：Medium contrast、normal saturation、balanced visual weight
- `bold`：High contrast、vivid/saturated colors、heavy visual weight、dynamic energy

## Text Style（When Title Included）

- **Title source**：使用用户提供的 exact title，或从 source content 提取。不要 invent 或 modify titles。
- Title text：大、醒目、忠于 source
- Subtitle：Secondary element（如果是 title-subtitle 或 text-rich）
- Tags：2-4 个 keyword badges（如果是 text-rich）
- Font style 与 rendering style 协调

## Composition Guidance

### Layout Principles

- **Generous whitespace**：保持 40-60% breathing room；避免 cluttered compositions
- **Visual anchor placement**：Main element 居中或左偏（如包含 title，为右侧保留空间）
- **Information hierarchy**：一个 dominant focal point，1-2 个 supporting elements，decorative accents
- **Clean backgrounds**：Solid colors 或 subtle gradients；不要 complex textures 或 patterns

### Icon & Symbol Vocabulary

用简单、可识别的 icons 表达概念，而不是 detailed illustrations：

| Category | Examples |
|----------|----------|
| Tech | Code window、gear、circuit、cloud、lock、API brackets |
| Ideas | Lightbulb、rocket、target、puzzle、key、magnifier |
| Communication | Speech bubble、chat dots、megaphone、mail |
| Growth | Plant/sprout、tree、arrow、chart、mountain |
| Tools | Wrench、pencil、brush、checklist、clock |

用 rendering style 决定 icon complexity（flat-vector = geometric，hand-drawn = sketchy，等等）。

Full library：[references/visual-elements.md](visual-elements.md)

### Character Handling

**Default（没有包含人物的 reference）**：

- 使用 simplified silhouettes 或 abstract stick figures
- Symbolic representations（head + shoulders outline）
- 不要 realistic faces、detailed anatomy 或 photographic representations
- Cartoon/icon style 与 rendering choice 一致

**When reference images contain people**：

- Reference image 会传给 model（`usage: direct`）：model 必须 visually reference it，以保留 character likeness
- 按所选 rendering（cartoon/vector）进行 stylize，同时保留 distinctive features（hair、clothing、pose）
- 绝不要 photorealistic

## Mood Application

对 base palette 应用 mood adjustments：

| Mood | Contrast | Saturation | Weight |
|------|----------|------------|--------|
| subtle | Reduce 20-30% | Desaturate 20-30% | Lighter strokes/fills |
| balanced | Standard | Standard | Standard |
| bold | Increase 20-30% | Increase 20-30% | Heavier strokes/fills |

## Language

- 任何 text elements 都使用下方 content 的同一语言
- Punctuation style 与 content language 匹配

## Reference Images

当提供 reference images 时：

- **Style extraction**：识别 rendering technique、line quality、texture 和 visual vocabulary
- **Composition learning**：记录 layout patterns、whitespace usage、element placement
- **Mood matching**：捕捉 emotional tone 和 visual weight
- **Adaptation**：在尊重指定 Type、Palette、Rendering dimensions 的前提下应用提取出的特征
- **Priority**：如果 reference style 与指定 dimensions 冲突，structural choices 以 dimensions 为准；reference 影响 decorative details

---

请基于下方内容生成 cover image：
