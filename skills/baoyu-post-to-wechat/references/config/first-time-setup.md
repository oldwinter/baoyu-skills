---
name: first-time-setup
description: First-time setup flow for baoyu-post-to-wechat preferences
---

# First-Time Setup

## 概览

找不到 EXTEND.md 时，引导用户完成 preference setup。

**阻塞操作**：此 setup 必须在任何其他 workflow steps 之前完成。不要：
- 询问要发布的内容或文件
- 询问主题或发布方式
- 进入内容转换或发布

只询问此 setup flow 中的问题，保存 EXTEND.md，然后继续。

## Setup Flow

```
No EXTEND.md found
        |
        v
+---------------------+
| AskUserQuestion     |
| (all questions)     |
+---------------------+
        |
        v
+---------------------+
| Create EXTEND.md    |
+---------------------+
        |
        v
    Continue to Step 1
```

## 问题

**语言**：使用用户输入语言或已保存的语言偏好。

使用 AskUserQuestion 在一次调用中提出所有问题：

### Question 1: Default Theme

```yaml
header: "Theme"
question: "Default theme for article conversion?"
options:
  - label: "default (Recommended)"
    description: "Classic layout - centered title with border, white-on-color H2 (default: blue)"
  - label: "grace"
    description: "Elegant - text shadows, rounded cards, refined blockquotes (default: purple)"
  - label: "simple"
    description: "Minimal modern - asymmetric rounded corners, clean whitespace (default: green)"
  - label: "modern"
    description: "Large rounded corners, pill headings, spacious (default: orange)"
```

### Question 2: Default Color

```yaml
header: "Color"
question: "Default color preset? (theme default if not set)"
options:
  - label: "Theme default (Recommended)"
    description: "Use the theme's built-in default color"
  - label: "blue"
    description: "#0F4C81 经典蓝"
  - label: "red"
    description: "#A93226 中国红"
  - label: "green"
    description: "#009874 翡翠绿"
```

注意：用户可以选择 "Other" 输入任意 preset name（vermilion、yellow、purple、sky、rose、olive、black、gray、pink、orange）或 hex 值。

### Question 3: Default Publishing Method

```yaml
header: "Method"
question: "Default publishing method?"
options:
  - label: "api (Recommended)"
    description: "Fast, requires API credentials (AppID + AppSecret)"
  - label: "browser"
    description: "Slow, requires Chrome and login session"
  - label: "remote-api"
    description: "Fast, tunnels WeChat API calls through SSH to a server whose IP is on the WeChat allowlist"
```

如果用户选择 `remote-api`，提示填写 `remote_publish_host`，以及（可选）`remote_publish_user`、`remote_publish_identity_file`。这些也可以之后通过编辑 EXTEND.md 填写。

### Question 4: Default Author

```yaml
header: "Author"
question: "Default author name for articles?"
options:
  - label: "No default"
    description: "Leave empty, specify per article"
```

注意：用户很可能会选择 "Other" 来输入作者名。

### Question 5: Open Comments

```yaml
header: "Comments"
question: "Enable comments on articles by default?"
options:
  - label: "Yes (Recommended)"
    description: "Allow readers to comment on articles"
  - label: "No"
    description: "Disable comments by default"
```

### Question 6: Fans-Only Comments

```yaml
header: "Fans only"
question: "Restrict comments to followers only?"
options:
  - label: "No (Recommended)"
    description: "All readers can comment"
  - label: "Yes"
    description: "Only followers can comment"
```

### Question 7: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

## 保存位置

| 选项 | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | All projects |

## Setup 后

1. 如有需要，创建目录
2. 写入 EXTEND.md
3. 确认："Preferences saved to [path]"
4. 继续 Step 0（加载已保存 preferences）

## EXTEND.md Template

### Single Account (Default)

```md
default_theme: [default/grace/simple/modern]
default_color: [preset name, hex, or empty for theme default]
default_publish_method: [api/browser/remote-api]
default_author: [author name or empty]
need_open_comment: [1/0]
only_fans_can_comment: [1/0]
chrome_profile_path:

# Remote API publishing — only fill in if default_publish_method is remote-api
# or you plan to pass --remote on the CLI.
remote_publish_host:
remote_publish_user:
remote_publish_port:
remote_publish_identity_file:
remote_publish_known_hosts_file:
remote_publish_strict_host_key_checking:
remote_publish_connect_timeout:
remote_publish_proxy_jump:
```

有意不支持原始 `ssh` / `scp` options；只识别上方 typed keys。认证仅支持 SSH key。

### Multi-Account

```md
default_theme: [default/grace/simple/modern]
default_color: [preset name, hex, or empty for theme default]

accounts:
  - name: [display name]
    alias: [short key, e.g. "baoyu"]
    default: true
    default_publish_method: [api/browser/remote-api]
    default_author: [author name]
    need_open_comment: [1/0]
    only_fans_can_comment: [1/0]
    app_id: [WeChat App ID, optional]
    app_secret: [WeChat App Secret, optional]
    # Remote API publishing (optional, per-account override of globals)
    remote_publish_host:
    remote_publish_user:
    remote_publish_identity_file:
  - name: [second account name]
    alias: [short key, e.g. "ai-tools"]
    default_publish_method: [api/browser/remote-api]
    default_author: [author name]
    need_open_comment: [1/0]
    only_fans_can_comment: [1/0]
```

## 之后添加更多 Accounts

初始 setup 后，用户可通过编辑 EXTEND.md 添加 accounts：

1. 添加带列表项的 `accounts:` block
2. 将 per-account settings（author、publish method、comments）移入各 account entry
3. 将 global settings（theme、color）保留在 top level
4. 每个 account 需要唯一 `alias`（用于 CLI `--account` arg 和 Chrome profile 命名）
5. 在主要 account 上设置 `default: true`

## 之后修改 Preferences

用户可直接编辑 EXTEND.md，或删除它以再次触发 setup。
