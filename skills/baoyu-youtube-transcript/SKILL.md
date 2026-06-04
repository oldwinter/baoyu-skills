---
name: baoyu-youtube-transcript
description: 通过 URL 或 video ID 下载 YouTube 视频 transcripts/subtitles 和 cover images。支持多语言、翻译、chapters 和 speaker identification。缓存 raw data 以便快速重新格式化。当用户要求 "get YouTube transcript"、"download subtitles"、"get captions"、"YouTube字幕"、"YouTube封面"、"视频封面"、"video thumbnail"、"video cover image"，或提供 YouTube URL 并想提取 transcript/subtitle text 或 cover image 时使用。
version: 1.1.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-youtube-transcript
    requires:
      anyBins:
        - bun
        - npx
---

# YouTube Transcript

从 YouTube videos 下载 transcripts（subtitles/captions）。支持手工创建和自动生成的 transcripts。不需要 API key 或 browser：默认直接使用 YouTube 的 InnerTube API；当 YouTube 阻断 direct API path 时，自动 fallback 到 `yt-dlp`。

首次运行会抓取 video metadata 和 cover image，并缓存 raw data 以便快速重新格式化。

## Script Directory

Scripts 位于 `scripts/` 子目录。`{baseDir}` = 当前 SKILL.md 所在目录路径。解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。把本文档中的 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Transcript download CLI |

## Usage

```bash
# Default: markdown with timestamps (English)
${BUN_X} {baseDir}/scripts/main.ts <youtube-url-or-id>

# Specify languages (priority order)
${BUN_X} {baseDir}/scripts/main.ts <url> --languages zh,en,ja

# Without timestamps
${BUN_X} {baseDir}/scripts/main.ts <url> --no-timestamps

# With chapter segmentation
${BUN_X} {baseDir}/scripts/main.ts <url> --chapters

# With speaker identification (requires AI post-processing)
${BUN_X} {baseDir}/scripts/main.ts <url> --speakers

# SRT subtitle file
${BUN_X} {baseDir}/scripts/main.ts <url> --format srt

# Translate transcript
${BUN_X} {baseDir}/scripts/main.ts <url> --translate zh-Hans

# List available transcripts
${BUN_X} {baseDir}/scripts/main.ts <url> --list

# Force re-fetch (ignore cache)
${BUN_X} {baseDir}/scripts/main.ts <url> --refresh
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `<url-or-id>` | YouTube URL 或 video ID（允许多个） | Required |
| `--languages <codes>` | Language codes，逗号分隔，按优先级排列 | `en` |
| `--format <fmt>` | Output format：`text`、`srt` | `text` |
| `--translate <code>` | 翻译为指定 language code | |
| `--list` | 列出可用 transcripts，而不是抓取 | |
| `--timestamps` | 每段包含 `[HH:MM:SS → HH:MM:SS]` timestamps | on |
| `--no-timestamps` | 禁用 timestamps | |
| `--chapters` | 从 video description 进行 chapter segmentation | |
| `--speakers` | 输出带 metadata 的 raw transcript，供 speaker identification 使用 | |
| `--exclude-generated` | 跳过自动生成的 transcripts | |
| `--exclude-manually-created` | 跳过手工创建的 transcripts | |
| `--refresh` | 强制重新抓取，忽略 cached data | |
| `-o, --output <path>` | 保存到指定 file path | auto-generated |
| `--output-dir <dir>` | Base output directory | `youtube-transcript` |

## Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER` | Fallback 时传给 `yt-dlp --cookies-from-browser`，例如 `chrome`、`safari`、`firefox` 或 `chrome:Profile 1` |

## Input Formats

接受以下任意 video input：

- Full URL：`https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Short URL：`https://youtu.be/dQw4w9WgXcQ`
- Embed URL：`https://www.youtube.com/embed/dQw4w9WgXcQ`
- Shorts URL：`https://www.youtube.com/shorts/dQw4w9WgXcQ`
- Video ID：`dQw4w9WgXcQ`

## Output Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| `text` | `.md` | Markdown，包含 frontmatter（含 `description`）、title heading、summary、可选 TOC/cover/timestamps/chapters/speakers |
| `srt` | `.srt` | 供视频播放器使用的 SubRip subtitle format |

## Output Directory

```text
youtube-transcript/
├── .index.json                          # Video ID → directory path mapping (for cache lookup)
└── {channel-slug}/{title-full-slug}/
    ├── meta.json                        # Video metadata (title, channel, description, duration, chapters, etc.)
    ├── transcript-raw.json              # Raw transcript snippets from YouTube API (cached)
    ├── transcript-sentences.json        # Sentence-segmented transcript (split by punctuation, merged across snippets)
    ├── imgs/
    │   └── cover.jpg                    # Video thumbnail
    ├── transcript.md                    # Markdown transcript (generated from sentences)
    └── transcript.srt                   # SRT subtitle (generated from raw snippets, if --format srt)
```

- `{channel-slug}`：Channel name，kebab-case
- `{title-full-slug}`：完整 video title，kebab-case

`--list` mode 只输出到 stdout（不保存文件）。

## Caching

首次抓取时，script 保存：

- `meta.json`：video metadata、chapters、cover image path、language info
- `transcript-raw.json`：来自 YouTube API 的 raw transcript snippets（`{ text, start, duration }[]`）
- `transcript-sentences.json`：sentence-segmented transcript（`{ text, start: "HH:mm:ss", end: "HH:mm:ss" }[]`），按句末标点（`.?!…。？！` 等）切分，timestamps 按字符长度比例分配，并支持 CJK-aware text merging
- `imgs/cover.jpg`：video thumbnail

同一视频的后续运行会使用 cached data（无 network calls）。使用 `--refresh` 强制重新抓取。如果请求了不同语言，cache 会自动刷新。

当 YouTube 在 direct InnerTube path 返回 anti-bot / blocked responses 时，script 会先重试 alternate client identities，然后在可用时 fallback 到 `yt-dlp`。如果需要 fallback 但 `yt-dlp` 不可用，agent 应自行判断如何让 `yt-dlp` 可用并继续，而不是把安装决策推给用户。

SRT output（`--format srt`）从 `transcript-raw.json` 生成。Text/markdown output 使用 `transcript-sentences.json` 以获得自然句子边界。

## Workflow

当用户提供 YouTube URL 并想要 transcript：

1. 如果用户没有指定语言，先用 `--list` 运行，展示可用选项
2. **运行 script 时始终用单引号包裹 URL**：zsh 会把 `?` 当成 glob wildcard，因此未加引号的 YouTube URL 会导致 "no matches found"。使用 `'https://www.youtube.com/watch?v=ID'`
3. 默认使用 `--chapters --speakers` 运行，以获得最丰富输出（chapters + speaker identification）
4. Script 会自动保存 cached data + output file，并打印 file path
5. 对 `--speakers` mode：script 保存 raw file 后，按下方 speaker identification workflow 进行 speaker labels 后处理

当用户只想要 cover image 或 metadata 时，使用任意 option 运行 script 也会缓存 `meta.json` 和 `imgs/cover.jpg`。

当重新格式化同一视频（例如先 text 后 SRT）时，会复用 cached data，无需重新抓取。

## Chapter & Speaker Workflow

### Chapters（`--chapters`）

Script 会从 video description 解析 chapter timestamps（例如 `0:00 Introduction`），按 chapter boundaries 切分 transcript，把 snippets 组织成可读 paragraphs，并保存为带 Table of Contents 的 `.md`。无需进一步处理。

如果 description 中没有 chapter timestamps，transcript 会以 grouped paragraphs 输出，不添加 chapter headings。

### Speaker Identification（`--speakers`）

Speaker identification 需要 AI processing。Script 输出一个 raw `.md` 文件，包含：

- 带 video metadata 的 YAML frontmatter（title、channel、date、cover、description、language）
- Video description（用于提取 speaker names）
- Description 中的 chapter list（如可用）
- SRT format 的 raw transcript（预计算 start/end timestamps，token-efficient）

Script 保存 raw file 后，启动一个 sub-agent（为节省成本可使用 Sonnet 这类 cheaper model）处理 speaker identification：

1. 读取保存的 `.md` 文件
2. 读取 `{baseDir}/prompts/speaker-transcript.md` prompt template
3. 按 prompt 处理 raw transcript：
   - 使用 video metadata 识别 speakers（title → guest，channel → host，description → names）
   - 从 conversation flow、question-answer patterns 和 contextual cues 检测 speaker turns
   - 切分 chapters（优先使用 description chapters；否则从 topic shifts 创建）
   - 使用 `**Speaker Name:**` labels、paragraph grouping（2-4 sentences）和 `[HH:MM:SS → HH:MM:SS]` timestamps 格式化
4. 用处理后的 transcript 覆盖 `.md` 文件（保留 YAML frontmatter）

使用 `--speakers` 时隐含 `--chapters`：处理后的输出总是包含 chapter segmentation。

## Error Cases

| Error | Meaning |
|-------|---------|
| Transcripts disabled | 视频完全没有 captions |
| No transcript found | 请求的语言不可用 |
| Video unavailable | 视频已删除、私有或 region-locked |
| IP blocked | 请求过多，稍后再试 |
| Age restricted | 视频需要登录进行年龄验证 |
| bot detected | Script 会重试 alternate clients，然后尝试 `yt-dlp`；如果 fallback tooling 缺失，agent 应自行解决，否则若仍失败，可尝试 `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER=safari`（或你的 browser） |
