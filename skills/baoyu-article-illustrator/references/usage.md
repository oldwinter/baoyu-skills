# Usage

## Command Syntax

```bash
# 根据内容自动选择 type 和 style
/baoyu-article-illustrator path/to/article.md

# 指定 type
/baoyu-article-illustrator path/to/article.md --type infographic

# 指定 style
/baoyu-article-illustrator path/to/article.md --style blueprint

# 组合 type 和 style
/baoyu-article-illustrator path/to/article.md --type flowchart --style notion

# 指定 density
/baoyu-article-illustrator path/to/article.md --density rich

# 保存 prompts 后，最多并行生成 4 张图
/baoyu-article-illustrator path/to/article.md --batch-size 4

# 直接输入内容（paste mode）
/baoyu-article-illustrator
[paste content]
```

## Options

| Option | Description |
|--------|-------------|
| `--type <name>` | Illustration type（见 SKILL.md 的 Type Gallery） |
| `--style <name>` | Visual style（见 references/styles.md） |
| `--preset <name>` | type + style 组合的快捷方式（见 [references/style-presets.md](references/style-presets.md)） |
| `--density <level>` | 图片数量：minimal / balanced / rich |
| `--batch-size <n>` | 本次运行的临时 generation batch size。默认使用 EXTEND.md 中的 `generation_batch_size`，否则为 4。限制到 1-8。 |

## Input Modes

| Mode | Trigger | Output Directory |
|------|---------|------------------|
| File path | `path/to/article.md` | 使用 `default_output_dir` 偏好；未设置时询问 |
| Paste content | 无 path 参数 | `illustrations/{topic-slug}/` |

## Output Directory Options

| Value | Path |
|-------|------|
| `same-dir` | `{article-dir}/` |
| `illustrations-subdir` | `{article-dir}/illustrations/` |
| `independent` | `illustrations/{topic-slug}/` |

在 EXTEND.md 中配置：`default_output_dir: illustrations-subdir`

## Examples

**带数据的技术文章**：

```bash
/baoyu-article-illustrator api-design.md --type infographic --style blueprint
```

**同一需求使用 preset**：

```bash
/baoyu-article-illustrator api-design.md --preset tech-explainer
```

**个人故事**：

```bash
/baoyu-article-illustrator journey.md --preset storytelling
```

**包含步骤的教程**：

```bash
/baoyu-article-illustrator how-to-deploy.md --preset tutorial --density rich
```

**Poster style 观点文章**：

```bash
/baoyu-article-illustrator opinion.md --preset opinion-piece
```

**Preset + override**：

```bash
/baoyu-article-illustrator article.md --preset tech-explainer --style notion
```
