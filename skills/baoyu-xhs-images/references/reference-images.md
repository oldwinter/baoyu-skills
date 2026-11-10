# Reference Images（用户参考图）

用户提供的 refs 与内部的「image-1 作为 anchor」链条（Step 3）**相互独立** —— 它们叠加在该链条之上。

**接收**：通过 `--ref <files...>`，或对话中粘贴的路径。
- 有文件路径 → 复制到 `refs/NN-ref-{slug}.{ext}`
- 只粘贴图片、没有路径 → 询问路径，或提取 style 特征作为文字 fallback

**使用模式**（逐个 reference 指定）：

| Usage | 效果 |
|-------|--------|
| `direct` | 把文件传给 backend（通常只用于 image 1，让 anchor 沿链条传递） |
| `style` | 提取 style 特征，追加到每张卡片的 prompt body |
| `palette` | 提取 hex 颜色，追加到每张卡片的 prompt body |

在每个受影响的卡片 prompt frontmatter 中记录 refs：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

生成时：先验证文件存在。image 1 使用 `usage: direct`，且 backend 接受 refs → 通过 backend 的 ref 参数传入（成为链条 anchor）。images 2+ 仍按 Step 3 使用 image-1 作为 `--ref` —— **不要**再把用户 refs 叠加到上面（避免信号冲突）。对于 `style`/`palette`，把提取出的特征嵌入每个 prompt。
