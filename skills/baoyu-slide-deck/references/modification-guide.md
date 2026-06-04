# Slide 修改指南

初次生成后修改单张 slide 的工作流。

## 编辑单张 Slide

用修改后的内容重新生成指定 slide：

1. 确认要编辑的 slide（例如 `03-slide-key-findings.png`）
2. 更新 `prompts/03-slide-key-findings.md` 中的 prompt
3. 如果内容变化较大，更新文件名里的 slug
4. 使用相同的 session ID 重新生成图片
5. 重新生成 PPTX 和 PDF

## 新增 Slide

在指定位置插入一张新 slide：

1. 指定插入位置（例如第 3 张 slide 之后）
2. 创建带有合适 slug 的新 prompt（例如 `04-slide-new-section.md`）
3. 生成新的 slide 图片
4. **重新编号文件**：所有后续 slide 的 NN 都加 1
   - `04-slide-conclusion.png` → `05-slide-conclusion.png`
   - slug 保持不变
5. 更新 `outline.md`，加入新的 slide 条目
6. 重新生成 PPTX 和 PDF

## 删除 Slide

删除一张 slide 并重新编号：

1. 确认要删除的 slide（例如 `03-slide-key-findings.png`）
2. 删除图片文件和 prompt 文件
3. **重新编号文件**：所有后续 slide 的 NN 都减 1
   - `04-slide-conclusion.png` → `03-slide-conclusion.png`
   - slug 保持不变
4. 更新 `outline.md`，移除该 slide 条目
5. 重新生成 PPTX 和 PDF

## 文件命名约定

文件使用有意义的 slug，以提升可读性：

```
NN-slide-[slug].png
NN-slide-[slug].md (in prompts/)
```

示例：
- `01-slide-cover.png`
- `02-slide-problem-statement.png`
- `03-slide-key-findings.png`
- `04-slide-back-cover.png`

## Slug 规则

| 规则 | 说明 |
|------|-------------|
| 格式 | Kebab-case（小写，用连字符） |
| 来源 | 来自 slide 标题/内容 |
| 唯一性 | 在同一个 deck 内必须唯一 |
| 更新 | 内容变化较大时更新 slug |

## 重新编号规则

| 场景 | 操作 |
|----------|--------|
| 新增 slide | 所有后续 slide 的 NN 加 1 |
| 删除 slide | 所有后续 slide 的 NN 减 1 |
| 重新排序 slide | 更新 NN，使其匹配新位置 |
| 编辑 slide | NN 不变，必要时更新 slug |

**重要**：重新编号时 slug 保持不变。只修改 NN 前缀。

## 修改后检查清单

任何修改之后：

- [ ] 图片文件已正确重命名/创建
- [ ] Prompt 文件已正确重命名/创建
- [ ] 后续文件已重新编号（如果新增/删除）
- [ ] `outline.md` 已更新并反映变更
- [ ] PPTX 已重新生成
- [ ] PDF 已重新生成
- [ ] outline header 中的 slide 数量已更新
