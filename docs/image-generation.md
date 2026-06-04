# Image Generation Guidelines

需要生成图片的 skills 必须委托给可用的 image generation tools（runtime-native tools 或已安装 skills）。

**Backend selection convention**：见 [image-generation-tools.md](image-generation-tools.md) 中的 runtime-neutral 规则。简短版：使用可用 backend；如果有多个则询问用户一次；如果没有则询问如何继续。本文件只说明与 backend 无关的输出约定（命名、路径）。

## Skill Selection

1. 遵循 [image-generation-tools.md](image-generation-tools.md) 中的规则：使用可用 backend；只有存在歧义时才询问。
2. 阅读所选 backend 的文档，了解参数和能力。
3. 如果用户指定了某个 backend，遵从用户指定。

## Generation Flow Template

```markdown
### Step N: Generate Images

**Backend Selection**:
1. Detect available image-generation tools/skills (runtime-native + installed)
2. If one available → use it. If multiple → ask user once. If none → ask how to proceed.
3. Read the chosen backend's docs for parameters

**Generation Flow**:
1. Write the full prompt to `prompts/NN-{type}-[slug].md` BEFORE invoking the backend
2. Call backend with the prompt (or prompt file), output path, and parameters
3. Generate sequentially by default (batch parallel only when backend supports it and user has multiple prompts)
4. Output progress: "Generated X/N"
5. On failure, auto-retry once before reporting error
```

**Batch Parallel**（仅 `baoyu-image-gen`）：通过 EXTEND.md 中的 `batch.max_workers` 按 provider 节流并发 workers。

## Output Path Convention

**Output Directory**：`<skill-suffix>/<topic-slug>/`

- `<skill-suffix>`：例如 `xhs-images`、`cover-image`、`slide-deck`、`comic`
- `<topic-slug>`：从内容主题生成 2-4 个词的 kebab-case
- 冲突：追加 timestamp `<topic-slug>-YYYYMMDD-HHMMSS`

**Source Files**：复制到 output dir，命名为 `source-{slug}.{ext}`

## Image Naming Convention

**Format**：`NN-{type}-[slug].png`

- `NN`：两位序号（01、02、...）
- `{type}`：cover、content、page、slide、illustration 等
- `[slug]`：2-5 个词的 kebab-case 描述，在目录内唯一

Examples：

```text
01-cover-ai-future.png
02-content-key-benefits.png
03-slide-architecture-overview.png
```
