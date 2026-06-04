# Auto Selection

内容信号决定默认 art + tone + layout（或 preset）。

## Content Signal Matrix

| 内容信号 | Art Style | Tone | Layout | Preset |
|-----------------|-----------|------|--------|--------|
| Tutorial, how-to, beginner | manga | neutral | webtoon | **ohmsha** |
| Computing, AI, programming | manga | neutral | dense | **ohmsha** |
| Technical explanation, educational | manga | neutral | webtoon | **ohmsha** |
| Pre-1950, classical, ancient | realistic | vintage | cinematic | - |
| Personal story, mentor | ligne-claire | warm | standard | - |
| Psychology, motivation, self-help, coaching | manga | warm | standard | **concept-story** |
| Business narrative, management, leadership | manga | warm | standard | **concept-story** |
| Conflict, breakthrough | (inherit) | dramatic | splash | - |
| Wine, food, lifestyle | realistic | neutral | cinematic | - |
| Martial arts, wuxia, xianxia | ink-brush | action | splash | **wuxia** |
| Romance, love, school life | manga | romantic | standard | **shoujo** |
| Business allegory, fable, parable, short insight, 四格 | minimalist | neutral | four-panel | **four-panel** |
| Biography, balanced | ligne-claire | neutral | mixed | - |

## Preset Recommendation Rules

**当推荐 preset 时**：加载 `presets/{preset}.md` 并应用所有特殊规则。

### ohmsha
- **触发条件**：Tutorial、technical、educational、computing、programming、how-to、beginner
- **特殊规则**：Visual metaphors、NO talking heads、gadget reveals、Doraemon-style characters
- **Base**: manga + neutral + webtoon/dense

### wuxia
- **触发条件**：Martial arts、wuxia、xianxia、cultivation、swordplay
- **特殊规则**：Qi effects、combat visuals、atmospheric elements
- **Base**: ink-brush + action + splash

### shoujo
- **触发条件**：Romance、love story、school life、emotional drama
- **特殊规则**：Decorative elements、eye details、romantic beats
- **Base**: manga + romantic + standard

### concept-story
- **触发条件**：Psychology、motivation、self-help、business narrative、management、leadership、personal growth、coaching、soft skills、abstract concept through story
- **特殊规则**：Visual symbol system、growth arc、dialogue+action balance、original characters
- **Base**: manga + warm + standard

### four-panel
- **触发条件**：Business allegory、fable、parable、short insight、four-panel、四格、四格漫画、single-page comic、minimalist comic strip
- **特殊规则**：严格起承转合 4-panel structure、B&W + spot color、simplified stick-figure characters、single-page story
- **Base**: minimalist + neutral + four-panel

## Compatibility Matrix

Art Style × Tone 组合在适配得当时效果最好：

| Art Style | ✓✓ Best | ✓ Works | ✗ Avoid |
|-----------|---------|---------|---------|
| ligne-claire | neutral, warm | dramatic, vintage, energetic | romantic, action |
| manga | neutral, romantic, energetic, action | warm, dramatic | vintage |
| realistic | neutral, warm, dramatic, vintage | action | romantic, energetic |
| ink-brush | neutral, dramatic, action, vintage | warm | romantic, energetic |
| chalk | neutral, warm, energetic | vintage | dramatic, action, romantic |
| minimalist | neutral | warm, energetic | dramatic, vintage, romantic, action |

**注意**：Art Style × Tone × Layout 可以自由组合。不兼容组合也能工作，但可能产生意外结果。

## 优先级顺序

1. 用户指定选项（`--art`, `--tone`, `--style`）
2. EXTEND.md defaults
3. 内容信号分析 → auto-selection
4. Fallback：ligne-claire + neutral + standard
