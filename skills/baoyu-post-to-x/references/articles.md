# X Articles - Detailed Guide

需要 X Premium、Google Chrome 和 `bun`。Mode selection、publish gate，以及逐步的 Codex Chrome plugin / Computer Use workflows 见 SKILL.md（"Execution Mode Selection"、"X Articles (UI Modes)"）。

## CDP 脚本回退

```bash
# Publish markdown article (preview mode)
${BUN_X} {baseDir}/scripts/x-article.ts article.md

# With custom cover image
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg

# Actually publish
${BUN_X} {baseDir}/scripts/x-article.ts article.md --submit
```

除非用户已明确确认最终公开发布动作，否则不要使用 `--submit`。

## Frontmatter 字段

| Field | 说明 |
|-------|-------------|
| `title` | 文章标题（或使用第一个 H1） |
| `cover_image` | 封面图路径或 URL |
| `cover` | `cover_image` 的别名 |
| `image` | `cover_image` 的别名 |

## 图片处理

1. **封面图**：第一张图片，或 frontmatter 中的 `cover_image`
2. **远程图片**：自动下载到临时目录
3. **占位符**：内容中的图片使用 `XIMGPH_N` 格式
4. **插入**：查找、选中占位符并替换为实际图片

## Markdown 转 HTML 脚本

转换 markdown 并查看结构：

```bash
# 获取包含全部 metadata 的 JSON
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md

# 仅输出 HTML
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --html-only

# 将 HTML 保存到文件
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/article.html
```

JSON 输出：
```json
{
  "title": "Article Title",
  "coverImage": "/path/to/cover.jpg",
  "contentImages": [
    {
      "placeholder": "XIMGPH_1",
      "localPath": "/tmp/x-article-images/img.png",
      "blockIndex": 5
    }
  ],
  "html": "<p>Content...</p>",
  "totalBlocks": 20
}
```

## 支持的格式

| Markdown | HTML Output |
|----------|-------------|
| `# H1` | Title only (not in body) |
| `## H2` - `###### H6` | `<h2>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `[text](url)` | `<a href>` |
| `> quote` | `<blockquote>` |
| `` `code` `` | `<code>` |
| ```` ``` ```` | `<blockquote>` (X limitation) |
| `- item` | `<ul><li>` |
| `1. item` | `<ol><li>` |
| `![](img)` | Image placeholder |

## CDP 脚本工作流（Fallback）

1. **解析 Markdown**：提取 title、cover、content images，生成 HTML
2. **启动 Chrome**：带 CDP 的真实浏览器，持久化登录
3. **导航**：打开 `x.com/compose/articles`
4. **创建 Article**：如果在列表页，点击 create button
5. **上传封面**：使用 cover image 的 file input
6. **填写标题**：把 title 输入 title field
7. **粘贴内容**：把 HTML 复制到 clipboard，再粘贴进 editor
8. **插入图片**：按 placeholder 顺序处理每个占位符：
   - 在 editor 中找到并点击占位符文本
   - 使用 `Insert` -> `Media`
   - 点击 modal 中 `aria-label="Add photos or video"` 的 icon button
   - 上传对应的 image 文件
   - image 出现后，用 `Delete` 删除残留的占位符文本
9. **组合后检查**（自动）：
   - 扫描 editor 中残留的 `XIMGPH_` 占位符
   - 对比预期与实际 image 数量
   - 发现问题时给出警告
10. **审阅**：浏览器保持打开 60s 供预览
11. **发布**：仅在带 `--submit` flag 且用户明确确认时执行

## 排查

- **没有 create button**：确认 X Premium subscription 处于有效状态
- **封面图上传失败**：检查文件路径和格式（PNG、JPEG）
- **图片未插入**：确认粘贴内容中存在占位符；使用 `Insert` -> `Media` -> modal 中的 `Add photos or video` icon button，而不是粘贴图片 clipboard、dropzone 文本或隐藏的 file input。
- **内容未粘贴**：检查 HTML clipboard：`${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/test.html`
- **Chrome plugin `native pipe is closed`**：2 秒后重试一次，然后运行 Chrome skill 检查；如果检查通过，询问用户后再打开新的 Chrome window。
- **Chrome plugin 上传报 `Not allowed`**：在 `chrome://extensions` → Details 中为 Codex Chrome Extension 启用 file URL access。
- **Computer Use 不可用**：使用 CDP fallback script，除非用户明确要求 Chrome Computer Use。
- **上传后占位符仍在**：只选中占位符文本，等上传完成后按 `Delete`。仅当 `Delete` 失败且选中内容正好是占位符时才使用 `Backspace`。

## 工作原理

- `md-to-html.ts`：提取 frontmatter（title、cover）、把 Markdown 转为 HTML、把图片替换为唯一占位符、把远程图片下载到本地，并返回结构化 JSON。
- Chrome plugin / Computer Use：通过用户真实的 Chrome session 发布；body 以 rich HTML 经 `copy-to-clipboard.ts` 粘贴；body 图片通过 `Insert` → `Media` → `Add photos or video` 插入；最终 publish click 仍受用户确认约束。
- `x-article.ts`（CDP fallback）：启动真实 Chrome（绕过检测），使用持久 profile（已保存登录），通过 DOM 操作填写编辑器，从系统 clipboard 粘贴 HTML，然后逐个查找/选中/替换图片占位符。
