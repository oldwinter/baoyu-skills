# Preferences —— 支持的 keys 与首次设置

从 SKILL.md 的 `## Preferences (EXTEND.md)` 读取：解析或写入 EXTEND.md 时参考 key 表，找不到 EXTEND.md 时执行设置流程。

## 支持的 keys

EXTEND.md 是纯文本，使用 `key: value` 或 `key=value` 行，`#` 表示 comments，keys 大小写不敏感。

| Key | Type | Default | 用途 |
|-----|------|---------|---------|
| `self_wxid` | string | (required) | 所属账号的 wxid。`from_wxid` 与它匹配的消息会归属为用户本人。 |
| `self_display` | string | (required) | 在 digest 文本中替换用户本人消息的显示名。 |
| `default_version` | `normal` / `roast` / `both` | `normal` | 用户未特别说明时生成哪些版本。 |
| `default_time_range` | string（例如 `7d`、`24h`、`1d`） | (none) | 用户省略时间且没有 incremental anchor 时使用的默认范围。 |
| `data_root` | path | `{project_root}/wechat` | 覆盖 digest folders 的存放位置。 |
| `bot_aliases` | comma-separated strings | `bot, 精华bot` | 触发「@bot 答疑」section 的名称。包含 `@<alias>`（case-insensitive）的消息会被视为面向 digest bot 的问题/请求。选择不会匹配任何真实群成员或现有 bot 的名称，避免歧义。 |

Starter template 位于 [EXTEND.md.example](../EXTEND.md.example)。

## First-Time Setup（BLOCKING）

如果找不到 EXTEND.md，不要静默继续。

**Step A —— 先尝试自动发现 `self_wxid` 和 `self_display`。** 按顺序运行（遇到第一个成功项即停止）：

```bash
# 1. 如果 wx-cli 提供 whoami，直接使用
wx whoami --json 2>/dev/null

# 2. 否则，在最近 sessions 中查找自己发送的消息
wx sessions --json --limit 20 2>/dev/null
```

对于选项 2，扫描 sessions，找到用户曾发言的任何私聊/群聊 thread，并读取他们自己的 `from_wxid` / `from_nickname` pair。如果能有信心预填两个值，就把它们作为下面问题的默认值；否则留空让用户填写。

**Step B —— 用一次 `AskUserQuestion` 调用确认（batched），预填自动发现的内容：**

- `self_wxid`（例如 `wxid_abc123`）—— fallback 提示：用户可通过 `wx contacts --query "<own nickname>"` 查找，或查看 `wx sessions --json` 中任意自己发送的消息。
- `self_display`（例如 `宝玉`）—— 他们希望自己消息在 digest 中如何署名。
- `default_version` —— 从 `normal` / `roast` / `both` 中选择一个。
- `data_root` —— digest folders 存放位置。默认：`{project_root}/wechat`。输入自定义绝对路径（例如 `~/Documents/wechat-digests`）或留空使用默认。
- Save location —— 从 project / XDG / home 中选择一个。

将 EXTEND.md 写入所选路径。如果用户提供了非默认 `data_root`，将它作为未注释行写入；否则省略它（默认值会自动生效）。确认 "Preferences saved to [path]. Edit it any time to change defaults."，然后继续 digest workflow。
