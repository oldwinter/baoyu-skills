# mono-ink

纯白底上的黑色 ink，少量使用语义强调色。

## 背景

- 颜色：Pure White (#FFFFFF)
- 纹理：干净，无颗粒，无染色

## 颜色

| 角色 | 颜色 | Hex | 用途 |
|------|-------|-----|-------|
| Background | Pure White | #FFFFFF | Canvas |
| Primary | Near Black | #1A1A1A | 所有线条、文本、图形、箭头 |
| Accent (risk/emphasis) | Coral Red | #E8655A | 风险、问题、缺口、关键强调 |
| Accent (positive) | Muted Teal | #5FA8A8 | 正向、解决方案、"after" 状态 |
| Accent (neutral tag) | Dusty Lavender | #9B8AB5 | 中性标签、分类标签 |
| Soft Fill | Pale Gray | #F0F0F0 | 细微区域背景（可选） |

## 强调色

所有结构性元素都使用黑色 ink：线条、文本、图形。强调色只用于语义高亮：coral red 用于风险/缺口/问题，muted teal 用于正向/解决方案/after-state，dusty lavender 用于中性分类标签。彩色像素总量必须低于 canvas 的 10%。Pale gray 可以支撑细微区域背景，但绝不能占主导。

## 语义约束

白色 canvas 上使用黑色 ink。强调色仅用于语义高亮，彩色像素总量低于 canvas 的 10%。不要把颜色名称、Hex code 或角色标签渲染为图片中的可见文本。

## 兼容

- `ink-notes` (primary, default pairing)
- `minimal`（严格 monochrome 变体，去掉该 style 内置强调色）
- `sketch`（pencil + ink 混合外观）

## 不推荐搭配

- `sketch-notes`，其“no pure white backgrounds”规则冲突
- `warm`、`elegant`、`watercolor`、`fantasy-animation`，这些风格设计上依赖大量颜色，mono-ink 会削弱它们的身份特征

## 适合

专业视觉笔记、Before/After 文章、技术宣言、框架类比、白板演示式解释内容
