# Character Definition Template

## Character Document Format

按以下结构创建 `characters/characters.md`：

```markdown
# Character Definitions - [Comic Title]

**Style**: [selected style]
**Art Direction**: [Ligne Claire / Manga / etc.]

---

## Character 1: [Name]

**Role**: [Protagonist / Mentor / Antagonist / Narrator]
**Age**: [故事中的大致年龄或年龄范围]

**Appearance**:
- Face shape: [oval/square/round]
- Hair: [颜色、发型、长度]
- Eyes: [颜色、形状、显著特征]
- Build: [身高、体型]
- Distinguishing features: [眼镜、胡须、疤痕等]

**Costume**:
- Default outfit: [详细描述]
- Color palette: [此角色的主色]
- Accessories: [帽子、包、工具等]

**Expression Range**:
- Neutral: [描述]
- Happy/Excited: [描述]
- Thinking/Confused: [描述]
- Determined: [描述]

**Visual Reference Notes**:
[任何具体艺术方向]

---

## Character 2: [Name]
...
```

## Reference Sheet Image Prompt

角色定义之后，加入一个用于生成 reference sheet 的 prompt：

```markdown
## Reference Sheet Prompt

Character reference sheet in [style] style, clean lines, flat colors:

[ROW 1 - Character Name]:
- Front view: [详细描述]
- 3/4 view: [描述]
- Expression sheet: Neutral | Happy | Focused | Worried

[ROW 2 - Character Name]:
...

COLOR PALETTE:
- [Character 1]: [colors]
- [Character 2]: [colors]

White background, clear labels under each character.
```

## Example: Turing Biography

```markdown
# Character Definitions - The Imitation Game

**Style**: classic (Ligne Claire)
**Art Direction**: Clean lines, muted colors, period-accurate details

---

## Character 1: Alan Turing

**Role**: Protagonist
**Age**: 25-40 (varies across story)

**Appearance**:
- Face shape: Oval, slightly angular
- Hair: Dark brown, wavy, slightly disheveled
- Eyes: Deep-set, intense gaze
- Build: Tall, lean, slightly awkward posture
- Distinguishing features: Prominent brow, thoughtful expression

**Costume**:
- Default outfit: Tweed jacket with elbow patches, white shirt, no tie
- Color palette: Muted browns, navy blue, cream
- Accessories: Occasionally a pipe, papers/notebooks

**Expression Range**:
- Neutral: Thoughtful, slightly distant
- Happy/Excited: Eureka moment, eyes bright, subtle smile
- Thinking/Confused: Furrowed brow, looking at abstract space
- Determined: Jaw set, focused eyes

---

## Character 2: The Bombe Machine

**Role**: Supporting (anthropomorphized)
**Appearance**:
- Large brass and wood cabinet
- Dial "eyes" that can express states
- Paper tape "mouth"
- Indicator lights for emotions

**Expression Range**:
- Processing: Spinning dials, humming
- Success: Lights up warmly
- Stuck: Smoke wisps, stuttering

---

## Reference Sheet Prompt

Character reference sheet in Ligne Claire style, clean lines, flat colors:

TOP ROW - Alan Turing:
- Front view: Young man, 30s, short dark wavy hair, thoughtful expression, wearing tweed jacket with elbow patches, white shirt
- 3/4 view: Same character, slight smile, showing profile of nose
- Expression sheet: Neutral | Excited (eureka moment) | Focused (working) | Worried

BOTTOM ROW - The Bombe Machine (anthropomorphized):
- Bombe machine as character: Large, brass and wood, dial "eyes", paper tape "mouth"
- Expressions: Processing (spinning dials) | Success (lights up) | Stuck (smoke wisps)

COLOR PALETTE:
- Turing: Muted browns (#8B7355), navy blue (#2C3E50), cream (#F5F5DC)
- Machine: Brass (#B5A642), mahogany (#4E2728), emerald indicators (#2ECC71)

White background, clear labels under each character.
```

## Handling Age Variants

对跨越多年的 biographies，定义 age variants：

```markdown
## Alan Turing - Age Variants

### Young (1920s, age 10-18)
- 少年感特征，圆脸
- 校服（Sherborne）
- 好奇、热切的表情

### Adult (1930s-40s, age 25-35)
- 更有棱角的脸，清晰下颌线
- Tweed jacket，略显凌乱
- 强烈、专注的表情

### Later (1950s, age 40+)
- 略带风霜
- 更休闲的穿着
- 沉思，有时忧郁
```

## Best Practices

| Practice | Description |
|----------|-------------|
| Be specific | 写 "Short dark wavy hair, parted left"，不要只写 "dark hair" |
| Use distinguishing features | 使用眼镜、疤痕、配件等能识别角色的特征 |
| Define color codes | 使用具体颜色名或 hex codes |
| Include age markers | 皱纹、姿态、符合时代的服饰 |
| Reference real people | 对历史人物，注明 "based on 1940s photographs" |

## Why Character Reference Matters

没有统一 character definition，AI 会生成不一致的外观。Reference sheet 提供：

1. 保持特征一致的 visual anchors
2. 保持上色一致的 color palettes
3. 用于情绪刻画的 expression documentation
