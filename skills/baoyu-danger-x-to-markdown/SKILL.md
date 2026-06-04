---
name: baoyu-danger-x-to-markdown
description: 将 X（Twitter）tweets 和 articles 转换为带 YAML front matter 的 markdown。使用 reverse-engineered API，因此需要用户 consent。当用户提到 "X to markdown"、"tweet to markdown"、"save tweet"，或提供 x.com/twitter.com URLs 要求转换时使用。
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-danger-x-to-markdown
    requires:
      anyBins:
        - bun
        - npx
---

# X to Markdown

把 X 内容转换为 markdown：

- Tweets/threads → 带 YAML front matter 的 Markdown
- X Articles → 完整内容提取

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Script Directory

Scripts 位于 `scripts/` 子目录。

**Path Resolution**：

1. `{baseDir}` = 当前 SKILL.md 所在目录
2. Script path = `{baseDir}/scripts/main.ts`
3. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

## Consent Requirement

**任何转换之前**，都要检查并获得 consent。

### Consent Flow

**Step 1**：检查 consent file

```bash
# macOS
cat ~/Library/Application\ Support/baoyu-skills/x-to-markdown/consent.json

# Linux
cat ~/.local/share/baoyu-skills/x-to-markdown/consent.json
```

**Step 2**：如果 `accepted: true` 且 `disclaimerVersion: "1.0"` → 打印 warning 并继续：

```text
Warning: Using reverse-engineered X API. Accepted on: <acceptedAt>
```

**Step 3**：如果缺失或版本不匹配 → 显示 disclaimer：

```text
DISCLAIMER

This tool uses a reverse-engineered X API, NOT official.

Risks:
- May break if X changes API
- No guarantees or support
- Possible account restrictions
- Use at your own risk

Accept terms and continue?
```

使用 `AskUserQuestion`，选项为："Yes, I accept" | "No, I decline"

**Step 4**：如果接受 → 创建 consent file：

```json
{
  "version": 1,
  "accepted": true,
  "acceptedAt": "<ISO timestamp>",
  "disclaimerVersion": "1.0"
}
```

**Step 5**：如果拒绝 → 输出 "User declined. Exiting." 并停止。

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | 读取、解析并应用 settings |
| Not found | **必须**执行 first-time setup（见下方），不要静默创建 defaults |

**EXTEND.md supports**：是否默认下载 media、默认 output directory。

### First-Time Setup（BLOCKING）

**CRITICAL**：当找不到 EXTEND.md 时，**必须使用 `AskUserQuestion`** 询问用户偏好后再创建 EXTEND.md。**绝不要**不询问就用 defaults 创建 EXTEND.md。这是 **BLOCKING** 操作：setup 完成前不要继续任何 conversion。

使用 `AskUserQuestion`，把所有问题放在 **一次调用** 中：

**Question 1** — header: "Media"，question: "How to handle images and videos in tweets?"

- "Ask each time (Recommended)" — 保存 markdown 后询问是否下载 media
- "Always download" — 始终把 media 下载到本地 imgs/ 和 videos/ directories
- "Never download" — 在 markdown 中保留原始 remote URLs

**Question 2** — header: "Output"，question: "Default output directory?"

- "x-to-markdown (Recommended)" — 保存到 ./x-to-markdown/{username}/{tweet-id}.md
- 用户可选择 "Other" 并输入 custom path

**Question 3** — header: "Save"，question: "Where to save preferences?"

- "User (Recommended)" — ~/.baoyu-skills/（所有 projects）
- "Project" — .baoyu-skills/（仅当前 project）

用户回答后，在选定位置创建 EXTEND.md，确认 "Preferences saved to [path]"，然后继续。

完整参考：[references/config/first-time-setup.md](references/config/first-time-setup.md)

### Supported Keys

| Key | Default | Values | Description |
|-----|---------|--------|-------------|
| `download_media` | `ask` | `ask` / `1` / `0` | `ask` = 每次询问，`1` = 始终下载，`0` = 从不 |
| `default_output_dir` | empty | path or empty | 默认 output directory（empty = `./x-to-markdown/`） |

**Value priority**：

1. CLI arguments（`--download-media`、`-o`）
2. EXTEND.md
3. Skill defaults

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts <url>
${BUN_X} {baseDir}/scripts/main.ts <url> -o output.md
${BUN_X} {baseDir}/scripts/main.ts <url> --download-media
${BUN_X} {baseDir}/scripts/main.ts <url> --json
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | Tweet 或 article URL |
| `-o <path>` | Output path |
| `--json` | JSON output |
| `--download-media` | 下载 image/video assets 到本地 `imgs/` 和 `videos/`，并把 markdown links 重写为本地相对路径 |
| `--login` | 仅刷新 cookies |

## Supported URLs

- `https://x.com/<user>/status/<id>`
- `https://twitter.com/<user>/status/<id>`
- `https://x.com/i/article/<id>`

## Output

```markdown
---
url: "https://x.com/user/status/123"
author: "Name (@user)"
tweetCount: 3
coverImage: "https://pbs.twimg.com/media/example.jpg"
---

Content...
```

**File structure**：`x-to-markdown/{username}/{tweet-id}/{content-slug}.md`

启用 `--download-media` 时：

- Images 保存到 markdown 文件旁边的 `imgs/`
- Videos 保存到 markdown 文件旁边的 `videos/`
- Markdown media links 会被重写为本地相对路径

## Media Download Workflow

基于 EXTEND.md 中的 `download_media` setting：

| Setting | Behavior |
|---------|----------|
| `1`（always） | 使用 `--download-media` flag 运行 script |
| `0`（never） | 不带 `--download-media` flag 运行 script |
| `ask`（default） | 遵循下方 ask-each-time flow |

### Ask-Each-Time Flow

1. **不带** `--download-media` 运行 script → 保存 markdown
2. 检查保存的 markdown 中是否有 remote media URLs（image/video links 中的 `https://`）
3. **如果没有 remote media** → 完成，无需询问
4. **如果发现 remote media** → 使用 `AskUserQuestion`：
   - header: "Media"，question: "Download N images/videos to local files?"
   - "Yes" — 下载到本地 directories
   - "No" — 保留 remote URLs
5. 如果用户确认 → **再次**带 `--download-media` 运行 script（用 localized links 覆盖 markdown）

## Authentication

1. **Environment variables**（preferred）：`X_AUTH_TOKEN`、`X_CT0`
2. **Chrome login**（fallback）：自动打开 Chrome，并在本地缓存 cookies

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** section。
