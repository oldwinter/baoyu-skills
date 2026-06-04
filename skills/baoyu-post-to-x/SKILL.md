---
name: baoyu-post-to-x
description: 将内容和文章发布到 X（Twitter）。支持带图片/视频的 regular posts，以及 X Articles（long-form Markdown）。在 Codex 中，如果用户明确要求 Codex Chrome plugin/@chrome，必须使用 Chrome Extension workflow；否则在可用时使用 Chrome Computer Use，并且只有在允许时才 fallback 到 real Chrome CDP scripts。当用户要求 "post to X"、"tweet"、"publish to Twitter" 或 "share on X" 时使用。
version: 1.58.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-x
    requires:
      anyBins:
        - bun
        - npx
---

# Post to X（Twitter）

通过真实 Chrome browser 向 X 发布文本、图片、视频和 long-form articles。

在 Codex 中，不要混淆以下 browser paths：

- **Codex Chrome plugin / `@chrome` / Chrome Extension**：使用 bundled `chrome:Chrome` skill 及其 Node REPL browser client。只要用户说 "Codex Chrome plugin"、"Codex 自带的 Chrome 插件"、`@chrome` 或类似表达，就必须使用该路径。
- **Chrome Computer Use**：只有当用户要求 Computer Use，或用户没有声明 Chrome-plugin 偏好且 Computer Use 可用时，才通过 `mcp__computer_use__.*` 操作可见的 Google Chrome UI。
- **CDP script mode**：仅当所选模式不可用，或用户明确要求 CDP/script mode 时作为 fallback 使用。

## Script Directory

**Important**：所有 scripts 都位于该 skill 的 `scripts/` 子目录。

**Agent Execution Instructions**：

1. 确定当前 SKILL.md 文件的目录路径为 `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. 把本文档中所有 `{baseDir}` 替换为 actual path
4. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

**Script Reference**：

| Script | Purpose |
|--------|---------|
| `scripts/x-browser.ts` | Regular posts（text + images），CDP fallback |
| `scripts/x-video.ts` | Video posts（text + video），CDP fallback |
| `scripts/x-quote.ts` | Quote tweet with comment，CDP fallback |
| `scripts/x-article.ts` | Long-form article publishing（Markdown），CDP fallback |
| `scripts/md-to-html.ts` | Markdown → HTML conversion |
| `scripts/copy-to-clipboard.ts` | Copy content to clipboard |
| `scripts/paste-from-clipboard.ts` | 发送真实 paste keystroke |
| `scripts/check-paste-permissions.ts` | Verify environment & permissions |

## Execution Mode Selection（Required）

与 X 交互前，必须且只能选择一种 mode：

1. 如果用户明确要求 Codex Chrome plugin、`@chrome`、Chrome extension 或 "Codex 自带的 Chrome 插件"，使用 **Codex Chrome Plugin Mode**。不要先调用 Computer Use。
2. 如果用户明确要求 Chrome Computer Use，使用 **Chrome Computer Use Mode**。不要在未告知用户并获得同意的情况下 fallback 到 CDP、Playwright、in-app Browser 或 Chrome plugin。
3. 如果用户明确要求 CDP/script mode，使用 **CDP Script Mode**。
4. 否则，优先 **Chrome Computer Use Mode**。对带 local content images 的 Markdown **X Articles**，使用已验证的 X editor flow：从 toolbar（`Insert` -> `Media` -> dialog icon button `Add photos or video`）把每张正文图片插入到其 placeholder 位置，再删除 placeholder text。只有当选定 browser-control mode 不可用，或 UI upload/selection flow 不可靠时，才使用 CDP Script Mode。

绝不要把 in-app Browser 用于 X publishing workflows。

## Codex Chrome Plugin Mode

当用户要求 Codex Chrome plugin、`@chrome` 或 Chrome Extension path 时使用该模式。该模式通过 bundled Chrome plugin 使用用户真实 Chrome profile 和 X login，不是 Computer Use，也不是 CDP。

**Setup**

1. 在 browser work 前加载 `chrome:Chrome` skill。
2. 如果 Node REPL `js` tool 尚不可见，用 `tool_search` 查找 `node_repl js`。
3. 严格按 Chrome skill 指引初始化 Chrome browser client，然后运行 `browser.user.openTabs()` 这类轻量调用验证 extension connection。
4. 如果第一次轻量调用失败，等待 2 秒后 retry 一次。如果仍失败，按 Chrome skill 的 extension checks 和 recovery steps 处理。如果 checks 通过但通信仍失败，打开新 Chrome window 前先询问用户。不要静默切换到 Computer Use 或 CDP。

**General rules**

- 使用 Chrome plugin 的 `browser.tabs.*`、`tab.playwright.*`、`tab.cua.*` 和 file chooser APIs 执行 X UI actions。
- Shell commands 可用于 Markdown preprocessing 和 rich-HTML clipboard preparation。对 X Article body images，不要依赖 image clipboard paste；使用 editor 的 `Insert` -> `Media` upload flow。
- 如果 file upload 报 `Not allowed`，告诉用户：`To enable file upload, go to chrome://extensions in Chrome, click Details under the Codex extension, and enable "Allow access to file URLs." See https://developers.openai.com/codex/app/chrome-extension#upload-files for details.`
- 如果 Chrome plugin 报 `native pipe is closed`，2 秒后 retry 一次轻量 browser call，然后运行 Chrome skill health checks。如果 Chrome 正在运行、extension 已启用、native host manifest 正确，则询问是否打开新 Chrome window 并 retry。不要继续通过 broken pipe 发送 browser actions。
- 没有当前对话中的 explicit final confirmation，绝不点击 `Publish`、`Post` 或任何 externally visible submit action。

**X Articles**

1. 转换 Markdown 并保留 image map：
   ```bash
   ${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
   ```
2. 读取 JSON output 中的 `title`、`coverImage` 和 `contentImages`（`placeholder` → `localPath`）。
3. 在 `https://x.com/compose/articles` 打开或创建 article draft。
4. 用 Chrome plugin file chooser flow 上传 cover。如果 upload 被 extension permissions 阻止，停止并报告上方 exact permission fix。
5. 填写 title，然后复制 rich HTML：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
   ```
6. 通过 Chrome plugin 发送真实 paste keystroke，把内容粘贴到 article body。macOS 使用 `Meta+V`。
7. 验证 editor text 包含 article body 和 `XIMGPH_` placeholders。Shell 写入 clipboard 后，不要把 `tab.clipboard.readText()` 当作 system clipboard 的证明；macOS 可用 `pbpaste` 验证。
8. 按 placeholder 顺序处理每个 `contentImages` item：
   - 定位可见 placeholder text（`XIMGPH_N`）并点击，把 caret 放在该处。
   - 打开 toolbar menu `Insert` -> `Media`。
   - 在 modal 中点击带 `aria-label="Add photos or video"` 的 icon button；不要点击 text/dropzone 或 hidden file input。
   - 使用 file chooser 上传该图片的 `localPath`。
   - 图片出现后，如果 `XIMGPH_N` 仍留在图片上方，先精确选中该 placeholder 并按 `Delete`。只有当 `Delete` 失败且确认选中文本正好是 placeholder 时，才使用 `Backspace`。
   - 验证该 `XIMGPH_N` 的 placeholder count 为 `0`。
9. 打开 Preview，验证 title、cover、body、links 和 images。
10. 点击 `Publish` 前必须请求 explicit confirmation。

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-x/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-x/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-x/EXTEND.md` | User home |

如果没有找到，使用默认值。

**EXTEND.md supports**：Default Chrome profile

## Prerequisites

- Google Chrome 或 Chromium
- `bun` runtime
- 首次运行：手动登录 X（session 会保存）

## Pre-flight Check（Optional）

首次使用前，建议运行 environment check。用户可选择跳过。

```bash
${BUN_X} {baseDir}/scripts/check-paste-permissions.ts
```

Checks：Chrome、profile isolation、Bun、Accessibility、clipboard、paste keystroke、Chrome conflicts。

**如果任何 check 失败**，按项目给出修复指引：

| Check | Fix |
|-------|-----|
| Chrome | 安装 Chrome 或设置 `X_BROWSER_CHROME_PATH` env var |
| Profile dir | Shared profile at `baoyu-skills/chrome-profile`（见 CLAUDE.md Chrome Profile section） |
| Bun runtime | `brew install oven-sh/bun/bun`（macOS）或 `npm install -g bun` |
| Accessibility（macOS） | System Settings → Privacy & Security → Accessibility → enable terminal app |
| Clipboard copy | 确保 Swift/AppKit 可用（macOS Xcode CLI tools：`xcode-select --install`） |
| Paste keystroke（macOS） | 同 Accessibility fix |
| Paste keystroke（Linux） | 安装 `xdotool`（X11）或 `ydotool`（Wayland） |

## References

- **Regular Posts**：manual workflow、troubleshooting 和 technical details 见 `references/regular-posts.md`
- **X Articles**：long-form article publishing guide 见 `references/articles.md`

---

## Chrome Computer Use Mode

当用户明确要求 Chrome Computer Use，或用户没有声明 Chrome-plugin 偏好且 Codex 可通过 Computer Use 控制 `Google Chrome` 时使用。该模式使用用户现有 Chrome window、cookies、login、extensions 和 X session。

**General rules**：

- 每个会控制 Chrome 的 assistant turn，都要先对 `Google Chrome` 调用 `get_app_state`。
- 可用时优先 element-index actions；仅在 editor text selection 或 drag selection 时使用 coordinates。
- 除非用户同意 mode change，否则在该模式下不要用 in-app Browser、Chrome plugin、Playwright 或 CDP 做 X UI actions。
- 没有当前对话中的 explicit final confirmation，绝不点击 `Publish`、`Post` 或任何 externally visible submit action。

**Regular posts**：

1. 打开或导航 Chrome 到 `https://x.com/compose/post`。
2. 用 Computer Use 把 post text 输入 composer。
3. 对每张图片运行：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image /absolute/path/to/image.png
   ```
4. 用 Computer Use 粘贴（macOS 为 `super+v`，Windows/Linux 为 `control+v`），然后等待 X 完成 media upload。
5. 点击 `Post` 前请求确认。

**Video posts**：

1. 打开或导航 Chrome 到 `https://x.com/compose/post`。
2. 把 post text 输入 composer。
3. 使用可见 media upload/file picker UI 附加视频。
4. 等待 upload 和 processing 完成。
5. 点击 `Post` 前请求确认。

**Quote tweets**：

1. 在 Chrome 中打开 tweet URL。
2. 使用可见 quote/repost UI 选择 Quote。
3. 输入 comment。
4. 点击 `Post` 前请求确认。

**X Articles**：

1. 转换 Markdown 并保留 image map：
   ```bash
   ${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
   ```
2. 读取 JSON output 中的 `title`、`coverImage` 和 `contentImages`（`placeholder` → `localPath`）。
3. 在 Chrome 中打开 `https://x.com/compose/articles`，创建或打开 draft，若有 cover 则上传，并填写 title。
4. 复制 rich HTML 到 clipboard：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
   ```
5. 用 Computer Use 粘贴到 article body。
6. 按 placeholder 顺序处理每个 `contentImages` entry：
   - 定位精确可见 placeholder text，例如 `XIMGPH_3`，并点击设置 insertion point。
   - 打开 toolbar `Insert` dropdown，选择 `Media`，然后点击 modal 中标记为 `Add photos or video` 的 icon button。
   - 使用 native file picker 选择该图片的 `localPath`。
   - 等待 image block 出现，且 upload activity 完成。
   - 如果 placeholder 仍在插入图片上方，先重新精确选中该 placeholder text 并按 `Delete`。只有当 `Delete` 失败且确认选中文本正好是 placeholder 时，才使用 `Backspace`。
7. 验证没有 `XIMGPH_` placeholders 残留，且 expected images 出现。
8. 打开 Preview，验证 title、cover、body、links 和 images。
9. 点击 `Publish` 前请求 explicit confirmation。

如果 Computer Use selection、toolbar upload 或 file-picker control 变得不可靠，停止并报告 blocker，不要静默切换到 Chrome plugin 或 CDP。

---

## CDP Script Mode（Fallback）

只有当所选 browser-control mode 不可用、不可靠，或用户明确未要求该模式时，才使用下方 script sections。这些 scripts 会通过 CDP 启动或复用真实 Chrome instance，并保持 browser 打开供 review。

当用户明确要求 Codex Chrome plugin 或 Chrome Computer Use 时，不要使用 CDP Script Mode；除非你解释 blocker 后，用户同意 fallback。

---

## Post Type Selection

除非用户明确指定 post type：

- **Plain text** + 10,000 characters 以内 → **Regular Post**（Premium members 支持最多 10,000 characters，non-Premium: 280）
- **Markdown file**（.md）→ **X Article**

## Regular Posts

```bash
${BUN_X} {baseDir}/scripts/x-browser.ts "Hello!" --image ./photo.png
```

**Parameters**：

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content（positional） |
| `--image <path>` | Image file（可重复，最多 4 张） |
| `--profile <dir>` | Custom Chrome profile |

**Note**：Script 会打开 browser 并填入内容。用户 review 后手动 publish。

**Codex mode note**：如果用户明确要求 Codex Chrome plugin，使用 **Codex Chrome Plugin Mode**。否则，如果 Chrome Computer Use 已启用，使用 **Chrome Computer Use Mode**，而不是运行 `x-browser.ts`。

---

## Video Posts

Text + video file。

```bash
${BUN_X} {baseDir}/scripts/x-video.ts "Check this out!" --video ./clip.mp4
```

**Parameters**：

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content（positional） |
| `--video <path>` | Video file（MP4、MOV、WebM） |
| `--profile <dir>` | Custom Chrome profile |

**Note**：Script 会打开 browser 并填入内容。用户 review 后手动 publish。

**Codex mode note**：如果用户明确要求 Codex Chrome plugin，使用 **Codex Chrome Plugin Mode**。否则，如果 Chrome Computer Use 已启用，使用 **Chrome Computer Use Mode**，而不是运行 `x-video.ts`。

**Limits**：Regular 140s max，Premium 60min。Processing：30-60s。

---

## Quote Tweets

引用现有 tweet 并添加 comment。

```bash
${BUN_X} {baseDir}/scripts/x-quote.ts https://x.com/user/status/123 "Great insight!"
```

**Parameters**：

| Parameter | Description |
|-----------|-------------|
| `<tweet-url>` | 要 quote 的 URL（positional） |
| `<comment>` | Comment text（positional，optional） |
| `--profile <dir>` | Custom Chrome profile |

**Note**：Script 会打开 browser 并填入内容。用户 review 后手动 publish。

**Codex mode note**：如果用户明确要求 Codex Chrome plugin，使用 **Codex Chrome Plugin Mode**。否则，如果 Chrome Computer Use 已启用，使用 **Chrome Computer Use Mode**，而不是运行 `x-quote.ts`。

---

## X Articles

Long-form Markdown articles（需要 X Premium）。

```bash
${BUN_X} {baseDir}/scripts/x-article.ts article.md
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg
```

**Parameters**：

| Parameter | Description |
|-----------|-------------|
| `<markdown>` | Markdown file（positional） |
| `--cover <path>` | Cover image |
| `--title <text>` | Override title |

**Frontmatter**：支持 YAML front matter 中的 `title`、`cover_image`。

**Codex mode note**：如果用户明确要求 Codex Chrome plugin，遵循上方 **Codex Chrome Plugin Mode**。如果用户明确要求 Chrome Computer Use，遵循 **Chrome Computer Use Mode**。否则，优先 Chrome Computer Use；对带 local content images 的 Markdown articles，使用 toolbar `Insert` -> `Media` image-upload workflow，然后再 fallback 到 **CDP Script Mode** 中的 `x-article.ts`。

**CDP fallback note**：Script 会打开 browser 并填入 article。除非使用 `--submit`，否则用户 review 后手动 publish。

**Publish safety**：除非用户明确确认最终 public publish action，否则不要使用 `--submit` 或点击 `Publish`。

**Post-Composition Check**：Script 会在所有 images 插入后自动验证：

- Editor content 中剩余的 `XIMGPH_` placeholders
- Expected vs actual image count

如果 check 失败（output 中出现 warnings），在用户 publish 前用具体问题提醒用户。

---

## Troubleshooting

### Chrome debug port not ready

仅 CDP fallback：如果 script 失败并显示 `Chrome debug port not ready` 或 `Unable to connect`，先 kill 现有 Chrome CDP instances，再 retry：

```bash
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null; pkill -f "Chromium.*remote-debugging-port" 2>/dev/null; sleep 2
```

**Important**：这应自动完成。遇到该错误时，kill Chrome CDP instances 并 retry command，不要询问用户。

## Notes

- 首次运行：需要 manual login（session persists）
- 在 Codex Chrome Plugin Mode 和 Chrome Computer Use Mode 中，使用用户现有 Chrome session，不要启动独立 CDP profile
- CDP scripts 默认只把内容填入 browser；除非显式使用 `--submit`，否则用户必须 review 并手动 publish
- Cross-platform：macOS、Linux、Windows

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** section。
