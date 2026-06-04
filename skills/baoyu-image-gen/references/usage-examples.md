# Usage Examples

扩展 CLI 示例。SKILL.md 展示最小集合；当用户询问 provider-specific invocation、batch generation 或较少用的 flags 时，读取此文件。

## 核心模式

```bash
# 基础 text-to-image
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image cat.png

# 带 aspect ratio
${BUN_X} {baseDir}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9

# 高质量
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --quality 2k

# 从文件读取 prompt
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# 带 reference images（任何支持 refs 的 provider family）
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png
```

## 按 Provider

```bash
# OpenAI
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openai --model gpt-image-2

# Azure OpenAI（model = deployment name）
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider azure --model gpt-image-2

# OpenAI GPT Image 2 自定义 4K size
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cinematic landscape" --image out.png --provider openai --model gpt-image-2 --size 3840x2160

# Google 指定 model
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --provider google --model gemini-3-pro-image --ref source.png

# OpenRouter（推荐默认）
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openrouter

# OpenRouter 带 reference
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --provider openrouter --model google/gemini-3.1-flash-image --ref source.png

# DashScope（默认 model）
${BUN_X} {baseDir}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider dashscope

# DashScope Qwen-Image 2.0 Pro (custom size, Chinese text)
${BUN_X} {baseDir}/scripts/main.ts --prompt "为咖啡品牌设计一张 21:9 横幅海报，包含清晰中文标题" --image out.png --provider dashscope --model qwen-image-2.0-pro --size 2048x872

# DashScope legacy fixed-size
${BUN_X} {baseDir}/scripts/main.ts --prompt "一张电影感海报" --image out.png --provider dashscope --model qwen-image-max --size 1664x928

# DashScope Wan 2.7 Image Pro (4K text-to-image)
${BUN_X} {baseDir}/scripts/main.ts --prompt "一间有着精致窗户的花店" --image out.png --provider dashscope --model wan2.7-image-pro --size 4096x4096

# DashScope Wan 2.7 Image 带 reference image（multi-image fusion）
${BUN_X} {baseDir}/scripts/main.ts --prompt "把图2的涂鸦喷绘在图1的汽车上" --image out.png --provider dashscope --model wan2.7-image-pro --ref car.webp paint.webp

# Z.AI GLM-image
${BUN_X} {baseDir}/scripts/main.ts --prompt "一张带清晰中文标题的科技海报" --image out.png --provider zai

# Z.AI 自定义 size
${BUN_X} {baseDir}/scripts/main.ts --prompt "A science illustration with labels" --image out.png --provider zai --model glm-image --size 1472x1088

# MiniMax
${BUN_X} {baseDir}/scripts/main.ts --prompt "A fashion editorial portrait" --image out.jpg --provider minimax

# MiniMax 带 subject reference（character/portrait consistency）
${BUN_X} {baseDir}/scripts/main.ts --prompt "A girl by the library window" --image out.jpg --provider minimax --model image-01 --ref portrait.png --ar 16:9

# Replicate（默认：google/nano-banana-2）
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Replicate Seedream 4.5
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cinematic portrait" --image out.png --provider replicate --model bytedance/seedream-4.5 --ar 3:2

# Replicate Wan 2.7 Image Pro
${BUN_X} {baseDir}/scripts/main.ts --prompt "A concept frame" --image out.png --provider replicate --model wan-video/wan-2.7-image-pro --size 2048x1152

# Codex CLI（使用 Codex / ChatGPT subscription，不需要 OPENAI_API_KEY；要求 `codex` 在 PATH 上且已 `codex login`）
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cinematic portrait" --image out.png --provider codex-cli --ar 16:9

# Codex CLI 带 reference images（style/composition guidance）
${BUN_X} {baseDir}/scripts/main.ts --prompt "Match this color palette" --image out.png --provider codex-cli --ref source.png --ar 1:1
```

`codex-cli` 说明：
- 绝不自动选择 - 通过 `--provider codex-cli` 或 EXTEND.md 中的 `default_provider: codex-cli` 固定使用。
- 仅支持 `n=1`（Codex `image_gen` 每次调用返回一张图片）；`--size`、`--imageSize`、`--quality` 和 `--imageApiDialect` 会被忽略或拒绝。
- 通常比直接 OpenAI / Google API calls 慢 5-10 倍（命中 cache 除外）。可通过 `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS`、`BAOYU_CODEX_IMAGEGEN_RETRIES` 和 `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` 调整。

## Batch Mode

```bash
# 从已保存 prompt files 批量生成
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json

# 指定 worker count 的 batch
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4 --json
```

### Batch File 格式

```json
{
  "jobs": 4,
  "tasks": [
    {
      "id": "hero",
      "promptFiles": ["prompts/hero.md"],
      "image": "out/hero.png",
      "provider": "replicate",
      "model": "google/nano-banana-2",
      "ar": "16:9",
      "quality": "2k"
    },
    {
      "id": "diagram",
      "promptFiles": ["prompts/diagram.md"],
      "image": "out/diagram.png",
      "ref": ["references/original.png"]
    }
  ]
}
```

`promptFiles`、`image` 和 `ref` 中的路径相对于 batch file 所在目录解析。`jobs` 可选（会被 CLI `--jobs` 覆盖）。也接受没有 `jobs` wrapper 的顶层数组。
