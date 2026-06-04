---
name: baoyu-compress-image
description: 将图片压缩为 WebP（默认）或 PNG，并自动选择可用工具。当用户要求 "compress image"、"optimize image"、"convert to webp" 或减小图片文件体积时使用。
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-compress-image
    requires:
      anyBins:
        - bun
        - npx
---

# Image Compressor

使用最佳可用工具压缩图片（sips → cwebp → ImageMagick → Sharp）。

## Script Directory

Scripts 位于 `scripts/` 子目录。`{baseDir}` = 当前 SKILL.md 所在目录路径。解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。把本文档中的 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | 图片压缩 CLI |

## Preferences（EXTEND.md）

按优先级检查 EXTEND.md：第一个找到的文件生效。

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-compress-image/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-compress-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-compress-image/EXTEND.md` | User home |

如果没有找到，使用默认值。

**EXTEND.md supports**：默认格式、默认质量、是否保留原图偏好。

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts <input> [options]
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `<input>` | | 文件或目录 | Required |
| `--output` | `-o` | Output path | Same path, new ext |
| `--format` | `-f` | webp、png、jpeg | webp |
| `--quality` | `-q` | 质量 0-100 | 80 |
| `--keep` | `-k` | 保留原图 | false |
| `--recursive` | `-r` | 处理子目录 | false |
| `--json` | | JSON output | false |

## Examples

```bash
# Single file → WebP（替换原文件）
${BUN_X} {baseDir}/scripts/main.ts image.png

# 保持 PNG 格式
${BUN_X} {baseDir}/scripts/main.ts image.png -f png --keep

# Directory recursive
${BUN_X} {baseDir}/scripts/main.ts ./images/ -r -q 75

# JSON output
${BUN_X} {baseDir}/scripts/main.ts image.png --json
```

**Output**：

```text
image.png → image.webp (245KB → 89KB, 64% reduction)
```

## Extension Support

通过 EXTEND.md 自定义配置。路径和支持选项见 **Preferences** section。
