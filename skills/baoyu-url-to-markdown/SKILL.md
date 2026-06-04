---
name: baoyu-url-to-markdown
description: 使用 baoyu-fetch CLI（Chrome CDP + site-specific adapters）抓取任意 URL 并转换为 markdown。内置 X/Twitter、YouTube transcripts、Hacker News threads 和基于 Defuddle 的 generic pages adapters。通过交互等待模式处理 login/CAPTCHA。当用户想把网页保存为 markdown 时使用。
version: 1.61.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-url-to-markdown
    requires:
      anyBins:
        - bun
---

# URL to Markdown

通过 `baoyu-fetch` CLI（Chrome CDP + site-specific adapters）抓取任意 URL，并转换为干净的 markdown。

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## CLI Setup

**Important**：CLI source vendored 在 `{baseDir}/scripts/lib` 中。`scripts/package.json` 只安装 third-party runtime dependencies。

**Agent Execution Instructions**：

1. 确定当前 SKILL.md 文件的目录路径为 `{baseDir}`
2. 解析 `${BUN}` runtime：如果已安装 `bun` → `bun`；否则建议安装 Bun
3. 如果 `{baseDir}/scripts/node_modules` 不存在，运行 `${BUN} install --cwd {baseDir}/scripts`
4. `${READER}` = `{baseDir}/scripts/baoyu-fetch`
5. 把本文档中所有 `${READER}` 替换为 resolved value

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | 读取、解析并应用 settings |
| Not found | **必须**执行 first-time setup（见下方），不要静默创建 defaults |

**EXTEND.md supports**：是否默认下载 media、默认 output directory。

### First-Time Setup ⛔ BLOCKING

当找不到 EXTEND.md 时，**必须**使用 `AskUserQuestion` 收集偏好后再创建 EXTEND.md。**绝不要**用静默 defaults 创建 EXTEND.md。Setup 完成前，生成流程 BLOCKED。把以下三个问题 batch 到一次调用：

- **Q1 — Media**（header "Media"）："How to handle images and videos in pages?"
  - "Ask each time (Recommended)" — 每次保存后询问
  - "Always download" — 下载到本地 `imgs/` 和 `videos/`
  - "Never download" — 保留 remote URLs
- **Q2 — Output**（header "Output"）："Default output directory?"
  - "url-to-markdown (Recommended)" — 保存到 `./url-to-markdown/{domain}/{slug}.md`
  - 用户可选择 "Other" 并输入 custom path
- **Q3 — Save**（header "Save"）："Where to save preferences?"
  - "User (Recommended)" — `~/.baoyu-skills/`（所有 projects）
  - "Project" — `.baoyu-skills/`（仅当前 project）

用户回答后，写入 EXTEND.md，确认 "Preferences saved to [path]"，然后继续。

完整 template：[references/config/first-time-setup.md](references/config/first-time-setup.md)。

### Supported Keys

| Key | Default | Values | Description |
|-----|---------|--------|-------------|
| `download_media` | `ask` | `ask` / `1` / `0` | `ask` = 每次询问，`1` = always，`0` = never |
| `default_output_dir` | empty | path or empty | 默认 output directory（empty = `./url-to-markdown/`） |

**EXTEND.md → CLI mapping**：

| EXTEND.md key | CLI argument | Notes |
|---------------|-------------|-------|
| `download_media: 1` | `--download-media` | 需要设置 `--output` |
| `default_output_dir: ./posts/` | Agent 构造 `--output ./posts/{domain}/{slug}.md` | Agent 生成路径，不是直接 flag |

**Value priority**：CLI arguments → EXTEND.md → skill defaults。

## Usage

```bash
# Default: headless capture, markdown to stdout
${READER} <url>

# Save to file
${READER} <url> --output article.md

# Save with media download
${READER} <url> --output article.md --download-media

# Wait for interaction (login/CAPTCHA) — auto-detect and continue
${READER} <url> --wait-for interaction --output article.md

# Wait for interaction — manual control (Enter to continue)
${READER} <url> --wait-for force --output article.md

# JSON output
${READER} <url> --format json --output article.json

# Force specific adapter
${READER} <url> --adapter youtube --output transcript.md
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | 要抓取的 URL |
| `--output <path>` | Output file path（default: stdout） |
| `--format <type>` | Output format：`markdown`（default）或 `json` |
| `--json` | `--format json` 的 shorthand |
| `--adapter <name>` | 强制 adapter：`x`、`youtube`、`hn` 或 `generic`（default: auto-detect） |
| `--headless` | 强制 headless Chrome（无可见窗口） |
| `--wait-for <mode>` | Interaction wait mode：`none`（default）、`interaction` 或 `force` |
| `--wait-for-interaction` | `--wait-for interaction` 的 alias |
| `--wait-for-login` | `--wait-for interaction` 的 alias |
| `--timeout <ms>` | Page load timeout（default: 30000） |
| `--interaction-timeout <ms>` | Login/CAPTCHA wait timeout（default: 600000 = 10 min） |
| `--interaction-poll-interval <ms>` | Interaction checks 的 poll interval（default: 1500） |
| `--download-media` | 下载图片/视频到本地 `imgs/` 和 `videos/`，并重写 markdown links。需要 `--output` |
| `--media-dir <dir>` | Downloaded media 的 base directory（default: 与 `--output` 目录相同） |
| `--cdp-url <url>` | 复用现有 Chrome DevTools Protocol endpoint |
| `--browser-path <path>` | Custom Chrome/Chromium binary path |
| `--chrome-profile-dir <path>` | Chrome user data directory（default: `BAOYU_CHROME_PROFILE_DIR` env 或 `./baoyu-skills/chrome-profile`） |
| `--debug-dir <dir>` | 写入 debug artifacts（document.json、markdown.md、page.html、network.json） |

## Agent Quality Gate

**CRITICAL**：把默认 headless capture 视为 provisional。有些网站在 headless mode 中渲染不同，可能在 CLI 不报错的情况下静默返回低质量内容。

每次 headless run 后，都要检查保存的 markdown。完整 checklist、recovery workflow 和 capture-mode table 见 [references/quality-gate.md](references/quality-gate.md)。当运行结果可疑，或用户询问 login/CAPTCHA 处理时，读取该文件。

## Output Path Generation

Agent 必须构造 output file path：`baoyu-fetch` 不会自动生成路径。

**Algorithm**：

1. 从 EXTEND.md `default_output_dir` 或默认 `./url-to-markdown/` 确定 base directory
2. 从 URL 提取 domain（例如 `example.com`）
3. 从 URL path 或 page title 生成 slug（kebab-case，2-6 个词）
4. 构造：`{base_dir}/{domain}/{slug}/{slug}.md`。每个 URL 使用独立目录，便于隔离 media files
5. Conflict resolution：追加 timestamp `{slug}-YYYYMMDD-HHMMSS/{slug}-YYYYMMDD-HHMMSS.md`

把构造出的路径传给 `--output`。Media files（`--download-media`）保存在 markdown 文件旁边的子目录中，使每个 URL 的 assets 自包含。

## Adapters & Media

Adapter catalog（X、YouTube、Hacker News、generic）、per-adapter notes、media download flow（`ask` / always / never）和 JSON output schema 见 [references/adapters.md](references/adapters.md)。在回答 adapter-specific 问题或处理 media prompts 前先读取。

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BAOYU_CHROME_PROFILE_DIR` | Chrome user data directory（也可使用 `--chrome-profile-dir`） |

**Troubleshooting**：找不到 Chrome → 使用 `--browser-path`。Timeout → 增大 `--timeout`。Login/CAPTCHA → `--wait-for interaction`。Debug → 使用 `--debug-dir` 检查 captured HTML 和 network logs。

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持 keys 见上方 **Preferences** section。
