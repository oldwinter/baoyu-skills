---
name: baoyu-danger-gemini-web
description: 通过 reverse-engineered Gemini Web API 生成图片和文本。支持 text generation、prompt image generation、作为 vision input 的 reference images，以及 multi-turn conversations。当其他 skills 需要 image generation backend，或用户要求 "generate image with Gemini"、"Gemini text generation"，或需要 vision-capable AI generation 时使用。
version: 1.56.2
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-danger-gemini-web
    requires:
      anyBins:
        - bun
        - npx
---

# Gemini Web Client

通过 Gemini Web API 进行 text/image generation。支持 reference images 和 multi-turn conversations。

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Script Directory

**Important**：所有 scripts 都位于该 skill 的 `scripts/` 子目录。

**Agent Execution Instructions**：

1. 确定当前 SKILL.md 文件的目录路径为 `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun
4. 把本文档中的 `{baseDir}` 和 `${BUN_X}` 替换为实际值

**Script Reference**：

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Text/image generation 的 CLI entry point |
| `scripts/gemini-webapi/*` | `gemini_webapi` 的 TypeScript port（GeminiClient、types、utils） |

## Consent Check（REQUIRED）

首次使用前，确认用户同意使用 reverse-engineered API。

**Consent file locations**：

- macOS：`~/Library/Application Support/baoyu-skills/gemini-web/consent.json`
- Linux：`~/.local/share/baoyu-skills/gemini-web/consent.json`
- Windows：`%APPDATA%\baoyu-skills\gemini-web\consent.json`

**Flow**：

1. 检查 consent file 是否存在，且包含 `accepted: true` 和 `disclaimerVersion: "1.0"`
2. 如果存在有效 consent → 打印包含 `acceptedAt` date 的 warning，然后继续
3. 如果没有 consent → 展示 disclaimer，通过 `AskUserQuestion` 询问用户：
   - "Yes, I accept" → 创建包含 ISO timestamp 的 consent file，然后继续
   - "No, I decline" → 输出 decline message，并停止
4. Consent file format：`{"version":1,"accepted":true,"acceptedAt":"<ISO>","disclaimerVersion":"1.0"}`

---

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | User home |

如果没有找到，使用默认值。

**EXTEND.md supports**：default model、proxy settings、custom data directory。

## Usage

```bash
# Text generation
${BUN_X} {baseDir}/scripts/main.ts "Your prompt"
${BUN_X} {baseDir}/scripts/main.ts --prompt "Your prompt" --model gemini-3-flash

# Image generation
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cute cat" --image cat.png
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# Vision input (reference images)
${BUN_X} {baseDir}/scripts/main.ts --prompt "Describe this" --reference image.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "Create variation" --reference a.png --image out.png

# Multi-turn conversation
${BUN_X} {baseDir}/scripts/main.ts "Remember: 42" --sessionId session-abc
${BUN_X} {baseDir}/scripts/main.ts "What number?" --sessionId session-abc

# JSON output
${BUN_X} {baseDir}/scripts/main.ts "Hello" --json
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt`, `-p` | Prompt text |
| `--promptfiles` | 从 files 读取 prompt（拼接） |
| `--model`, `-m` | Model：gemini-3-pro（default）、gemini-3-flash、gemini-3-flash-thinking、gemini-3.1-pro-preview |
| `--image [path]` | Generate image（default: generated.png） |
| `--reference`, `--ref` | Vision input 的 reference images |
| `--sessionId` | Multi-turn conversation 的 Session ID |
| `--list-sessions` | 列出 saved sessions |
| `--json` | Output as JSON |
| `--login` | 刷新 cookies，然后退出 |
| `--cookie-path` | Custom cookie file path |
| `--profile-dir` | Chrome profile directory |

## Models

| Model | Description |
|-------|-------------|
| `gemini-3-pro` | Default，latest 3.0 Pro |
| `gemini-3-flash` | Fast，lightweight 3.0 Flash |
| `gemini-3-flash-thinking` | 3.0 Flash with thinking |
| `gemini-3.1-pro-preview` | 3.1 Pro preview（empty header，auto-routed） |

## Authentication

首次运行会打开 browser 进行 Google auth。Cookies 会自动缓存。

如果未显式设置 profile dir，cookie refresh 可能复用一个已经运行中的本地 Chrome/Chromium debugging session，该 session 绑定标准 user-data dir。设置 `--profile-dir` 或 `GEMINI_WEB_CHROME_PROFILE_DIR` 可强制使用 dedicated profile，并跳过 existing-session reuse。该路径是 best-effort CDP session reuse，不是 Chrome 官方文档中描述的 Chrome DevTools MCP prompt-based `--autoConnect` flow。

Supported browsers（auto-detected）：Chrome、Chrome Canary/Beta、Chromium、Edge。

强制刷新：`--login` flag。覆盖 browser：`GEMINI_WEB_CHROME_PATH` env var。

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_WEB_DATA_DIR` | Data directory |
| `GEMINI_WEB_COOKIE_PATH` | Cookie file path |
| `GEMINI_WEB_CHROME_PROFILE_DIR` | Chrome profile directory |
| `GEMINI_WEB_CHROME_PATH` | Chrome executable path |
| `HTTP_PROXY`, `HTTPS_PROXY` | 访问 Google 的 proxy（随 command inline 设置） |

## Sessions

Session files 保存在 data directory 下的 `sessions/<id>.json`。

包含：`id`、`metadata`（Gemini chat state）、`messages` array、timestamps。

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** section。
