# Style Presets

`--preset X` 会展开为 style + layout + 可选 palette 的组合。用户可以覆盖任意维度。

| --preset | Style | Layout | Palette |
|----------|-------|--------|---------|
| `knowledge-card` | `notion` | `dense` | |
| `checklist` | `notion` | `list` | |
| `concept-map` | `notion` | `mindmap` | |
| `swot` | `notion` | `quadrant` | |
| `tutorial` | `chalkboard` | `flow` | |
| `classroom` | `chalkboard` | `balanced` | |
| `study-guide` | `study-notes` | `dense` | |
| `cute-share` | `cute` | `balanced` | |
| `girly` | `cute` | `sparse` | |
| `cozy-story` | `warm` | `balanced` | |
| `product-review` | `fresh` | `comparison` | |
| `nature-flow` | `fresh` | `flow` | |
| `warning` | `bold` | `list` | |
| `versus` | `bold` | `comparison` | |
| `clean-quote` | `minimal` | `sparse` | |
| `pro-summary` | `minimal` | `balanced` | |
| `retro-ranking` | `retro` | `list` | |
| `throwback` | `retro` | `balanced` | |
| `pop-facts` | `pop` | `list` | |
| `hype` | `pop` | `sparse` | |
| `poster` | `screen-print` | `sparse` | |
| `editorial` | `screen-print` | `balanced` | |
| `cinematic` | `screen-print` | `comparison` | |
| `hand-drawn-edu` | `sketch-notes` | `flow` | `macaron` |
| `sketch-card` | `sketch-notes` | `dense` | `macaron` |
| `sketch-summary` | `sketch-notes` | `balanced` | `macaron` |

Palette 为空 = 使用 style 内置颜色（或 frontmatter 中定义的 style `default_palette`）。

## 覆盖示例

- `--preset knowledge-card --style chalkboard` = chalkboard style + dense layout
- `--preset poster --layout quadrant` = screen-print style + quadrant layout
- `--preset hand-drawn-edu --palette warm` = sketch-notes style + flow layout，但使用 warm palette 替代 macaron
- `--style notion --palette macaron` = notion 渲染规则 + macaron 颜色

显式 `--style`/`--layout`/`--palette` flags 始终覆盖 preset 值。
