# Regular Posts - Detailed Guide

向 X 发布文本和图片的详细文档。

## Manual Workflow

如果需要 step-by-step control：

### Step 0：Codex 中优先使用 Chrome Computer Use

在 Codex 内运行时，先检测 Chrome Computer Use 是否启用：

1. 如果 Computer Use tools 已可见，对 `Google Chrome` 调用 `get_app_state`。
2. 如果不可见，用 `tool_search` 查找 `computer-use get_app_state click press_key drag scroll Google Chrome`，然后调用 `get_app_state`。
3. 如果 `get_app_state` 成功，对所有 X UI actions 使用用户真实 Chrome + Computer Use。
4. 只有在 Computer Use 不可用或用户明确要求时，才使用 CDP scripts。

如果用户明确要求 Chrome Computer Use，未经同意不要使用 Playwright、in-app Browser 或 CDP。

### Step 1：Copy Image to Clipboard

```bash
${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image /path/to/image.png
```

### Step 2：Paste from Clipboard

```bash
# Simple paste to frontmost app
${BUN_X} {baseDir}/scripts/paste-from-clipboard.ts

# Paste to Chrome with retries
${BUN_X} {baseDir}/scripts/paste-from-clipboard.ts --app "Google Chrome" --retries 5

# Quick paste with shorter delay
${BUN_X} {baseDir}/scripts/paste-from-clipboard.ts --delay 200
```

### Step 3：Use Chrome Computer Use（Preferred）

1. 对 `Google Chrome` 使用 `get_app_state`。
2. 如有需要，将 Chrome 导航到 `https://x.com/compose/post`。
3. 点击 composer，并输入 post text。
4. 用 `copy-to-clipboard.ts image <path>` 把每张图片复制到 clipboard。
5. 用 Computer Use 按 `super+v`（macOS）或 `control+v`（Windows/Linux）。
6. 等待 X 完成 media upload。
7. 点击 `Post` 前请求 explicit confirmation。

## Image Support

- Formats：PNG、JPEG、GIF、WebP
- 每条 post 最多 4 张图片
- 图片先复制到 system clipboard，再通过 keyboard shortcut 粘贴

## Example Session

```text
User: /post-to-x "Hello from Claude!" --image ./screenshot.png

Claude:
1. Detects Chrome Computer Use
2. Opens X compose in the user's real Chrome
3. Types text into editor
4. Copies image to clipboard and pastes with Computer Use
5. Waits for upload and verifies the preview
6. Asks before clicking Post
```

## Troubleshooting

- **Chrome not found**：设置 `X_BROWSER_CHROME_PATH` environment variable
- **Not logged in**：首次运行会打开 Chrome；手动登录后 cookies 会保存
- **Image paste fails**：
  - 验证 clipboard script：`${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image <path>`
  - macOS 上，在 System Settings > Privacy & Security > Accessibility 中授予 Terminal/iTerm "Accessibility" permission
  - 粘贴操作期间保持 Chrome window 可见且在前台
- **osascript permission denied**：在 System Preferences 中授予 Terminal accessibility permissions
- **Rate limited**：等待几分钟后 retry

## How It Works

在 Chrome Computer Use mode 中：

1. Codex 控制用户可见的 Google Chrome window
2. Text 通过真实 UI 输入
3. Images 被复制到 system clipboard，并通过真实 keystrokes 粘贴
4. 最终 public post 前由用户确认

`x-browser.ts` script 是 CDP fallback。它使用 Chrome DevTools Protocol（CDP）：

1. 启动真实 Chrome（不是 Playwright），并带 `--disable-blink-features=AutomationControlled`
2. 使用 persistent profile directory 保存 login sessions
3. 通过 CDP commands（Runtime.evaluate、Input.dispatchKeyEvent）与 X 交互
4. **使用 osascript 粘贴图片**（macOS）：向 Chrome 发送真实 Cmd+V keystroke，绕过 X 可检测到的 CDP synthetic events

该方式绕过 X 对 Playwright/Puppeteer 的 anti-automation detection。

### Image Paste Mechanism（macOS）

CDP 的 `Input.dispatchKeyEvent` 发送网站可检测的 "synthetic" keyboard events。出于安全原因，X 会忽略 synthetic paste events。解决方法：

1. 通过 Swift/AppKit（`copy-to-clipboard.ts`）把图片复制到 system clipboard
2. 通过 `osascript` 把 Chrome 置于前台
3. 通过 `osascript` 和 System Events 发送真实 Cmd+V keystroke
4. 等待 upload 完成

这要求 Terminal 在 System Settings 中拥有 "Accessibility" permission。
