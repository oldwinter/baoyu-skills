# Setup & troubleshooting - wx-cli environment

加载时机：（a）在尚未验证 wx-cli 的新环境中首次运行；或（b）任何 `wx` 命令失败。

## 前置条件

调用 workflow 前，先验证环境。按顺序运行这些检查；遇到第一个失败即停止，并给出用户需要运行的确切下一条命令。

1. **wx-cli installed** - 运行 `wx --version`。如果缺失，告诉用户自行安装（`npm install -g @jackwener/wx-cli`，或使用 https://github.com/jackwener/wx-cli 上的替代方式）。**不要自动安装**，此 repo 禁止 piped/silent installs。
2. **`~/.wx-cli` directory 由当前用户拥有** - 历史上 `sudo wx init` 会把这个目录 chown 给 root，导致之后每个非 sudo `wx` 调用都失败。检查：
   ```bash
   ls -la ~/.wx-cli/ 2>/dev/null | head -5
   ```
   如果目录存在但 owner 是 `root`（或任何不是 `$(whoami)` 的用户），告诉用户自行修复：
   ```bash
   sudo chown -R $(whoami) ~/.wx-cli
   sudo rm -f ~/.wx-cli/daemon.pid ~/.wx-cli/daemon.sock
   wx daemon start
   ```
   Skill 不应代表用户运行 `sudo`。
3. **wx-cli initialized** - `wx sessions` 应返回数据。如果它因 "no keys" / "init required" 失败，指示用户在 WeChat 运行时执行 `wx init`（macOS 上先执行 `codesign --force --deep --sign - /Applications/WeChat.app`）。优先非 sudo init；只有当用户的 wx-cli 版本要求时才 fallback 到 `sudo wx init`，并提醒他们之后需要执行步骤 2 的 chown。
4. **WeChat 4.x 正在运行且已登录** - daemon 查找数据文件需要它。

## wx-cli quick reference

| Command | 用途 |
|---------|---------|
| `wx --version` | Sanity-check wx-cli 是否已安装 |
| `wx sessions --json` | 列出最近 sessions；用于验证 init 和查找用户自己的 wxid |
| `wx contacts --query "<name>" --json` | 按 display name、remark 或 wxid fuzzy-match contacts/groups |
| `wx history "<group>" --since DATE --until DATE -n N --json` | 以 JSON 拉取某群在日期范围内的 messages |
| `wx members "<group>" --json` | 列出群成员（很少需要，主要为完整性） |
| `wx stats "<group>" --since DATE` | wx-cli 内置 stats；我们从 `wx history` JSON 自行计算，以便格式匹配 digest |
| `wx daemon status` / `wx daemon stop` / `wx daemon logs --follow` | Daemon lifecycle（troubleshooting） |

所有 `wx` commands 都接受 `--json` 以输出 machine-readable 结果。默认输出是 YAML，只在 debugging 时给人眼查看。

## 排障

当 `wx` command 失败时，按症状诊断，不要盲目重试。常见模式：

| 症状 | 原因 | 修复方式（告诉用户运行这些命令，不要替他们运行 `sudo`） |
|---------|-------|----------------------------------------------------------------|
| `Operation not permitted` / `Access denied to ~/.wx-cli` | Sandbox 开启 | 用 `dangerouslyDisableSandbox: true` 重新运行命令。持久修复：用 `/sandbox` 允许 `~/.wx-cli` 和 WeChat data dir。 |
| `无法写入 /Users/<u>/.wx-cli` / `Permission denied` | `~/.wx-cli` 属于 root（legacy `sudo wx init`） | `sudo chown -R $(whoami) ~/.wx-cli && sudo rm -f ~/.wx-cli/daemon.{pid,sock} && wx daemon start` |
| `wx history` hangs / times out / returns nothing | Daemon 卡住 | `wx daemon stop && rm -f ~/.wx-cli/daemon.{pid,sock} && wx daemon start`，然后重试 |
| daemon 曾可用但后来出现 `no keys` / `init required` | Keys 过期（WeChat restart、version upgrade） | 确保 WeChat 正在运行，然后 `wx init --force`（先非 sudo；只有 wx-cli 版本要求时才用 `sudo`） |
| `wx contacts` 对已知存在的群返回零行 | 群被折叠进折叠群，或 daemon 尚未索引 | `wx sessions --json` 并在那里搜索；如果仍缺失，运行 `wx daemon stop && wx daemon start` 后重试 |
| 返回了 Messages，但 `--since` / `--until` 窗口看起来不对 | Date string 不是 `YYYY-MM-DD` 格式，或 timezone off-by-one | 确认日期是 local-time `YYYY-MM-DD`。再按 `timestamp` 在本地过滤 JSON，作为双保险。 |
| 明明应该有活动的 chat 返回空结果 | 对活跃群而言 `-n` cap 太低 | 提高 `-n`（例如到 20000）并重新 fetch |

**完全摸不着头脑时的恢复顺序：**

1. WeChat 是否正在运行？
2. `~/.wx-cli` 是否归 `$(whoami)` 所有？
3. daemon 是否健康？（`wx daemon status`）
4. 重启 daemon（`wx daemon stop && wx daemon start`）
5. 最后手段：`wx init --force`（WeChat 运行时）

不要在 skill 内自动重试，每次失败都应给出清晰诊断和用户需要运行的确切命令。
