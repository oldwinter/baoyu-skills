# OpenRouter

当用户选择 `--provider openrouter` 时读取。默认 model 是 `google/gemini-3.1-flash-image`。

## Common Models

使用完整 OpenRouter model IDs：

- `google/gemini-3.1-flash-image`（推荐 - 支持 image output 和 reference-image workflows）
- `google/gemini-2.5-flash-image-preview`
- `black-forest-labs/flux.2-pro`
- 任何其他 OpenRouter image-capable model ID

## Behavior Notes

- OpenRouter image generation 使用 `/chat/completions`，不是 OpenAI `/images` endpoints
- `--ref` 需要支持 image input 和 image output 的 multimodal model
- `--imageSize` 映射到 `imageGenerationOptions.size`
- `--size <WxH>` 会转换为最接近的 supported OpenRouter size，并在可能时推断 aspect ratio
