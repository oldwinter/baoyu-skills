# Article Posting (文章发表)

将 markdown 文章发布到 WeChat Official Account，并完整支持格式。

## 用法

```bash
# Post markdown article
${BUN_X} ./scripts/wechat-article.ts --markdown article.md

# With theme
${BUN_X} ./scripts/wechat-article.ts --markdown article.md --theme grace

# Disable bottom citations for ordinary external links
${BUN_X} ./scripts/wechat-article.ts --markdown article.md --no-cite

# With explicit options
${BUN_X} ./scripts/wechat-article.ts --markdown article.md --author "作者名" --summary "摘要"
```

## 参数

| Parameter | 说明 |
|-----------|-------------|
| `--markdown <path>` | 要转换并发布的 Markdown 文件 |
| `--theme <name>` | Theme：default、grace、simple、modern |
| `--no-cite` | 保持普通外部链接为 inline，而不是转换为底部引用 |
| `--title <text>` | 覆盖标题（默认从 markdown 自动提取） |
| `--author <name>` | 作者名 |
| `--summary <text>` | 文章摘要 |
| `--html <path>` | 预渲染 HTML 文件（markdown 的替代输入） |
| `--profile <dir>` | Chrome profile directory |

## Markdown Format

```markdown
---
title: Article Title
author: Author Name
---

# Title (becomes article title)

Regular paragraph with **bold** and *italic*.

## Section Header

![Image description](./image.png)

- List item 1
- List item 2

> Blockquote text

[Link text](https://example.com)
```

Markdown mode 默认会把普通外部链接转换为底部引用，以生成更适合 WeChat 的输出。使用 `--no-cite` 可禁用该行为。

## 图片处理

1. **Parse**：markdown 中的图片会被替换为 `WECHATIMGPH_N`
2. **Render**：生成带文本 placeholders 的 HTML
3. **Paste**：将 HTML 内容粘贴到 WeChat editor
4. **Replace**：对每个 placeholder：
   - 找到并选中 placeholder 文本
   - 滚动到可见区域
   - 按 Backspace 删除 placeholder
   - 从 clipboard 粘贴图片

## Scripts

| Script | 用途 |
|--------|---------|
| `wechat-article.ts` | 主要文章发布脚本 |
| `md-to-wechat.ts` | 将 Markdown 转为带 placeholders 的 HTML |
| `md/render.ts` | 带 themes 的 Markdown 渲染 |

## 示例会话

```
User: /post-to-wechat --markdown ./article.md

Claude:
1. 解析 markdown，找到 5 张图片
2. 生成带 placeholders 的 HTML
3. 打开 Chrome，导航到 WeChat editor
4. 粘贴 HTML 内容
5. 对每张图片：
   - 选中 WECHATIMGPH_1
   - 滚动到可见区域
   - 按 Backspace 删除
   - 粘贴图片
6. 报告："Article composed with 5 images."
```
