# Article Posting (文章发表)

## 用法

```bash
${BUN_X} ./scripts/wechat-article.ts --markdown article.md
${BUN_X} ./scripts/wechat-article.ts --markdown article.md --theme grace --author "作者名" --summary "摘要"
```

## 参数

| Parameter | 说明 |
|-----------|-------------|
| `--markdown <path>` | 要转换并发布的 Markdown 文件 |
| `--theme <name>` | Theme：default、grace、simple、modern |
| `--no-cite` | 保持普通外部链接为 inline，而不是转换为底部引用（默认：转换） |
| `--title <text>` | 覆盖标题（默认从 markdown 自动提取） |
| `--author <name>` | 作者名 |
| `--summary <text>` | 文章摘要 |
| `--html <path>` | 预渲染 HTML 文件（markdown 的替代输入） |
| `--profile <dir>` | Chrome profile directory |

Frontmatter 中的 `title` / `author` 会被读取；否则第一个 `#` 标题会成为文章标题。

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
