---
name: baoyu-post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
version: 1.118.2
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-wechat
    requires:
      anyBins:
        - bun
        - npx
---

# 发布到 WeChat Official Account

## User Input Tools

当此 skill 需要向用户提问时，按以下工具选择规则执行（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等价工具。
2. **Fallback**：如果没有此类工具，输出带编号的纯文本消息，请用户对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持一次调用多个问题，将所有适用问题合并到一次调用；如果只支持单问题，则按优先级顺序逐个询问。

下文具体的 `AskUserQuestion` 引用只是示例；在其他 runtimes 中请替换成本地等价工具。

## Language

用用户的语言回复。用户写中文就用中文回复，写英文就用英文。技术 token（路径、flags、字段名）保持英文。

## Script Directory

`{baseDir}` = 此 SKILL.md 所在目录。解析 `${BUN_X}`：优先 `bun`；否则 `npx -y bun`；否则建议 `brew install oven-sh/bun/bun`。

| Script | 用途 |
|--------|---------|
| `scripts/wechat-browser.ts` | Image-text posts (图文) |
| `scripts/wechat-article.ts` | Article posting via browser (文章) |
| `scripts/wechat-api.ts` | Article posting via API (文章) |
| `scripts/md-to-wechat.ts` | Markdown → WeChat-ready HTML with image placeholders |
| `scripts/check-permissions.ts` | 验证环境和权限 |

## Preferences (EXTEND.md)

按顺序检查这些路径，第一个命中生效：

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | User home |

Found → 读取、解析、应用。Not found → 先运行 first-time setup（`references/config/first-time-setup.md`），再做其他事。

**Minimum keys**（大小写不敏感，接受 `1/0` 或 `true/false`）：

| Key | Default | Mapping |
|-----|---------|---------|
| `default_author` | empty | CLI/frontmatter 未提供 `author` 时的 fallback |
| `need_open_comment` | `1` | `articles[].need_open_comment` in `draft/add` |
| `only_fans_can_comment` | `0` | `articles[].only_fans_can_comment` in `draft/add` |

**Recommended EXTEND.md**:

```md
default_theme: default
default_color: blue
default_publish_method: browser
default_author: 宝玉
need_open_comment: 1
only_fans_can_comment: 0
chrome_profile_path: /path/to/chrome/profile

# Remote API publishing (optional) — only set if WeChat's IP allowlist
# excludes your local machine. See "Remote API Method" below.
# remote_publish_host: server.example.com
# remote_publish_user: deploy
# remote_publish_port: 22
# remote_publish_identity_file: ~/.ssh/id_ed25519
# remote_publish_known_hosts_file: ~/.ssh/known_hosts
# remote_publish_strict_host_key_checking: accept-new
# remote_publish_connect_timeout: 10
# remote_publish_proxy_jump: bastion.example.com
```

有意不支持原始 `ssh` / `scp` options；只识别上方 typed keys。认证仅支持 SSH key（无密码）。

**Theme options**: default, grace, simple, modern. **Color presets**: blue, green, vermilion, yellow, purple, sky, rose, olive, black, gray, pink, red, orange (or hex).

**Value priority**：CLI args → frontmatter → EXTEND.md（account-level → global）→ skill defaults。

## Multi-Account Support

EXTEND.md 支持用 `accounts:` block 管理多个 Official Accounts。存在 2+ entries 时，workflow 会插入 Step 0.5 提示选择 account（或基于 `default: true` / `--account <alias>` 自动选择）。

完整细节，包括兼容规则、per-account keys、credential resolution、per-account Chrome profiles、CLI 用法，见 `references/multi-account.md`。

## Pre-flight Check (Optional)

首次使用前，建议运行环境检查（用户可跳过）：

```bash
${BUN_X} {baseDir}/scripts/check-permissions.ts
```

检查：Chrome、profile isolation、Bun、Accessibility、clipboard、paste keystroke、API credentials、Chrome conflicts。

| 检查失败 | 修复 |
|-------------|-----|
| Chrome | 安装 Chrome 或设置 `WECHAT_BROWSER_CHROME_PATH` |
| Profile dir | 位于 `baoyu-skills/chrome-profile` 的共享 profile |
| Bun runtime | `brew install oven-sh/bun/bun` or `npm install -g bun` |
| Accessibility (macOS) | System Settings → Privacy & Security → Accessibility → 启用 terminal app |
| Clipboard copy | 确保 Swift/AppKit 可用（macOS: `xcode-select --install`） |
| Paste keystroke (Linux) | 安装 `xdotool` (X11) 或 `ydotool` (Wayland) |
| API credentials | 按 Step 2 的 guided setup，或在 `.baoyu-skills/.env` 中设置 |

## Image-Text Posting (图文)

带多张图片的短帖（最多 9 张）：

```bash
${BUN_X} {baseDir}/scripts/wechat-browser.ts --markdown article.md --images ./images/
${BUN_X} {baseDir}/scripts/wechat-browser.ts --title "标题" --content "内容" --image img.png --submit
```

详情：`references/image-text-posting.md`。

## Article Posting Workflow (文章)

```
- [ ] Step 0: Load preferences (EXTEND.md)
- [ ] Step 0.5: Resolve account (multi-account only — see references/multi-account.md)
- [ ] Step 1: Determine input type
- [ ] Step 2: Select method and configure credentials
- [ ] Step 3: Resolve theme/color and validate metadata
- [ ] Step 4: Publish to WeChat
- [ ] Step 5: Report completion
```

### Step 0: 加载 Preferences

检查并加载 EXTEND.md（见上方 "Preferences"）。如果找不到，在询问任何其他问题前完成 first-time setup。解析并缓存供后续步骤使用：`default_theme`, `default_color`, `default_author`, `need_open_comment`, `only_fans_can_comment`。

### Step 1: 确定输入类型

| 输入 | 检测 | 下一步 |
|-------|-----------|------|
| HTML file | 路径以 `.html` 结尾且文件存在 | 跳到 Step 3 |
| Markdown file | 路径以 `.md` 结尾且文件存在 | Step 2 |
| Plain text | 不是文件路径，或文件不存在 | 保存为 markdown，然后 Step 2 |

**Plain-text handling**:

1. 生成 slug（前 2-4 个有意义词，kebab-case；中文需要翻译成英文作为 slug）。
2. 保存到 `post-to-wechat/YYYY-MM-DD/<slug>.md`（需要时创建目录）。
3. 作为 markdown 文件继续。

### Step 2: 选择发布方式并配置

除非 EXTEND.md 或 CLI 已指定，否则询问 method：

| Method | 速度 | 要求 |
|--------|-------|----------|
| `api` (Recommended) | 快 | API credentials（本机 IP 已加入 allowlist） |
| `browser` | 慢 | Chrome + 已登录 session |
| `remote-api` | 快 | API credentials + IP 位于 WeChat allowlist 且可 SSH 访问的服务器 |

**选择 API 且缺少 credentials** → 按 `references/api-setup.md` 运行 guided setup（写入 `.baoyu-skills/.env`）。

**`remote-api` method**：WeChat 的“公众号设置 → IP 白名单”通常把 API 访问限制在一两个固定 IP。如果本机 IP 不在白名单中，但某台云服务器在白名单中，则使用 `remote-api`：所有 markdown rendering、image processing、draft assembly 和 HTML rewriting 仍在本地完成，只有发往 `api.weixin.qq.com` 的 outbound HTTPS calls（token、uploadimg、add_material、draft/add）通过 SSH SOCKS5 dynamic port forward（`ssh -N -D`）走隧道，让 WeChat 看到的源 IP 是 remote server。不向 remote host 写入文件；`AppSecret` 永不离开本地进程。Remote host 只需要 `sshd` 和 outbound network，不需要 Python 或 agent process。见下方 "Remote API Method"。

### Step 3: Resolve Theme/Color and Validate Metadata

1. **Theme**: CLI `--theme` → EXTEND.md `default_theme` → `default` (first match wins; do NOT ask if resolved).
2. **Color**: CLI `--color` → EXTEND.md `default_color` → omit (theme default applies).
3. **Validate metadata** (frontmatter for markdown, meta tags for HTML):

| Field | Missing → |
|-------|-----------|
| Title | 询问，或按 Enter 从内容自动生成 |
| Summary | Frontmatter `description` → `summary` → 询问或自动生成 |
| Author | CLI `--author` → frontmatter `author` → EXTEND.md `default_author` |
| Source URL | CLI `--source-url` → frontmatter `sourceUrl`/`contentSourceUrl`/`content_source_url` |

自动生成：title = 第一个 H1/H2 或第一句话；summary = 第一段，截断到 120 字符。

4. **Cover image**（API `article_type=news` 必需）：CLI `--cover` → frontmatter（`coverImage` / `featureImage` / `cover` / `image`）→ `imgs/cover.png` → 第一张 inline image → 如果仍缺失则停止并请求提供。

### Step 4: 发布

**重要：永远不要预先把 markdown 转成 HTML。** 发布脚本会在内部处理转换，而且两种方法渲染图片的方式不同：API 渲染 `<img>` tags 用于上传，browser 使用 placeholders 进行 paste-and-replace。传入预转换 HTML 会破坏其中一种方式。

**Markdown citation default**：对 markdown 输入，普通外部链接默认转换为底部引用。只有用户明确希望保留 inline links 时才使用 `--no-cite`。已有 HTML 输入保持原样。

**API method**（接受 `.md` 或 `.html`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> [--color <color>] [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>] [--source-url <url>] [--no-cite]
```

始终传入 `--theme`，即使它是 `default`。只有用户或 EXTEND.md 明确设置时才传 `--color`。

**Remote API method**（同一脚本，增加 `--remote`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> --remote [--remote-host <host>] [--remote-user <user>] [--remote-port <port>] [--remote-identity-file <path>] [--remote-known-hosts-file <path>] [--remote-strict-host-key-checking yes|no|accept-new] [--remote-connect-timeout <s>] [--remote-proxy-jump <spec>]
```

任何 `--remote-*` flag 都隐含 `--remote`。CLI values 会覆盖 EXTEND.md 中 account-level 再到 global 的 `remote_publish_*` keys。设置 `default_publish_method: remote-api` 也会在不传 `--remote` 时启用 remote mode。

**`draft/add` payload 规则**：
- Endpoint: `POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN`
- `article_type`: `news` (default) or `newspic`
- 对 `news`，包含 `thumb_media_id`（cover 必需）
- request body 中始终包含 `need_open_comment`（默认 `1`）和 `only_fans_can_comment`（默认 `0`），即使 CLI 没有暴露它们
- 对 `news`，可选包含 `content_source_url`（原文 URL，显示为“阅读原文”链接，最大 1KB）。通过 `--source-url` CLI flag 或 frontmatter `sourceUrl`/`contentSourceUrl`/`content_source_url` 提供

**Browser method**（接受 `--markdown` 或 `--html`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <markdown_file> --theme <theme> [--color <color>] [--no-cite]
${BUN_X} {baseDir}/scripts/wechat-article.ts --html <html_file>
```

### Step 5: 完成报告

```
WeChat Publishing Complete!

Input: [type] - [path]
Method: [API | Browser]
Theme: [theme] [color if set]

Article:
• Title: [title]
• Summary: [summary]
• Images: [N] inline
• Comments: [open/closed], [fans-only/all]    ← API method only

Result:
✓ Draft saved to WeChat Official Account
• media_id: [media_id]                         ← API method only

Next Steps (API):
→ Manage drafts: https://mp.weixin.qq.com (登录后进入「内容管理」→「草稿箱」)

Files created:
[• post-to-wechat/YYYY-MM-DD/slug.md (if plain text input)]
[• slug.html (converted)]
```

## 功能对比

| 功能 | Image-Text | Article (API) | Article (Remote API) | Article (Browser) |
|---------|:---:|:---:|:---:|:---:|
| Plain text 输入 | ✗ | ✓ | ✓ | ✓ |
| HTML input | ✗ | ✓ | ✓ | ✓ |
| Markdown input | Title/content | ✓ | ✓ | ✓ |
| 多图 | ✓ (up to 9) | ✓ (inline) | ✓ (inline) | ✓ (inline) |
| Themes | ✗ | ✓ | ✓ | ✓ |
| 自动生成 metadata | ✗ | ✓ | ✓ | ✓ |
| Default cover fallback (`imgs/cover.png`) | ✗ | ✓ | ✓ | ✗ |
| 评论控制 | ✗ | ✓ | ✓ | ✗ |
| 需要 Chrome | ✓ | ✗ | ✗ | ✓ |
| 需要 API credentials | ✗ | ✓ | ✓ | ✗ |
| 需要 IP 在 allowlist 且可 SSH 访问的服务器 | ✗ | ✗ | ✓ | ✗ |
| 速度 | Medium | Fast | Fast | Slow |

## Troubleshooting

| 问题 | 修复 |
|-------|-----|
| Missing API credentials | 按 Step 2 的 guided setup |
| Access token error | 验证 credentials 有效且未过期 |
| Not logged in (browser) | 首次运行会打开 browser，扫码登录。设置 `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` 可通过 Telegram 接收二维码图片 |
| Chrome not found | 设置 `WECHAT_BROWSER_CHROME_PATH` |
| Title/summary missing | 使用自动生成或手动提供 |
| No cover image | 添加 frontmatter cover，或在文章目录放置 `imgs/cover.png` |
| Wrong comment defaults | 检查 EXTEND.md 中的 `need_open_comment` / `only_fans_can_comment` |
| Paste fails | 检查系统 clipboard 权限 |
| `Remote publish host is required` | 在 EXTEND.md 中设置 `--remote-host` 或 `remote_publish_host` |
| `SOCKS proxy on 127.0.0.1:… not ready` | SSH 无法启动隧道，检查 key、host、`StrictHostKeyChecking`，或使用 `--remote-connect-timeout` |
| remote publish 期间 `ssh exited early` | 验证用户可非交互式 `ssh` 到服务器；如果链路慢，提高 `--remote-connect-timeout` |
| Remote API call 返回 `errcode 40164` (invalid IP) | remote server 的 egress IP 不在 WeChat allowlist 中；在 公众号设置 → IP 白名单 中添加 |

## 参考

| File | 内容 |
|------|---------|
| `references/image-text-posting.md` | Image-text 参数、auto-compression |
| `references/article-posting.md` | Article themes、图片处理 |
| `references/multi-account.md` | Multi-account 兼容性、credentials、Chrome profiles、CLI |
| `references/api-setup.md` | Guided credential setup |
| `references/config/first-time-setup.md` | 首次 EXTEND.md setup |

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 "Preferences"。
