# Multi-Account Support

通过一个 EXTEND.md 管理多个 WeChat Official Accounts 的细节。SKILL.md 只覆盖 single-account flow 和选择提示；当用户有 `accounts:` block、要求发布到特定账号，或需要 per-account credentials 时，读取本文件。

## Compatibility

| 条件 | Mode | 行为 |
|-----------|------|----------|
| 无 `accounts` block | Single-account | 原始行为，无变化 |
| `accounts` 只有 1 个 entry | Single-account | 自动选择，不提示 |
| `accounts` 有 2+ 个 entries | Multi-account | 发布前提示选择 |
| `accounts` 有 `default: true` | Multi-account | 预选默认项，用户可切换 |

## EXTEND.md Example

```md
default_theme: default
default_color: blue

accounts:
  - name: 宝玉的技术分享
    alias: baoyu
    default: true
    default_publish_method: api
    default_author: 宝玉
    need_open_comment: 1
    only_fans_can_comment: 0
    app_id: your_wechat_app_id
    app_secret: your_wechat_app_secret
  - name: AI工具集
    alias: ai-tools
    default_publish_method: browser
    default_author: AI工具集
    need_open_comment: 1
    only_fans_can_comment: 0
```

## Per-Account 与 Global Keys

**Per-account**（也接受 global fallback）：`default_publish_method`, `default_author`, `need_open_comment`, `only_fans_can_comment`, `app_id`, `app_secret`, `chrome_profile_path`, `remote_publish_host`, `remote_publish_user`, `remote_publish_port`, `remote_publish_identity_file`, `remote_publish_known_hosts_file`, `remote_publish_strict_host_key_checking`, `remote_publish_connect_timeout`, `remote_publish_proxy_jump`。

**Global-only**（始终共享）：`default_theme`, `default_color`。

## Account Selection (Step 0.5)

Insert between Step 0 (Load EXTEND.md) and Step 1 (Determine input type):

```
if no accounts block:
    → single-account mode (original behavior)
elif accounts.length == 1:
    → auto-select the only account
elif --account <alias> CLI arg:
    → select matching account
elif one account has default: true:
    → pre-select, display: "Using account: <name> (--account to switch)"
else:
    → prompt user to choose from the list
```

## Credential Resolution（API Method）

对选中 alias 为 `{alias}` 的 account，按以下顺序尝试（第一个命中生效）：

1. EXTEND.md account block 中内联的 `app_id` / `app_secret`
2. Env vars `WECHAT_{ALIAS}_APP_ID` / `WECHAT_{ALIAS}_APP_SECRET`（alias 转大写，hyphens → underscores）
3. `.baoyu-skills/.env` 中带前缀 key `WECHAT_{ALIAS}_APP_ID`
4. `~/.baoyu-skills/.env` 中带前缀 key
5. fallback 到无前缀 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`

### .env Multi-Account Example

```bash
# Account: baoyu
WECHAT_BAOYU_APP_ID=your_wechat_app_id
WECHAT_BAOYU_APP_SECRET=your_wechat_app_secret

# Account: ai-tools
WECHAT_AI_TOOLS_APP_ID=your_ai_tools_wechat_app_id
WECHAT_AI_TOOLS_APP_SECRET=your_ai_tools_wechat_app_secret
```

## Chrome Profile（Browser Method）

每个 account 使用隔离的 Chrome profile，避免登录态冲突。

| 来源 | Path |
|--------|------|
| EXTEND.md 中 account 的 `chrome_profile_path` | 原样使用 |
| 根据 alias 自动生成 | `{shared_profile_parent}/wechat-{alias}/` |
| Single-account fallback | 共享默认 profile |

## CLI `--account` Flag

所有发布脚本都接受 `--account <alias>`：

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme default --account ai-tools
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <file> --theme default --account baoyu
${BUN_X} {baseDir}/scripts/wechat-browser.ts --markdown <file> --images ./photos/ --account baoyu
```

## Remote API Publishing

`wechat-api.ts` 支持 `remote-api` mode：通过 SSH SOCKS5 dynamic port forward，把 WeChat API calls 隧道转发到一台 IP 位于 WeChat allowlist 的服务器。Markdown rendering、image processing、draft assembly 和 HTML rewriting 仍在本地完成；只有发往 `api.weixin.qq.com` 的 outbound HTTPS calls 走隧道。不向 remote host 写入文件，`AppSecret` 永不离开本地进程。Remote host 只需要 `sshd` 和 outbound network access。

### Per-Account Configuration

```md
default_theme: default
default_color: blue
default_publish_method: browser   # browser remains the default

accounts:
  - name: 宝玉的技术分享
    alias: baoyu
    default: true
    default_publish_method: api
    default_author: 宝玉
    app_id: your_wechat_app_id
    app_secret: your_wechat_app_secret
  - name: AI工具集
    alias: ai-tools
    default_publish_method: remote-api
    default_author: AI工具集
    app_id: your_ai_tools_app_id
    app_secret: your_ai_tools_app_secret
    remote_publish_host: ai-tools-server.example.com
    remote_publish_user: deploy
    remote_publish_port: 22
    remote_publish_identity_file: /home/me/.ssh/id_ed25519
    remote_publish_known_hosts_file: /home/me/.ssh/known_hosts
    remote_publish_strict_host_key_checking: accept-new
```

Account-level `remote_publish_*` values 会覆盖 top-level globals。CLI `--remote-*` flags 会覆盖两者。

### CLI 用法

```bash
# Use the account's default_publish_method (remote-api here):
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme default --account ai-tools

# Force remote mode regardless of default_publish_method:
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme default --account baoyu --remote --remote-host other-server.example.com
```

### 安全说明

- 认证仅支持 SSH key。不使用密码和 `ssh-askpass`。
- 只读取 typed `remote_publish_*` keys；有意不支持原始 `ssh` / `scp` options。
- 隧道转发 raw TCP；`api.weixin.qq.com` 的 TLS verification 仍由本地进程端到端执行。
