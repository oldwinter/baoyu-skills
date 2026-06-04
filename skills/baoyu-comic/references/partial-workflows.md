# Partial Workflows

运行 workflow 特定部分的选项。

## Options Summary

| Option | Steps Executed | Output |
|--------|----------------|--------|
| `--storyboard-only` | 1-3 | `storyboard.md` + `characters/` |
| `--prompts-only` | 1-5 | + `prompts/*.md` |
| `--images-only` | 7-9 | + images + PDF |
| `--regenerate N` | 7 (partial) | 指定 page(s) + PDF |

---

## Using `--storyboard-only`

只生成 storyboard 和 characters，不生成 prompts 或 images：

```bash
/baoyu-comic content.md --storyboard-only
```

**Workflow**：仅 Steps 1-3（storyboard + characters 后停止）

**Output**：

- `analysis.md`
- `storyboard.md`
- `characters/characters.md`

**Use case**：在生成 images 前 review 和编辑 storyboard。适用于：

- 获取 narrative structure 反馈
- 手动调整 panel layouts
- 定义 custom characters

---

## Using `--prompts-only`

生成 storyboard、characters 和 prompts，但不生成 images：

```bash
/baoyu-comic content.md --prompts-only
```

**Workflow**：Steps 1-5（生成 prompts，跳过 images）

**Output**：

- `analysis.md`
- `storyboard.md`
- `characters/characters.md`
- `prompts/*.md`

**Use case**：在 image generation 前 review 和编辑 prompts。适用于：

- 微调 image generation prompts
- 在提交生成前确保 visual consistency
- 在 prompt 层调整 style

---

## Using `--images-only`

从已有 prompts 生成 images（从 Step 7 开始）：

```bash
/baoyu-comic comic/topic-slug/ --images-only
```

**Workflow**：跳到 Step 7，然后执行 8-9

**Prerequisites**（目录中必须存在）：

- 包含 page prompt files 的 `prompts/` 目录
- 包含 style information 的 `storyboard.md`
- 包含 character definitions 的 `characters/characters.md`

**Output**：

- `characters/characters.png`（如果不存在）
- `NN-{cover|page}-[slug].png` images
- `{topic-slug}.pdf`

**Use case**：编辑 prompts 后重新生成 images。适用于：

- 从 image generation 失败中恢复
- 尝试不同 image generation settings
- 手动编辑 prompt 后重新生成

---

## Using `--regenerate`

只重新生成指定 pages：

```bash
# Single page
/baoyu-comic comic/topic-slug/ --regenerate 3

# Multiple pages
/baoyu-comic comic/topic-slug/ --regenerate 2,5,8

# Cover page
/baoyu-comic comic/topic-slug/ --regenerate 0
```

**Workflow**：

1. 读取指定 pages 的已有 prompts
2. 只重新生成这些 pages 的 images
3. 重新生成 PDF

**Prerequisites**（必须存在）：

- 指定 pages 对应的 `prompts/NN-{cover|page}-[slug].md`
- `characters/characters.png`（作为 reference）

**Output**：

- 指定 pages 的重新生成版 `NN-{cover|page}-[slug].png`
- 更新后的 `{topic-slug}.pdf`

**Use case**：修复指定 pages，而不重新生成整部 comic。适用于：

- 修复单个问题 page
- 迭代特定 visuals
- 编辑 prompt 后重新生成 pages

**Page numbering**：

- `0` = Cover page
- `1-N` = Content pages
