# Workflow Mechanics

Source materialization、output directory creation 和 conflict resolution 的细节。

## Materialize Source

| Input Type | Action |
|------------|--------|
| File | 原样使用（无需 copy） |
| Inline text | 保存到 `translate/{slug}.md` |
| URL | Fetch content，保存到 `translate/{slug}.md` |

`{slug}`：从 content topic 派生的 2-4 word kebab-case slug。

## 创建 Output Directory

在 source file 旁边创建 subdirectory：`{source-dir}/{source-basename}-{target-lang}/`

示例：
- `posts/article.md` → `posts/article-zh/`
- `translate/ai-future.md` → `translate/ai-future-zh/`

## Conflict Resolution

如果 output directory 已存在，在创建新目录前先将现有目录重命名为 `{name}.backup-YYYYMMDD-HHMMSS/`。绝不覆盖已有结果。
