# Confirmation Questions

确认步骤使用的具体选项文案。SKILL.md 说明要问哪些问题；此文件提供 Claude Code 中使用的 verbatim options。可根据 runtime 的原生 user-input tool 调整措辞；意图比精确 wording 更重要。

## Round 1 (Always)

将五个问题合并到一次 `AskUserQuestion` 调用中。

### Q1: Style

```yaml
header: Style
question: 这组 deck 使用哪种视觉 style？
options:
  - label: "{recommended_preset} (Recommended)"
    description: 基于内容分析的最佳匹配
  - label: "{alternative_preset}"
    description: "{alternative style description}"
  - label: Custom dimensions
    description: 分别选择 texture、mood、typography、density
```

### Q2: Audience

```yaml
header: Audience
question: 主要读者是谁？
options:
  - label: General readers (Recommended)
    description: 面向广泛读者，内容易懂
  - label: Beginners/learners
    description: 偏教育导向，解释清晰
  - label: Experts/professionals
    description: 技术深度，假设具备领域知识
  - label: Executives
    description: 高层 insight，细节最少
```

### Q3: Slide Count

```yaml
header: Slides
question: 需要多少张 slides？
options:
  - label: "{N} slides (Recommended)"
    description: 基于内容长度推荐
  - label: "Fewer ({N-3} slides)"
    description: 更浓缩，细节更少
  - label: "More ({N+3} slides)"
    description: 拆解更细，信息更完整
```

### Q4: Review Outline

```yaml
header: Outline
question: 生成 prompts 前是否 review outline？
options:
  - label: Yes, review outline (Recommended)
    description: Review slide titles 和结构
  - label: No, skip outline review
    description: 直接进入 prompt generation
```

### Q5: Review Prompts

```yaml
header: Prompts
question: 生成 images 前是否 review prompts？
options:
  - label: Yes, review prompts (Recommended)
    description: Review image generation prompts
  - label: No, skip prompt review
    description: 直接进入 image generation
```

## Round 2 — Custom Dimensions

仅当 Round 1 的 Q1 = "Custom dimensions" 时触发。将四个 dimension 问题合并提问。

### Texture

```yaml
header: Texture
question: 选择哪种 visual texture？
options:
  - label: clean
    description: 纯色，无 texture
  - label: grid
    description: 细微 grid overlay，技术感
  - label: organic
    description: 柔和 textures，手绘感
  - label: pixel
    description: Chunky pixels，8-bit 美学
```

`paper` 也有效，通过 "Other" 接受。

### Mood

```yaml
header: Mood
question: 选择哪种 color mood？
options:
  - label: professional
    description: 冷中性色，navy/gold
  - label: warm
    description: Earth tones，友好
  - label: cool
    description: Blues、grays，分析感
  - label: vibrant
    description: 高饱和、大胆
  - label: macaron
    description: 奶油底上的 pastel 色块
```

`dark`、`neutral` 可通过 "Other" 输入。

### Typography

```yaml
header: Typography
question: 选择哪种 typography style？
options:
  - label: geometric
    description: 现代 sans-serif，干净
  - label: humanist
    description: 友好、可读
  - label: handwritten
    description: Marker/brush，有机感
  - label: editorial
    description: Magazine style，戏剧感
```

`technical` 可通过 "Other" 输入。

### Density

```yaml
header: Density
question: 信息密度？
options:
  - label: balanced (Recommended)
    description: 每张 slide 2-3 个关键点
  - label: minimal
    description: 一个焦点，最大化留白
  - label: dense
    description: 多个 data points，紧凑
```

## Outline Review (Step 4)

```yaml
header: Confirm
question: 准备好生成 prompts 了吗？
options:
  - label: Yes, proceed (Recommended)
    description: 生成 image prompts
  - label: Edit outline first
    description: 我会先修改 outline.md 再继续
  - label: Regenerate outline
    description: 用不同 approach 创建新 outline
```

## Prompt Review (Step 6)

```yaml
header: Confirm
question: 准备好生成 slide images 了吗？
options:
  - label: Yes, proceed (Recommended)
    description: 生成所有 slide images
  - label: Edit prompts first
    description: 我会先修改 prompts 再继续
  - label: Regenerate prompts
    description: 用不同 approach 创建新 prompts
```

## Existing Content (Step 1.3)

```yaml
header: Existing
question: 发现已有内容。如何继续？
options:
  - label: Regenerate outline
    description: 保留 images，只重新生成 outline
  - label: Regenerate images
    description: 保留 outline，只重新生成 images
  - label: Backup and regenerate
    description: 备份到 {slug}-backup-{timestamp}，然后全部重新生成
  - label: Exit
    description: 取消，保持已有内容不变
```
