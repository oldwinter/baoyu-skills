---
name: watermark-guide
description: baoyu-comic 的水印配置指南
---

# 水印指南

## 位置示意图

```
┌─────────────────────────────┐
│                  [top-right]│ ← Avoid (conflicts with page numbers)
│                             │
│                             │
│       COMIC PAGE CONTENT    │
│                             │
│                             │
│[bottom-left][bottom-center][bottom-right]│
└─────────────────────────────┘
```

## 位置建议

| 位置 | 适合 | 避免场景 |
|----------|----------|------------|
| `bottom-right` | 默认选择，适合大多数 panel layouts | 关键 panel 在右下角 |
| `bottom-left` | 右侧偏重布局 | 关键 panel 在左下角 |
| `bottom-center` | Webtoon 纵向滚动、居中设计 | 底部文字密集 |
| `top-right` | **不推荐用于 comics** | 始终避免，会与页码冲突 |

## 内容格式

| 格式 | 示例 | 风格 |
|--------|---------|-------|
| Handle | `@username` | Social media style |
| Text | `Studio Name` | 专业品牌标识 |
| Chinese | `漫画工作室` | 中文市场 |
| Initials | `ABC` | Minimal、干净 |

## Comics 最佳实践

1. **Panel-aware placement**：避免覆盖 speech bubbles 或关键动作
2. **一致性**：comic 所有页面使用同一水印
3. **大小**：保持克制，不应干扰 storytelling
4. **风格匹配**：水印风格应补充 comic 的视觉风格
5. **Webtoon special**：纵向滚动格式使用 `bottom-center`

## Prompt 集成

启用水印时，在 image generation prompt 中加入：

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting from the comic panels
and storytelling. Ensure watermark does not overlap speech bubbles or key action.
```

## 常见问题

| 问题 | 解决方案 |
|-------|----------|
| 水印在暗色 panels 上不可见 | 调整对比度或添加细微描边 |
| 水印与 speech bubble 重叠 | 改变位置或下移 |
| 水印跨页面不一致 | 使用 session ID 保持一致性 |
| 水印过于显眼 | 更改位置或缩小尺寸 |
| 与页码冲突 | 永远不要使用 top-right 位置 |
