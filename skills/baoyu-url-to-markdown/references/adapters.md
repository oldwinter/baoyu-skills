# Adapters & Media

选择 adapter、处理 media，或回答 adapter-specific 问题时阅读。

## 内置 Adapters

| Adapter | URLs | 关键能力 |
|---------|------|-------------|
| `x` | x.com, twitter.com | Tweets、threads、X Articles、media、login detection |
| `youtube` | youtube.com, youtu.be | Transcript/captions、chapters、cover image、metadata |
| `hn` | news.ycombinator.com | Threaded comments、story metadata、nested replies |
| `generic` | Any URL (fallback) | Defuddle extraction、Readability fallback、auto-scroll、network idle detection |

Adapter 会根据 URL 自动选择。可用 `--adapter <name>` 覆盖。

### YouTube

- 可用时提取 transcripts/captions
- Transcript format：`[MM:SS] Text segment`，带 chapter headings
- 可用性取决于 YouTube 是否暴露 caption track；禁用 captions 或受限播放的视频可能只产生 description-only output
- 如果页面需要时间加载完 player metadata，使用 `--wait-for force`

### X/Twitter

- 提取 single tweets、threads 和 X Articles
- 自动检测 login state；如果已登出且内容需要 auth，JSON output 会显示 `"status": "needs_interaction"`
- 对 login-protected content 使用 `--wait-for interaction`

### Hacker News

- 解析 threaded comments，并保留正确 nesting 与 reply hierarchy
- 包含 story metadata（title、URL、author、score、comment count）
- 显示 comment deletion/dead status

## Media Download Workflow

由 EXTEND.md 中的 `download_media` 驱动：

| Setting | 行为 |
|---------|----------|
| `1` (always) | 使用 `--download-media --output <path>` 运行 CLI |
| `0` (never) | 使用 `--output <path>` 运行 CLI（不下载 media） |
| `ask` (default) | 遵循下面的 ask-each-time flow |

### Ask-Each-Time Flow

1. 使用 `--output <path>` 运行 CLI，但**不带** `--download-media` → markdown 已保存
2. 检查已保存 markdown 中是否有 remote media URLs（image/video links 中的 `https://`）
3. **如果没有 remote media** → 完成，不需要提问
4. **如果发现 remote media** → 通过 `AskUserQuestion` 询问：
   - header: "Media", question: "Download N images/videos to local files?"
   - "Yes" — 下载到本地目录
   - "No" — 保留 remote URLs
5. 如果用户确认 → 使用 `--download-media --output <same-path>` **再次**运行 CLI（用本地化 links 覆盖 markdown）

### Media Layout

启用 `--download-media` 时：

- Images → 输出文件旁的 `imgs/`（或 `--media-dir`）
- Videos → 输出文件旁的 `videos/`（或 `--media-dir`）
- Markdown media links 会改写为本地相对路径

## Output Format

Markdown 输出到 stdout（或通过 `--output` 输出到文件）。

JSON output（`--format json`）返回结构化数据：

- `adapter` — 处理该 URL 的 adapter
- `status` — `"ok"` 或 `"needs_interaction"`
- `login` — login state detection（`logged_in`、`logged_out`、`unknown`）
- `interaction` — interaction gate details（kind、provider、prompt）
- `document` — structured content（url、title、author、publishedAt、content blocks、metadata）
- `media` — 收集到的 media assets，包含 url、kind、role
- `markdown` — 转换后的 markdown text
- `downloads` — media download results（使用 `--download-media` 时）
