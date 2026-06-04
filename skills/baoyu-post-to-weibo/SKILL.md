---
name: baoyu-post-to-weibo
description: 将内容发布到 Weibo（微博）。支持带文本、图片和视频的普通微博，以及通过 Chrome CDP 用 Markdown 输入发布 headline articles（头条文章）。当用户要求 "post to Weibo", "发微博", "发布微博", "publish to Weibo", "share on Weibo", "写微博" 或 "微博头条文章" 时使用。
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-weibo
    requires:
      anyBins:
        - bun
        - npx
---

# 发布到 Weibo

通过真实 Chrome browser 将文本、图片、视频和长文发布到 Weibo（绕过反机器人检测）。

## Script Directory

**重要**：所有脚本都位于此 skill 的 `scripts/` 子目录。

**Agent 执行说明**：
1. 将此 SKILL.md 文件所在目录路径确定为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 将本文档中的所有 `{baseDir}` 替换为实际路径
4. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

**Script Reference**:
| Script | 用途 |
|--------|---------|
| `scripts/weibo-post.ts` | 普通微博（文本 + 图片） |
| `scripts/weibo-article.ts` | 头条文章发布（Markdown） |
| `scripts/copy-to-clipboard.ts` | 复制内容到 clipboard |
| `scripts/paste-from-clipboard.ts` | 发送真实粘贴按键 |

## Preferences (EXTEND.md)

按优先级顺序检查 EXTEND.md，找到的第一个生效：

| 优先级 | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | User home |

如果都没找到，使用默认值。

**EXTEND.md 支持**：默认 Chrome profile

## Prerequisites

- Google Chrome or Chromium
- `bun` runtime
- 首次运行：手动登录 Weibo（session 会保存）

---

## Regular Posts

文本 + 图片/视频（总计最多 18 个文件）。发布到 Weibo homepage。

```bash
${BUN_X} {baseDir}/scripts/weibo-post.ts "Hello Weibo!" --image ./photo.png
${BUN_X} {baseDir}/scripts/weibo-post.ts "Watch this" --video ./clip.mp4
```

**参数**：
| Parameter | 说明 |
|-----------|-------------|
| `<text>` | 微博内容（位置参数） |
| `--image <path>` | 图片文件（可重复） |
| `--video <path>` | 视频文件（可重复） |
| `--profile <dir>` | 自定义 Chrome profile |

**注意**：脚本会打开 browser 并填入内容。用户需要检查并手动发布。

---

## Headline Articles (头条文章)

发布到 `https://card.weibo.com/article/v3/editor` 的长篇 Markdown 文章。

```bash
${BUN_X} {baseDir}/scripts/weibo-article.ts article.md
${BUN_X} {baseDir}/scripts/weibo-article.ts article.md --cover ./cover.jpg
```

**参数**：
| Parameter | 说明 |
|-----------|-------------|
| `<markdown>` | Markdown 文件（位置参数） |
| `--cover <path>` | 封面图 |
| `--title <text>` | 覆盖标题（最多 32 字符，超出会截断） |
| `--summary <text>` | 覆盖摘要（最多 44 字符，超出会自动重新生成） |
| `--profile <dir>` | 自定义 Chrome profile |

**Frontmatter**：YAML front matter 支持 `title`, `summary`, `cover_image`。

**字符限制**：
- Title：最多 32 字符（超出会截断并警告）
- Summary/导语：最多 44 字符（超出会从内容自动重新生成）

**Markdown-to-HTML**：将 markdown 转为 HTML 时不要传任何 `--theme` 参数。使用默认 theme（无 theme 参数）。

**Article Workflow**：
1. 打开 `https://card.weibo.com/article/v3/editor`
2. 点击 "写文章" 按钮，等待 editor 变为可编辑
3. 填入标题（校验 32 字符限制）
4. 填入 summary/导语（校验 44 字符限制）
5. 通过粘贴将 HTML 内容插入 ProseMirror editor
6. 逐个替换图片 placeholders（复制图片 → 选择 placeholder → 粘贴）

**Post-Composition Check**：所有图片插入后，脚本会自动验证：
- editor 内容中剩余的 `WBIMGPH_` placeholders
- 预期图片数 vs 实际图片数

如果检查失败（输出中有 warnings），在用户发布前用具体问题提醒用户。

---

## Post Type Selection

除非用户明确指定 post type：
- **Markdown file** (`.md`) → **Headline Article**（头条文章）
- **Plain text** / 带图片文本 → **Regular Post**

## Troubleshooting

### Chrome debug port not ready

如果脚本报错 `Chrome debug port not ready` 或 `Unable to connect`，只终止 CDP Chrome instances（带 `--remote-debugging-port` 且使用 baoyu-skills profile 的那些），然后重试：

```bash
pkill -f "remote-debugging-port.*baoyu-skills/chrome-profile" 2>/dev/null; sleep 2
```

**关键**：绝不要终止所有 Chrome 进程（`pkill -f "Google Chrome"`）。只终止由 CDP 启动且使用 baoyu-skills profile directory 的 Chrome instances。用户可能打开着普通 Chrome 窗口。

**重要**：这应自动完成。遇到此错误时，不询问用户，直接终止 CDP Chrome instances 并重试命令。

## Notes

- 首次运行：需要手动登录（session 会保留）
- 所有脚本只把内容填入 browser，用户必须手动检查并发布
- 跨平台：macOS、Linux、Windows

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** 部分。
