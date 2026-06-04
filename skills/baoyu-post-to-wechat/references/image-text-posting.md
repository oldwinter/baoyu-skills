# Image-Text Posting（贴图发表，原“图文”）

向 WeChat Official Account 发布带多张图片的 image-text messages。

> **Note**：截至 2026 年，WeChat 已在 Official Account 菜单中将“图文”更名为“贴图”。

## 用法

```bash
# 使用图片和 markdown 文件发布（自动提取 title/content）
${BUN_X} ./scripts/wechat-browser.ts --markdown source.md --images ./images/

# 使用明确 title 和 content 发布
${BUN_X} ./scripts/wechat-browser.ts --title "标题" --content "内容" --image img1.png --image img2.png

# 保存为草稿
${BUN_X} ./scripts/wechat-browser.ts --markdown source.md --images ./images/ --submit
```

## 参数

| 参数 | 说明 |
|-----------|-------------|
| `--markdown <path>` | 用于提取 title/content 的 Markdown file |
| `--images <dir>` | 包含 images 的 directory（按名称排序） |
| `--title <text>` | Article title（最长 20 chars，过长会自动压缩） |
| `--content <text>` | Article content（最长 1000 chars，过长会自动压缩） |
| `--image <path>` | 单个 image file（可重复） |
| `--submit` | 保存为草稿（默认：仅 preview） |
| `--profile <dir>` | Chrome profile directory |

## 从 Markdown 自动提取 Title/Content

使用 `--markdown` 时，脚本会：

1. **解析 frontmatter** 获取 title 和 author：
   ```yaml
   ---
   title: 文章标题
   author: 作者名
   ---
   ```

2. 如果没有 frontmatter title，则 **fallback 到 H1**：
   ```markdown
   # 这将成为标题
   ```

3. 如果 title 过长，**压缩 title** 到 20 个字符：
   - 原始："如何在一天内彻底重塑你的人生"
   - 压缩后："一天彻底重塑你的人生"

4. **提取前几段** 作为 content（最多 1000 chars）

## Image Directory Mode

使用 `--images <dir>` 时：

- 上传 directory 中所有 PNG/JPG files
- 文件按名称字母序排序
- 命名约定：`01-cover.png`、`02-content.png` 等

## 约束

| 字段 | 最大长度 | 说明 |
|-------|------------|-------|
| Title | 20 chars | 过长会自动压缩 |
| Content | 1000 chars | 过长会自动压缩 |
| Images | 最多 9 张 | WeChat limit |

## 示例会话

```
User: /post-to-wechat --markdown ./article.md --images ./xhs-images/

Claude:
1. Parses markdown meta:
   - Title: "如何在一天内彻底重塑你的人生" → "一天内重塑你的人生"
   - Author: from frontmatter or default
2. Extracts content from first paragraphs
3. Finds 7 images in xhs-images/
4. Opens Chrome, navigates to WeChat "图文" editor
5. Uploads all images
6. Fills title and content
7. Reports: "Image-text posted with 7 images."
```

## Scripts

| Script | 用途 |
|--------|---------|
| `wechat-browser.ts` | 主要 image-text posting script |
| `cdp.ts` | Chrome DevTools Protocol utilities |
| `copy-to-clipboard.ts` | Clipboard operations |
