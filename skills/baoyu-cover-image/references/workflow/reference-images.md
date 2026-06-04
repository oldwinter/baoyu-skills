# Reference Image Handling

Cover generation 中处理用户提供 reference images 的指南。

## Input Detection

| Input Type | Action |
|------------|--------|
| 提供 image file path | 复制到 `refs/` → 可使用 `--ref` |
| 对话中有图片（无 path） | 使用 AskUserQuestion **询问用户文件路径** |
| 用户无法提供 path | 用文字提取 style/palette → 追加到 prompt（不写 frontmatter references） |

**CRITICAL**：只有文件确实已保存到 `refs/` 目录时，才在 prompt frontmatter 中添加 `references`。

## File Saving

**如果用户提供文件路径**：

1. 复制到 `refs/ref-NN-{slug}.{ext}`（NN = 01, 02, ...）
2. 只有当 model 不支持 `--ref` 时，才创建 description file `refs/ref-NN-{slug}.md`（见下方）
3. 继续前验证 image file 存在

**何时创建 description file**：

| Situation | Action |
|-----------|--------|
| Model 支持 `--ref`（Google, OpenAI, OpenRouter, Replicate, Seedream 4.0+） | 只复制 image。**不需要 description file。** 生成时通过 `--ref` 传入。 |
| Model 不支持 `--ref`（Jimeng, Seedream 3.0） | 复制 image + 创建 description file。将 description 嵌入 prompt text。 |

**Description File Format**（仅需要时）：

```yaml
---
ref_id: NN
filename: ref-NN-{slug}.{ext}
usage: direct | style | palette
---
[Character or style description to embed in prompt]
```

| Usage | When to Use |
|-------|-------------|
| `direct` | Model 直接看到 reference image；如果人物必须出现在输出中则必需 |
| `style` | 只提取 visual style（不适用于必须出现的人物） |
| `palette` | 只提取 color scheme |

## Verbal Extraction (No File)

当用户无法提供文件路径时：

1. 视觉分析图片，提取：colors、style、composition
2. 创建 `refs/extracted-style.md`，写入提取信息
3. 不要在 prompt frontmatter 中添加 `references`
4. 将提取出的 style/colors 直接追加到 prompt text

## Deep Analysis ⚠️ CRITICAL

References 是高优先级输入。提取**具体、可复现、可执行**的元素：

| Analysis | Description | Example (good vs bad) |
|----------|-------------|----------------------|
| **Brand elements** | Logos、wordmarks、具体 typography | Good: "Logo uses vertical parallel lines for 'm'" / Bad: "Has a logo" |
| **Signature patterns** | 独特 decorative motifs、textures | Good: "Woven intersecting curves forming diamond grid" / Bad: "Has patterns" |
| **Color palette** | 关键颜色的精确 hex values | Good: "#2D4A3E dark teal, #F5F0E0 cream" / Bad: "Dark and light colors" |
| **Layout structure** | 具体 spatial arrangement | Good: "Bottom 30% dark banner with branding" / Bad: "Has a banner" |
| **Typography** | Font style、weight、spacing、case | Good: "Uppercase, wide letter-spacing" / Bad: "Has text" |
| **Content/subject** | Reference 描绘什么 | Factual description |
| **Usage recommendation** | `direct` / `style` / `palette` | 基于分析判断 |

**Output format**：将每个元素列成 bullet，能直接复制进 prompt 作为 mandatory instruction。

### Character Analysis ⚠️ If Reference Contains People

使用 `usage: direct`，让 model 看到 reference image。同时按角色描述：**appearance**、**pose**、**clothing** → 并附上 **transformation rules**（stylize to match rendering）。

| Extract | Good | Bad |
|---------|------|-----|
| Appearance | "Woman: long wavy blonde hair, friendly smile" | "A woman" |
| Pose | "Standing, facing camera, confident posture" | "Standing" |
| Clothing | "Dark T-shirt, business casual" | "Formal" |
| Transform | "Flat-vector cartoon, keep hair color & clothing" | "Make cartoon" |

使用 `usage: direct`。将每个角色输出为 MUST/REQUIRED prompt instruction。

## Verification Output

**For saved files**：

```text
Reference Images Saved:
- ref-01-{slug}.png ✓ (can use --ref)
- ref-02-{slug}.png ✓ (can use --ref)
```

**For extracted style**：

```text
Reference Style Extracted (no file):
- Colors: #E8756D coral, #7ECFC0 mint...
- Style: minimal flat vector, clean lines...
→ Will append to prompt text (not --ref)
```

## Priority Rules

当用户提供 references 时，它们是 **HIGH PRIORITY**：

- **References override defaults**：如果 reference 与 preferred palette/rendering 冲突，以 reference 优先
- **Concrete > abstract**：提取具体元素，不要写模糊的 "clean style"
- **Mandatory language**：在 prompt 中对 reference elements 使用 "MUST"、"REQUIRED"
- **Visible in output**：生成后验证元素是否出现；未出现则强化 prompt
