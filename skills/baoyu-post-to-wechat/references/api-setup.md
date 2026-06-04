# API Credential Setup

当缺少 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 时的 guided setup。由 article-posting workflow 的 Step 2 调用。

## 检测

按以下顺序查找 credentials：

1. Env vars `WECHAT_APP_ID` / `WECHAT_APP_SECRET`
2. `<cwd>/.baoyu-skills/.env` with `WECHAT_APP_ID=...`
3. `$HOME/.baoyu-skills/.env` with `WECHAT_APP_ID=...`

如果都不存在，运行下面的 guided setup。

## Guided Setup

向用户展示此消息，并询问保存位置：

```
WeChat API credentials not found.

To obtain credentials:
1. Visit https://mp.weixin.qq.com
2. Go to: 开发 → 基本配置
3. Copy AppID and AppSecret

Where to save?
A) Project-level: .baoyu-skills/.env (this project only)
B) User-level: ~/.baoyu-skills/.env (all projects)
```

用户选择位置后，收集这些值（优先使用 user-input tool；否则按 SKILL.md 的 User Input Tools 规则 fallback 到编号 prompt），并追加：

```
WECHAT_APP_ID=<user_input>
WECHAT_APP_SECRET=<user_input>
```

## Multi-Account Variant

如果用户配置了多个 accounts（EXTEND.md 中的 `accounts:` block），改用 prefixed keys - 见 `multi-account.md` → "Credential Resolution"。
