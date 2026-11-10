---
name: baoyu-markdown-to-html
description: 将 Markdown 转换为带样式的 HTML，内置 WeChat-compatible themes。支持 code highlighting、math、Mermaid（通过 headless Chrome 渲染为 PNG）、PlantUML、footnotes、alerts、infographics，以及可选的 external links 底部引用。用户要求 "markdown to html"、"convert md to html"、"md 转 html"、"微信外链转底部引用"，或需要从 markdown 生成 styled HTML output 时使用。
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-markdown-to-html
    requires:
      anyBins:
        - bun
        - npx
---

# Markdown to HTML Converter

输出为带 inline CSS 的 HTML，针对 WeChat Official Account 优化。

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Script Directory

**Agent Execution**：把当前 SKILL.md 目录确定为 `{baseDir}`。解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。把 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | User home |

没有找到 → 使用默认值。

**支持**：default theme、custom CSS variables、code block style、mermaid defaults（`mermaid_theme`、`mermaid_scale`、`mermaid_background`）。

## Workflow

### Step 0：Pre-check（CJK Content）

仅当 input 包含 CJK characters 且 `baoyu-format-markdown` skill 可用时：用 `AskUserQuestion` 询问是否先格式化 — 它可以修复因内部标点导致 `**` bold markers 失效的问题，以及 CJK/English spacing。同意 → 运行 `baoyu-format-markdown`，使用 formatted file。拒绝 → 使用 original file。没有 CJK → 跳到 Step 1。

### Step 1：Determine Theme

先匹配者胜出：
1. 用户指定（CLI `--theme` 或对话中说明）
2. 当前 skill 的 EXTEND.md `default_theme`
3. Cross-skill fallback（仅当 step 2 没有时）：`$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` 中的 `default_theme:` 行（如果存在）
4. 都没有 → 用 [Themes](#themes) 表通过 `AskUserQuestion` 询问

Theme 来自 EXTEND.md → 直接使用，不要询问。

**如果没有 default**：使用 `AskUserQuestion` 从下方 [Themes](#themes) table 中确认 theme。

### Step 1.5：Determine Citation Mode

默认关闭；不要询问。仅当用户显式要求 "微信外链转底部引用"、"底部引用"、"文末引用"，或传入 `--cite` 时启用。启用后：
- 普通 external links 使用编号上标渲染，并汇总到文末 `引用链接` section。
- `https://mp.weixin.qq.com/...` 链接保持为直接链接，不移到底部。
- link text 等于 URL 的 bare links 保持 inline。

**启用后的行为**：

- 普通 external links 会渲染为带编号的 superscripts，并收集到末尾 `引用链接` section。
- `https://mp.weixin.qq.com/...` links 保持 direct links，不移动到底部。
- Link text 等于 URL 的 bare links 保持 inline。

### Step 2：Convert

```bash
${BUN_X} {baseDir}/scripts/main.ts <markdown_file> --theme <theme> [--cite]
```

### Step 3：Report Result

展示 JSON result 中的 `htmlPath`；如果创建了 backup，也说明 `backupPath`。

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--theme <name>` | Theme name（default、grace、simple、modern） | default |
| `--color <name\|hex>` | Primary color：preset name 或 hex value | theme default |
| `--font-family <name>` | Font：sans、serif、serif-cjk、mono 或 CSS value | theme default |
| `--font-size <N>` | Font size：14px、15px、16px、17px、18px | 16px |
| `--title <title>` | 覆盖 frontmatter 中的 title | |
| `--cite` | 把 external links 转为底部 citations，并追加 `引用链接` section | false（off） |
| `--keep-title` | 保留内容中的第一个 heading | false（removed） |
| `--mermaid-theme <name>` | Mermaid theme：`default`、`forest`、`dark`、`neutral`、`base` | default |
| `--mermaid-scale <N>` | Mermaid render scale（正数且 ≤ 4） | 2 |
| `--mermaid-width <N>` | Mermaid target display width，单位 CSS px；当 diagram 比该值窄时，PNG 以 `width × scale` pixels 渲染 | 860 |
| `--mermaid-bg <value>` | Mermaid background：`white`、`transparent` 或 `#hex` | white |
| `--no-mermaid` | 跳过 Mermaid PNG rendering；输出 `<pre class="mermaid">` fallback | false |
| `--help` | Show help | |

**Color Presets：**

| Name | Hex | Label |
|------|-----|-------|
| blue | #0F4C81 | Classic Blue |
| green | #009874 | Emerald Green |
| vermilion | #FA5151 | Vibrant Vermilion |
| yellow | #FECE00 | Lemon Yellow |
| purple | #92617E | Lavender Purple |
| sky | #55C9EA | Sky Blue |
| rose | #B76E79 | Rose Gold |
| olive | #556B2F | Olive Green |
| black | #333333 | Graphite Black |
| gray | #A9A9A9 | Smoke Gray |
| pink | #FFB7C5 | Sakura Pink |
| red | #A93226 | China Red |
| orange | #D97757 | Warm Orange（modern default） |

**Examples：**

```bash
${BUN_X} {baseDir}/scripts/main.ts article.md                                  # default theme, first heading removed
${BUN_X} {baseDir}/scripts/main.ts article.md --theme modern --color red
${BUN_X} {baseDir}/scripts/main.ts article.md --cite --keep-title --title "My Article"
```

## Output

`/path/to/article.md` → `/path/to/article.html`（同目录）。已存在的 HTML file 会先备份到 `/path/to/article.html.bak-YYYYMMDDHHMMSS`。

**JSON to stdout：**

```json
{
  "title": "Article Title",
  "author": "Author Name",
  "summary": "Article summary...",
  "htmlPath": "/path/to/article.html",
  "backupPath": "/path/to/article.html.bak-20260128180000",
  "contentImages": [
    {
      "placeholder": "MDTOHTMLIMGPH_1",
      "localPath": "/path/to/img.png",
      "originalPath": "imgs/image.png"
    }
  ],
  "mermaidImages": [
    {
      "hash": "a1b2c3d4e5f6",
      "localPath": "/path/to/imgs/.mermaid-cache/mermaid-a1b2c3d4e5f6.png",
      "cached": false
    }
  ]
}
```

**Mermaid**：` ```mermaid ` blocks 通过 headless Chrome（CDP）渲染为 PNG，缓存到 `imgs/.mermaid-cache/mermaid-<hash>.png`（key：code、theme、scale、target width、background、mermaid version；建议把该目录加入 `.gitignore`）。需要 Chrome/Chromium/Edge；如果不可用或渲染失败，fallback 到 `<pre class="mermaid">…</pre>`，conversion 仍会成功。

## Themes

| Theme | Description |
|-------|-------------|
| `default` | Classic：传统布局，居中 title + 底部边框，H2 使用 colored background 白字 |
| `grace` | Elegant：text shadow、rounded cards、精致 blockquotes（by @brzhang） |
| `simple` | Minimal：modern minimalist、不对称圆角、干净留白（by @okooo5km） |
| `modern` | Modern：大圆角、pill-shaped titles、宽松 line height（搭配 `--color red` 可做传统红金风格） |

## 支持的 Markdown 特性

标准 GFM（headings、emphasis、lists、tables、images、links、blockquotes、inline code），外加：

| Feature | Syntax |
|---------|--------|
| Code blocks | ` ```lang ` with syntax highlighting |
| Links | `[text](url)`；添加 `--cite` 可把普通 external links 移到底部 references |
| Alerts | `> [!NOTE]`、`> [!WARNING]` 等 |
| Footnotes | `[^1]` references |
| Ruby text | `{base|annotation}` |
| Mermaid | ` ```mermaid `（见 Output） |
| PlantUML | ` ```plantuml ` diagrams |

## Frontmatter

`title`、`author`、`description`（summary）。没有 title → 第一个 H1/H2，否则使用 filename。

## Extension Support

通过 EXTEND.md 自定义配置，见 Preferences。
