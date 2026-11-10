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

# Post to X (Twitter)

通过真实 Chrome 浏览器把文本、图片、视频和长文发布到 X。

在 Codex 中，有三条不同的 browser paths，不要混淆：
- **Codex Chrome plugin / `@chrome` / Chrome Extension**：使用 bundled `chrome:Chrome` skill 及其 Node REPL browser client。只要用户说 "Codex Chrome plugin"、"Codex 自带的 Chrome 插件"、`@chrome` 或类似表达，就必须使用该路径。
- **Chrome Computer Use**：通过 `mcp__computer_use__.*` 操作可见的 Google Chrome UI。
- **CDP script mode**：bundled scripts；仅作为 fallback。

## Script Directory

`{baseDir}` = 本 SKILL.md 所在目录；scripts 位于 `{baseDir}/scripts/<script-name>.ts`。解析 `${BUN_X}`：已安装 `bun` → `bun`；否则 `npx -y bun`；否则建议安装 bun。

| Script | Purpose |
|--------|---------|
| `scripts/x-browser.ts` | Regular posts（text + images），CDP fallback |
| `scripts/x-video.ts` | Video posts（text + video），CDP fallback |
| `scripts/x-quote.ts` | Quote tweet with comment，CDP fallback |
| `scripts/x-article.ts` | Long-form article publishing（Markdown），CDP fallback |
| `scripts/md-to-html.ts` | Markdown → HTML conversion |
| `scripts/copy-to-clipboard.ts` | Copy content to clipboard |
| `scripts/paste-from-clipboard.ts` | Send real paste keystroke |
| `scripts/check-paste-permissions.ts` | Verify environment & permissions |

## Execution Mode Selection (Required)

与 X 交互前，必须且只能选择一种模式：

1. 用户要求 Codex Chrome plugin、`@chrome`、Chrome extension 或 "Codex 自带的 Chrome 插件" → **Codex Chrome Plugin Mode**。不要先调用 Computer Use。
2. 用户要求 Chrome Computer Use → **Chrome Computer Use Mode**。不要在未告知用户并获得同意的情况下 fallback 到 CDP、Playwright、in-app Browser 或 Chrome plugin。
3. 用户要求 CDP/script mode → **CDP Script Mode**。
4. 否则优先 **Chrome Computer Use Mode**（如果可用）。对带 local content images 的 Markdown X Articles，使用 "X Articles (UI Modes)" 中的 toolbar image flow（`Insert` → `Media` → `Add photos or video`）。只有当选定 browser-control mode 不可用，或 UI upload/selection flow 不可靠时，才使用 CDP Script Mode。

绝不要把 in-app Browser 用于 X publishing。绝不要在未解释 blocker 并获得同意的情况下，从用户明确要求的模式切换走。

**Publish gate（所有模式）**：没有当前对话中的 explicit final confirmation，绝不点击 `Publish`、`Post` 或任何 externally visible submit action，也绝不传 `--submit`。

在 Codex Chrome Plugin Mode 和 Chrome Computer Use Mode 中，使用用户现有 Chrome session（profile、cookies、X login）；不要启动独立 CDP profile。

## Preferences (EXTEND.md)

按优先级检查 EXTEND.md：第一个找到的文件生效：

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-x/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-x/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-x/EXTEND.md` | User home |

没有找到 → 使用默认值。支持：default Chrome profile。

## Prerequisites

Google Chrome 或 Chromium；`bun`。首次运行：用户手动登录 X（session 会保留）。支持 macOS、Linux、Windows。

## Pre-flight Check (Optional)

首次使用前，建议运行（用户可跳过）：

```bash
${BUN_X} {baseDir}/scripts/check-paste-permissions.ts
```

| Check fails | Fix |
|-------|-----|
| Chrome | 安装 Chrome，或设置 `X_BROWSER_CHROME_PATH` env var |
| Profile dir | 共享 profile 位于 `baoyu-skills/chrome-profile`（见 CLAUDE.md Chrome Profile section） |
| Bun runtime | `brew install oven-sh/bun/bun`（macOS）或 `npm install -g bun` |
| Accessibility (macOS) | System Settings → Privacy & Security → Accessibility → 启用 terminal app |
| Clipboard copy | 确保 Swift/AppKit 可用（macOS Xcode CLI tools：`xcode-select --install`） |
| Paste keystroke (macOS) | 同上方的 Accessibility fix |
| Paste keystroke (Linux) | 安装 `xdotool`（X11）或 `ydotool`（Wayland） |

## Post Type Selection

除非用户明确指定：
- **Plain text** 且不超过 10,000 characters → **Regular Post**（Premium：最多 10,000 characters；non-Premium：280）
- **Markdown file**（.md）→ **X Article**（需要 X Premium）

---

## Codex Chrome Plugin Mode

通过 bundled Chrome plugin 使用用户真实 Chrome profile 和 X login，不是 Computer Use，也不是 CDP。

**Setup**
1. 在 browser work 前加载 `chrome:Chrome` skill。
2. 如果 Node REPL `js` tool 尚不可见，用 `tool_search` 查找 `node_repl js`。
3. 严格按 Chrome skill 指引初始化 browser client，然后用 `browser.user.openTabs()` 这类轻量调用验证 extension connection。
4. 如果失败，等待 2 秒后 retry 一次；然后按 Chrome skill 的 extension checks 和 recovery steps 处理。如果 checks 通过但通信仍失败，打开新 Chrome window 前先询问用户。不要静默切换到 Computer Use 或 CDP。

**Rules**
- 使用 plugin 的 `browser.tabs.*`、`tab.playwright.*`、`tab.cua.*` 和 file chooser APIs 执行 X UI actions。
- Shell commands 可用于 Markdown preprocessing 和 rich-HTML clipboard preparation。对 X Article body images，不要依赖 image clipboard paste；使用 `Insert` → `Media` upload flow。
- Upload 报 `Not allowed` → 告诉用户：`To enable file upload, go to chrome://extensions in Chrome, click Details under the Codex extension, and enable "Allow access to file URLs." See https://developers.openai.com/codex/app/chrome-extension#upload-files for details.`
- `native pipe is closed` → 2 秒后 retry 一次轻量 browser call，然后运行 Chrome skill health checks。如果 Chrome 正在运行、extension 已启用、native host manifest 正确，则询问是否打开新 Chrome window 并 retry。不要继续通过 broken pipe 发送 browser actions。

## Chrome Computer Use Mode

使用用户现有 Chrome window、cookies、login、extensions 和 X session。

**Rules**
- 每个会控制 Chrome 的 assistant turn，都要先对 `Google Chrome` 调用 `get_app_state`。
- 可用时优先 element-index actions；仅在 editor text selection 或 drag selection 时使用 coordinates。
- 除非用户同意 mode change，否则在该模式下不要用 in-app Browser、Chrome plugin、Playwright 或 CDP 做 X UI actions。
- 如果 selection、toolbar upload 或 file-picker control 变得不可靠，停止并报告 blocker，不要静默切换到 Chrome plugin 或 CDP。

**Regular posts**
1. 打开 `https://x.com/compose/post`，把 post text 输入 composer。
2. 对每张图片：`${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image /absolute/path/to/image.png`，然后粘贴（macOS 为 `super+v`，Windows/Linux 为 `control+v`），并等待 X 完成 upload。
3. 点击 `Post` 前请求确认。

**Video posts**：打开 `https://x.com/compose/post` → 输入 text → 通过可见 media upload/file picker UI 附加视频 → 等待 upload 和 processing → 点击 `Post` 前请求确认。

**Quote tweets**：打开 tweet URL → 在可见 quote/repost UI 中选择 Quote → 输入 comment → 点击 `Post` 前请求确认。

## X Articles (UI Modes)

由 Codex Chrome Plugin Mode 和 Chrome Computer Use Mode 共用。Paste keys：plugin `Meta+V`（macOS）/ `Control+V`；Computer Use `super+v`（macOS）/ `control+v`。File upload：plugin file chooser API；Computer Use native file picker。

1. 转换 Markdown 并保留 image map：
   ```bash
   ${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
   ```
2. 读取 JSON output 中的 `title`、`coverImage` 和 `contentImages`（`placeholder` → `localPath`）。
3. 打开 `https://x.com/compose/articles`；如有需要点击 create/write，或打开目标 draft。
4. 如果有 cover 则上传。Plugin：如果 upload 被 extension permissions 阻止（`Not allowed`），停止并报告上方 permission fix。Computer Use：如果 file picker 无法可靠操作，停止并询问，不要静默切换到 CDP。
5. 填写 title，然后复制 rich HTML：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
   ```
6. 点击 article body，用真实 paste keystroke 粘贴。
7. 仅 Plugin：验证 body 已出现且包含 `XIMGPH_` placeholders。Shell 写入 clipboard 后，不要把 `tab.clipboard.readText()` 当作 system clipboard 的证明；macOS 可用 `pbpaste` 验证。
8. 按 placeholder 顺序处理每个 `contentImages` item：
   - 点击精确可见的 placeholder text（`XIMGPH_N`）设置 insertion point。
   - Toolbar `Insert` → `Media`；在 modal 中点击带 `aria-label="Add photos or video"` 的 icon button，而不是 "Choose a file or drag it here" text/dropzone 或 hidden file input。
   - 上传该图片的 `localPath`；等待 image block 出现且 upload activity 完成。
   - 如果 `XIMGPH_N` 仍留在图片上方，先精确选中该 placeholder 并按 `Delete`；只有当 `Delete` 失败且确认选中文本正好是 placeholder 时，才使用 `Backspace`。
   - 继续前验证该 placeholder 的 count 为 `0`。
9. 验证没有 `XIMGPH_` 残留，且 expected number of images 可见；打开 Preview 检查 title、cover、body、links 和 images。
10. 点击 `Publish` 前请求 explicit confirmation。

更多内容（frontmatter、md-to-html output、formatting、troubleshooting）：`references/articles.md`。

---

## CDP Script Mode (Fallback)

只有当选定 browser-control mode 不可用、不可靠，或用户要求 CDP 时才使用。如果用户明确要求 Codex Chrome plugin 或 Chrome Computer Use，必须先解释 blocker 并获得同意后才使用 CDP。

Scripts 会通过 CDP 启动或复用真实 Chrome，填入内容并保持 browser 打开；用户 review 后手动 publish（`x-article.ts` 仅在带 `--submit` 时发布，见 Publish gate）。

### Regular Posts

```bash
${BUN_X} {baseDir}/scripts/x-browser.ts "Hello!" --image ./photo.png
```

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content（positional） |
| `--image <path>` | Image file（可重复，最多 4 张） |
| `--profile <dir>` | Custom Chrome profile |

Manual clipboard/paste steps、troubleshooting、internals：`references/regular-posts.md`。

### Video Posts

```bash
${BUN_X} {baseDir}/scripts/x-video.ts "Check this out!" --video ./clip.mp4
```

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content（positional） |
| `--video <path>` | Video file（MP4、MOV、WebM） |
| `--profile <dir>` | Custom Chrome profile |

Limits：regular 140s max，Premium 60min。Processing：30-60s。

### Quote Tweets

```bash
${BUN_X} {baseDir}/scripts/x-quote.ts https://x.com/user/status/123 "Great insight!"
```

| Parameter | Description |
|-----------|-------------|
| `<tweet-url>` | URL to quote（positional） |
| `<comment>` | Comment text（positional，可选） |
| `--profile <dir>` | Custom Chrome profile |

### X Articles

```bash
${BUN_X} {baseDir}/scripts/x-article.ts article.md
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg
```

| Parameter | Description |
|-----------|-------------|
| `<markdown>` | Markdown file（positional） |
| `--cover <path>` | Cover image |
| `--title <text>` | Override title |

Frontmatter：`title`、`cover_image`。

**Post-composition check**：script 会在所有 images 插入后报告剩余的 `XIMGPH_` placeholders 以及 expected vs actual image count。如果输出 warnings，在用户 publish 前告知具体问题。

### Troubleshooting

**`Chrome debug port not ready` / `Unable to connect`**（仅 CDP）：自动且无需询问地 kill 现有 Chrome CDP instances 并 retry：

```bash
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null; pkill -f "Chromium.*remote-debugging-port" 2>/dev/null; sleep 2
```

## Extension Support

通过 EXTEND.md 自定义配置，见 Preferences。
