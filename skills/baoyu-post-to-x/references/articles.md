# X Articles - Detailed Guide

把 Markdown articles 发布到 X Articles editor，并保留 rich text formatting 和 images。

## Mode Selection

在 Codex 中，根据用户措辞选择 browser-control mode：

1. 如果用户说 "Codex Chrome plugin"、"Codex 自带的 Chrome 插件"、`@chrome` 或 Chrome Extension，使用 **Codex Chrome Plugin Workflow**。不要先尝试 Computer Use。
2. 如果用户明确要求 Chrome Computer Use，使用 **Computer Use Workflow**。
3. 如果用户明确要求 CDP/script mode，使用 **CDP Script Workflow**。
4. 否则，可用时使用 Computer Use；不可用或被阻塞时，使用 CDP Script Workflow。

绝不要使用 in-app Browser 发布 X Article。对于用户明确要求的 mode，除非解释 blocker 并获得同意，否则不要切换。

## Prerequisites

- X Premium subscription（Articles 必需）
- 已安装 Google Chrome
- 已安装 `bun`

## Usage

### Codex Chrome Plugin（When Requested）

使用 `chrome:Chrome` skill 及其 Node REPL browser client。用 `browser.user.openTabs()` 等轻量调用验证连接。如果失败，等待 2 秒并 retry 一次，然后按 Chrome skill 的 health checks 处理。

准备 article HTML 和 image map：

```bash
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
```

把生成的 HTML 作为 rich text 复制：

```bash
${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
```

对所有 X UI operations 使用 Chrome plugin 的 tab、Playwright-wrapper、CUA、clipboard 和 file chooser APIs。如果 upload 报 `Not allowed`，停止并告诉用户在 `chrome://extensions` → Details 中为 Codex Chrome Extension 启用 file URL access。

### Chrome Computer Use

准备 article HTML 和 image map：

```bash
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
```

把生成的 HTML 作为 rich text 复制：

```bash
${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
```

然后通过 Codex Computer Use 操作 `Google Chrome` 完成所有 X UI operations。

### CDP Script Fallback

```bash
# Publish markdown article (preview mode)
${BUN_X} {baseDir}/scripts/x-article.ts article.md

# With custom cover image
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg

# Actually publish
${BUN_X} {baseDir}/scripts/x-article.ts article.md --submit
```

除非用户已经明确确认最终 public publish action，否则不要使用 `--submit`。

## Markdown Format

```markdown
---
title: My Article Title
cover_image: /path/to/cover.jpg
---

# Title (becomes article title)

Regular paragraph text with **bold** and *italic*.

## Section Header

More content here.

![Image alt text](./image.png)

- List item 1
- List item 2

1. Numbered item
2. Another item

> Blockquote text

[Link text](https://example.com)

\`\`\`
Code blocks become blockquotes (X doesn't support code)
\`\`\`
```

## Frontmatter Fields

| Field | Description |
|-------|-------------|
| `title` | Article title（或使用第一个 H1） |
| `cover_image` | Cover image path 或 URL |
| `cover` | `cover_image` 的 alias |
| `image` | `cover_image` 的 alias |

## Image Handling

1. **Cover Image**：第一个 image 或 frontmatter 中的 `cover_image`
2. **Remote Images**：自动下载到 temp directory
3. **Placeholders**：正文 images 使用 `XIMGPH_N` format
4. **Insertion**：找到并选中 placeholders，然后替换为实际 images

## Markdown to HTML Script

转换 markdown 并检查结构：

```bash
# Get JSON with all metadata
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md

# Output HTML only
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --html-only

# Save HTML to file
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/article.html
```

JSON output：

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

## Supported Formatting

| Markdown | HTML Output |
|----------|-------------|
| `# H1` | 仅作为 title（不进入 body） |
| `## H2` - `###### H6` | `<h2>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `[text](url)` | `<a href>` |
| `> quote` | `<blockquote>` |
| `` `code` `` | `<code>` |
| ```` ``` ```` | `<blockquote>`（X limitation） |
| `- item` | `<ul><li>` |
| `1. item` | `<ol><li>` |
| `![](img)` | Image placeholder |

## Codex Chrome Plugin Workflow

1. **Load Chrome skill**：使用 `chrome:Chrome`，不是 Computer Use。
2. **Connect**：初始化 Chrome plugin browser client，并用 `browser.user.openTabs()` 验证。
3. **Parse Markdown**：运行 `md-to-html.ts --save-html /tmp/x-article-body.html > /tmp/x-article.json`。
4. **Read the map**：从 `/tmp/x-article.json` 读取 `title`、`coverImage` 和 `contentImages`。
5. **Open X Articles**：打开或接管 `https://x.com/compose/articles` 的 Chrome tab。
6. **Create Draft**：如需要，点击 create/write button，或打开目标 draft。
7. **Upload Cover**：使用 Chrome plugin file chooser flow。如果 file upload 返回 `Not allowed`，报告 Chrome Extension file-access fix 并停止。
8. **Fill Title**：填写 title field。
9. **Paste Content**：
   - 运行 `copy-to-clipboard.ts html --file /tmp/x-article-body.html`。
   - 点击 article body。
   - 通过 Chrome plugin 按 macOS `Meta+V` 或 Windows/Linux `Control+V`。
   - 验证 article body 已出现，并包含 `XIMGPH_` placeholders。macOS 上，如果 paste 可疑，可用 `pbpaste` 验证 shell 写入的 system clipboard；shell 写入后 `tab.clipboard.readText()` 可能不反映 system clipboard。
10. **Insert Images**：按 placeholder 顺序处理每个 `contentImages` item：
   - 定位精确可见 placeholder text（`XIMGPH_N`），点击使 insertion point 位于该处。
   - 打开 editor toolbar dropdown `Insert` 并选择 `Media`。
   - 在 `Insert` modal 中点击带 `aria-label="Add photos or video"` 的 icon button；不要点击 "Choose a file or drag it here" text/dropzone 或 hidden file input。
   - 使用 Chrome plugin file chooser flow 上传该 image 的 `localPath`。
   - 等待 image block 出现。如果 `XIMGPH_N` 仍留在 image 上方，先精确选中该 placeholder 并按 `Delete`；只有当 `Delete` 失败且选中文本确认正好是 placeholder 时，才使用 `Backspace`。
   - 继续前验证该 placeholder 的 count 为 `0`。
11. **Verify**：
   - 检查 editor 中是否残留 `XIMGPH_`。
   - 确认可见 image blocks 数量符合预期。
   - 打开 Preview，验证 title、cover、body、links 和 images。
12. **Publish Safety**：点击 `Publish` 前，向用户请求 explicit final confirmation。

如果 Chrome plugin 报 `native pipe is closed`，2 秒后 retry 一次轻量 browser call，然后运行 Chrome skill health checks。如果 Chrome、extension 和 native host 都健康，打开新 Chrome window 并 retry 前先询问用户。

## Computer Use Workflow

1. **Detect Computer Use**：对 `Google Chrome` 调用 `get_app_state`；如果 tools 不可见，先用 `tool_search`。
2. **Parse Markdown**：运行 `md-to-html.ts --save-html /tmp/x-article-body.html > /tmp/x-article.json`。
3. **Read the map**：从 `/tmp/x-article.json` 读取 `title`、`coverImage` 和 `contentImages`。
4. **Open X Articles**：用 Chrome Computer Use 导航到 `https://x.com/compose/articles`。
5. **Create Draft**：如需要，点击 create/write button，或打开目标 draft。
6. **Upload Cover**：如果存在 `coverImage`，使用 Chrome 可见 upload/file picker UI。如果 file picker 无法可靠操作，停止并请求帮助，而不是静默切换到 CDP。
7. **Fill Title**：把 title 输入 title field。
8. **Paste Content**：
   - 运行 `copy-to-clipboard.ts html --file /tmp/x-article-body.html`。
   - 点击 article body。
   - 用 Computer Use 按 macOS `super+v` 或 Windows/Linux `control+v`。
9. **Insert Images**：按 placeholder 顺序处理每个 `contentImages` item：
   - 定位精确可见 placeholder text（`XIMGPH_N`），点击使 insertion point 位于该处。
   - 打开 editor toolbar dropdown `Insert`，选择 `Media`，然后在 modal 中点击带 `aria-label="Add photos or video"` 的 icon button。
   - 使用 native file picker 选择该 image 的 `localPath`。
   - 等待 image block 出现并且 upload activity 完成。
   - 如果 `XIMGPH_N` 仍留在插入图片上方，先重新精确选中该 placeholder text 并按 `Delete`；只有当 `Delete` 失败且 Computer Use state 确认选中文本正好是 placeholder 时，才使用 `Backspace`。
   - 继续前确认 placeholder 已消失。
10. **Verify**：
   - 检查 Computer Use state 中是否残留 `XIMGPH_`。
   - 确认可见 image blocks 数量符合预期。
   - 打开 Preview，验证 title、cover、body、links 和 images。
11. **Publish Safety**：点击 `Publish` 前，向用户请求 explicit final confirmation。

## CDP Script Workflow（Fallback）

1. **Parse Markdown**：提取 title、cover、content images，并生成 HTML
2. **Launch Chrome**：通过 CDP 使用真实 browser 和 persistent login
3. **Navigate**：打开 `x.com/compose/articles`
4. **Create Article**：如果在 list page，点击 create button
5. **Upload Cover**：对 cover image 使用 file input
6. **Fill Title**：把 title 输入 title field
7. **Paste Content**：把 HTML 复制到 clipboard，并粘贴到 editor
8. **Insert Images**：按 placeholder 顺序处理每个 placeholder：
   - 在 editor 中找到并点击 placeholder text
   - 使用 `Insert` -> `Media`
   - 点击 modal 中标记为 `Add photos or video` 的 icon button
   - 上传匹配的 image file
   - Image 出现后，用 `Delete` 删除残留 placeholder text
9. **Post-Composition Check**（automatic）：
   - 扫描 editor 中剩余的 `XIMGPH_` placeholders
   - 比较 expected vs actual image count
   - 如发现问题则 warning
10. **Review**：Browser 保持打开 60s 供 preview
11. **Publish**：仅在有 `--submit` flag 且用户明确确认时执行

## Example Session

```text
User: /post-to-x article ./blog/my-post.md --cover ./thumbnail.png

Claude:
1. Detects that the user requested the Codex Chrome plugin
2. Parses markdown: title="My Post", 3 content images
3. Saves `/tmp/x-article-body.html` and `/tmp/x-article.json`
4. Uses the Chrome plugin to open X Articles and create a draft
5. Uploads thumbnail.png as cover
6. Fills title "My Post"
7. Pastes HTML content with a real Chrome paste
8. Inserts 3 images at placeholder positions
9. Opens Preview and asks before publishing
```

## Troubleshooting

- **No create button**：确认 X Premium subscription 已生效
- **Cover upload fails**：检查 file path 和 format（PNG、JPEG）
- **Images not inserting**：确认 pasted content 中存在 placeholders；使用 `Insert` -> `Media` -> modal icon button `Add photos or video`，不要用 image clipboard paste、dropzone text 或 hidden file input。
- **Content not pasting**：检查 HTML clipboard：`${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/test.html`
- **Chrome plugin `native pipe is closed`**：2 秒后 retry 一次，然后运行 Chrome skill checks；如果 checks 通过，打开新 Chrome window 前先询问。
- **Chrome plugin upload `Not allowed`**：在 `chrome://extensions` → Details 中为 Codex Chrome Extension 启用 file URL access。
- **Computer Use unavailable**：使用 CDP fallback script，除非用户明确要求 Chrome Computer Use。
- **Placeholder remains after upload**：Upload 完成后，只选中 placeholder text 并按 `Delete`。只有当 `Delete` 失败且选中内容正好是 placeholder 时，才使用 `Backspace`。

## How It Works

1. `md-to-html.ts` 把 Markdown 转换为 HTML：
   - 提取 frontmatter（title、cover）
   - 将 markdown 转为 HTML
   - 把 images 替换为 unique placeholders
   - 把 remote images 下载到本地
   - 返回 structured JSON

2. 当用户明确要求时，Codex Chrome plugin 通过用户真实 Chrome session 发布：
   - 使用用户 active Chrome profile 和 logged-in X session
   - 使用 Chrome Extension browser client，而不是 Computer Use 或 CDP
   - 使用 `copy-to-clipboard.ts` 粘贴 rich HTML body
   - 通过 X toolbar `Insert` -> `Media` modal 及其 `Add photos or video` icon button 插入 body images
   - 最终 publish click 受用户确认约束

3. Chrome Computer Use 通过用户可见 Chrome UI 发布：
   - 使用用户 active Chrome profile 和 logged-in X session
   - 使用 `copy-to-clipboard.ts` 粘贴 rich HTML body
   - 通过 X toolbar `Insert` -> `Media` modal 及其 `Add photos or video` icon button 插入 body images
   - 通过 Codex Computer Use 使用真实 keystrokes（`super+v`/`control+v`）
   - 最终 publish click 受用户确认约束

4. `x-article.ts` 作为 fallback 通过 CDP 发布：
   - 启动真实 Chrome（绕过 detection）
   - 使用 persistent profile（saved login）
   - 通过 DOM manipulation 导航并填写 editor
   - 从 system clipboard 粘贴 HTML
   - 找到、选中并替换每个 image placeholder
