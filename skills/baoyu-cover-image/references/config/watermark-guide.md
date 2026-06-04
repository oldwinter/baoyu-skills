---
name: watermark-guide
description: baoyu-cover-image 的水印配置指南
---

# 水印指南

## 位置示意图

```
┌─────────────────────────────┐
│                  [top-right]│
│                             │
│                             │
│       COVER IMAGE           │
│                             │
│                             │
│[bottom-left][bottom-center][bottom-right]│
└─────────────────────────────┘
```

## 位置建议

| 位置 | 适合 | 避免场景 |
|----------|----------|------------|
| `bottom-right` | 默认选择，最常见 | 标题在右下角 |
| `bottom-left` | 右侧偏重布局 | 关键视觉在左下角 |
| `bottom-center` | 居中设计 | 底部文字密集 |
| `top-right` | 底部偏重内容 | 标题/header 在右上角 |

## 内容格式

| 格式 | 示例 | 风格 |
|--------|---------|-------|
| Handle | `@username` | Social media |
| Domain | `myblog.com` | Cross-platform |
| Brand | `MyBrand` | 简单品牌标识 |
| Chinese | `博客名` | 中文平台 |

## 最佳实践

1. **一致性**：所有 covers 使用同一水印
2. **可读性**：确保水印在明/暗区域都可读
3. **大小**：保持克制，不应干扰内容

## Prompt 集成

启用水印时，在 image generation prompt 中加入：

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting from the main content.
```

## Cover 专属注意事项

| Aspect Ratio | 建议位置 | 说明 |
|--------------|---------------------|-------|
| 2.35:1 | bottom-right | Cinematic，保持角落干净 |
| 16:9 | bottom-right | 标准，位置灵活 |
| 1:1 | bottom-center | 方形，居中通常更好 |

## 常见问题

| 问题 | 解决方案 |
|-------|----------|
| 水印不可见 | 调整位置或检查对比度 |
| 水印过于显眼 | 更改位置或缩小尺寸 |
| 水印与标题重叠 | 更改位置或减少标题区域 |
