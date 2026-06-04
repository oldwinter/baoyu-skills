# 更新日志

简体中文 | [简体中文副本](./CHANGELOG.zh-CN.md)

格式参考 Keep a Changelog，版本号遵循 Semantic Versioning。

## [0.1.2] - 2026-04-21

#### 变更

- 将 Defuddle 升级到 0.17.0、jsdom 升级到 29.0.2，用于通用页面提取。
- 新增 `@xmldom/xmldom` override，使 Defuddle 的可选 MathML
  依赖链保持在无漏洞版本。

#### 修复

- 修复 X/Twitter 单条内容和 X Articles 的视频提取逻辑，改为选择
  最高码率 MP4 变体，而不是预览图 URL。
- 修复 X Article 媒体渲染，视频实体现在输出为
  `[video](...)` 链接，而不是图片嵌入。

## [0.1.1] - 2026-03-27

#### 新增

- 新增 `hn` adapter，可提取 Hacker News stories 和 comment threads。
- 新增 `--download-media` 和 `--media-dir`，可下载提取出的媒体文件并
  重写 Markdown links。
- 通用提取链路新增 Defuddle 首选路径，并保留 Readability +
  HTML-to-Markdown 作为 fallback。
- 新增登录/验证场景的交互等待模式，支持手动验证 handoff 和 force-wait resume 行为。
- 新增 `--format markdown|json`，同时保留 `--json` 作为 compatibility
  alias。
- 新增基于 Changesets 的 npm publishing release automation。

#### 变更

- 将 package 和 CLI 从 `baoyu-markdown` 更名为 `baoyu-fetch`。
- 发布 package 改为直接以 Bun 执行 `src/cli.ts`，不再附带预构建的 `dist`。
- 强化 X 提取链路，覆盖 threads、articles、note tweets、embeds、image URLs、
  login state handling 和 media metadata。
- 增强 YouTube transcript 提取，并规范化 Markdown image output。

#### 修复

- 修复 X note tweet 的 URL 展开问题。
- 修复媒体下载前的 URL 规范化问题，包括 Substack media links。
- 修复交互模式的前台行为，使手动步骤更容易完成。

## [0.1.0] - 2026-03-25

#### 新增

- `baoyu-markdown` 的首个公开版本。
- 新增 Chrome CDP session management、controlled tabs 和 network journaling。
- 新增内置 `x`、`youtube` 和 generic fallback adapters。
- 新增 X article parsing、X single/tweet extraction 和 YouTube transcript
  extraction。
- 新增 Markdown rendering、document metadata output，并提供 file output、
  JSON output、debug exports、custom Chrome connection settings、
  headless mode 和 timeout control 等 CLI 支持。
