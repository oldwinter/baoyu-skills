# Image Processing Layer

应用于 Xiaohongshu infographics 中图片元素的视觉效果。

## AI Cutout (抠图)

用于产品/人物隔离的主体提取风格。

| Name | 说明 | 使用场景 |
|------|-------------|----------|
| clean | 边缘锐利、边界精确 | 产品摄影、科技物件 |
| soft | 柔和过渡、羽化边缘 | 人像抠图、有机主体 |
| stylized | 手绘边缘处理 | 艺术构图 |

## Stroke Effects (描边)

抠图元素的边框处理。

| Name | 说明 | 使用场景 |
|------|-------------|----------|
| white-solid | 白色实线边框 | 经典 sticker 感、高对比 |
| colored-solid | 彩色实线边框 | 俏皮氛围、品牌色 |
| dashed | 虚线/点线边框 | 手作美学、轻松 |
| double | 双层 stroke | 强调效果、高级感 |
| glow | 柔和外发光 | 梦幻、柔软美学 |
| shadow | Drop shadow effect | 深度、漂浮元素 |

**Stroke 宽度指南**：
- Thin: 2-4px，细微、优雅
- Medium: 5-8px，标准可见性
- Thick: 10-15px，大胆强调

## Filters (滤镜)

XHS 上常见的 color grading 和情绪 presets。

| Name | Chinese | 说明 | Mood |
|------|---------|-------------|------|
| clear-glow | 清透感 | 通透、发光、明亮 | Fresh, youthful |
| film-grain | 胶片感 | Vintage film aesthetic、颗粒纹理 | Nostalgic, artistic |
| cream-skin | 奶油肌 | 平滑、奶油感肤色 | Soft, flattering |
| japanese-magazine | 日杂感 | Lifestyle magazine aesthetic | Curated, aspirational |
| high-saturation | 高饱和 | 鲜艳、有冲击力的颜色 | Energetic, eye-catching |
| muted-tones | 莫兰迪 | Morandi-style 低饱和 palette | Sophisticated, calm |
| warm-tone | 暖色调 | Golden hour 温暖感 | Cozy, inviting |
| cool-tone | 冷色调 | 偏蓝冷感 | Modern, clean |

## Texture Overlays

附加纹理效果。

| Name | 说明 | 使用场景 |
|------|-------------|----------|
| paper | 纸张或织物纹理 | 手作感 |
| noise | 细颗粒噪点 | Analog aesthetic |
| halftone | 圆点图案 | Retro print style |
| scratch | 轻微划痕 | Vintage wear |

## Blending Modes

用于分层构图。

| Mode | 效果 | 使用场景 |
|------|--------|----------|
| multiply | 变暗、融合 | 阴影效果 |
| screen | 变亮、发光 | 光效 |
| overlay | 增强对比 | 鲜艳构图 |
| soft-light | 细微混合 | 自然分层 |

## Effect Combinations

不同 styles 的常见效果栈：

### Cute Style
- Filter: clear-glow or cream-skin
- Stroke: white-solid (medium)
- Texture: none

### Notion Style
- Filter: none or muted-tones
- Stroke: white-solid (thin) or none
- Texture: paper (subtle)

### Retro Style
- Filter: film-grain
- Stroke: double or dashed
- Texture: halftone, scratch

### Bold Style
- Filter: high-saturation
- Stroke: colored-solid (thick)
- Texture: none
