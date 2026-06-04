# Style Maintenance（baoyu-comic）

## 添加新 Style

1. 创建 style definition：`skills/baoyu-comic/references/styles/<style-name>.md`
2. 更新 SKILL.md：添加到 `--style` options table + auto-selection entry
3. 生成 showcase image：
   ```bash
   ${BUN_X} skills/baoyu-danger-gemini-web/scripts/main.ts \
     --prompt "A single comic book page in <style-name> style showing [scene]. Features: [characteristics]. 3:4 portrait aspect ratio comic page." \
     --image screenshots/comic-styles/<style-name>.png
   ```
4. 压缩：`${BUN_X} skills/baoyu-compress-image/scripts/main.ts screenshots/comic-styles/<style-name>.png`
5. 更新两份 README（`README.md` + `README.zh.md`）：添加 style 到 options、description table、preview grid

## 更新现有 Style

1. 更新 `references/styles/` 中的 style definition
2. 如果视觉特征变化，重新生成 showcase image（见上方步骤 3-4）
3. 如果描述变化，更新 README

## 删除 Style

1. 删除 style definition + showcase image（`.webp`）
2. 从 SKILL.md 的 `--style` options + auto-selection 中移除
3. 从两份 README 中移除（options、description table、preview grid）

## Style Preview Grid Format

```markdown
| | | |
|:---:|:---:|:---:|
| ![style1](./screenshots/comic-styles/style1.webp) | ![style2](./screenshots/comic-styles/style2.webp) | ![style3](./screenshots/comic-styles/style3.webp) |
| style1 | style2 | style3 |
```
