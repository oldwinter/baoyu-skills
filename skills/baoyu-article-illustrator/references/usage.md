# Usage

```bash
/baoyu-article-illustrator path/to/article.md                      # 自动选择 type 和 style
/baoyu-article-illustrator path/to/article.md --type flowchart --style notion
/baoyu-article-illustrator path/to/article.md --density rich
/baoyu-article-illustrator path/to/article.md --batch-size 4       # prompts 保存后最多并行生成 4 张
/baoyu-article-illustrator api-design.md --preset tech-explainer
/baoyu-article-illustrator how-to-deploy.md --preset tutorial --density rich
/baoyu-article-illustrator article.md --preset tech-explainer --style notion   # 用 preset 时覆盖 style

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
| File path | `path/to/article.md` | 使用 `default_output_dir` 偏好；未设置时询问（取值见 SKILL.md 的 Output Directory） |
| Paste content | 无 path 参数 | `illustrations/{topic-slug}/` |
