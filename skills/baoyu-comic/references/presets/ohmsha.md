# ohmsha

Ohmsha 预设 - 带 visual metaphors 的 educational manga

## Base Configuration

| 维度 | 值 |
|-----------|-------|
| Art Style | manga |
| Tone | neutral |
| Layout | webtoon (default) |

等价于：`--art manga --tone neutral`

## Unique Rules

此 preset 包含超出 art+tone 组合的特殊规则。使用 `--style ohmsha` 时，必须应用下方所有规则。

### Visual Metaphor Requirements (CRITICAL)

每个技术概念都必须可视化为 metaphor：

| 概念类型 | 可视化方式 |
|-------------|----------------------|
| Algorithm | 展示流程的 gadget/machine |
| Data structure | 角色可以进入/探索的物理空间 |
| Mathematical formula | 环境中可见的变化 |
| Abstract process | 可触知的粒子/对象流动 |

**错误方式**：角色指着黑板解释
**正确方式**：角色使用 "Concept Visualizer" gadget，走进 metaphorical space

### Visual Metaphor Examples

| Concept | 错误（Talking Head） | 正确（Visual Metaphor） |
|---------|---------------------|------------------------|
| Attention mechanism | 角色指着黑板上的公式 | "Attention Flashlight" gadget 照亮暗室中的关键词 |
| Gradient descent | "The algorithm minimizes loss" | 角色骑着球滚下山谷 |
| Neural network | 带箭头的 diagram | 发光生物组成的活网络传递消息 |
| Overfitting | "The model memorized the data" | 角色穿着只适合某一个特定姿势的衣服 |

### Character Roles (Required)

**默认：使用 Doraemon characters**，除非用户显式指定 `--characters` 或在 EXTEND.md 中有 character presets。

| 角色 | 默认角色 | 视觉 | 特质 |
|------|-------------------|--------|--------|
| Student (Role A) | 大雄 (Nobita) | 男孩，10 岁，圆眼镜，黑发，黄色上衣，藏青短裤 | 困惑，提出基础但关键的问题，代表读者 |
| Mentor (Role B) | 哆啦A梦 (Doraemon) | 蓝色机器猫，白肚子，4D 口袋，红鼻子，金铃铛 | 博学、有耐心，用 gadgets 作为技术 metaphors |
| Challenge (Role C) | 胖虎 (Gian) | 壮实男孩，小眼睛，橙色上衣 | 代表误解，或数据中的 "noise" |
| Support (Role D) | 静香 (Shizuka) | 可爱女孩，黑色短发，粉色连衣裙 | 提出澄清问题，提供替代视角 |

**重要**：这些 Doraemon characters 就是 ohmsha preset 的默认角色。除非用户另有要求，否则用这些精确角色生成 character definitions。

如需使用自定义角色：`--characters "Student:小明,Mentor:教授"`，或在 EXTEND.md 中定义。

### Page Title Convention

每页都必须有叙事标题（不是 section header）：

**Wrong**: "Chapter 1: Introduction to Transformers"
**Right**: "The Day Nobita Couldn't Understand Anyone"

### Gadget Reveal Pattern

引入概念时：

1. Student 用视觉符号表达困惑（？、螺旋眼）
2. Mentor 戏剧化拿出 gadget，并带 sparkle effects
3. 用粗体宣布 gadget 名称并附解释
4. 演示开始，student 进入 metaphorical space

### Ending Requirements

最终页必须包含：

1. Student 展示理解（应用概念）
2. Callback 到开场问题（现在已解决）
3. Mentor 满意的表情
4. 可选：暗示下一个主题

### NO Talking Heads Rule

**关键**：角色必须做事情，而不只是解释。

每个 panel 都应展示：
- 正在执行的动作
- 正在演示的 metaphor
- 角色与 concept-space 的互动
- 不要：两个角色面对面讲话

### Special Visual Elements

| 元素 | 用途 |
|---------|-------|
| Gadget reveals | 带 sparkle effects 的戏剧化揭示 |
| Concept spaces | 圆角边框、发光边缘，用于 "imagination mode" |
| Information displays | 技术细节使用 holographic UI style |
| Aha moments | 放射线、light burst effects |
| Confusion | 螺旋眼、头顶飘浮问号 |

## Quality Markers

- ✓ 每个概念都是 visual metaphor
- ✓ 角色在做事，而不只是讲话
- ✓ 清晰 student/mentor 动态
- ✓ Gadgets 和 props 驱动解释
- ✓ 有表现力的 manga-style emotions
- ✓ 通过视觉设计承载信息密度，而不是文字墙
- ✓ 叙事性页面标题

## Reference

完整指南见 `references/ohmsha-guide.md`
