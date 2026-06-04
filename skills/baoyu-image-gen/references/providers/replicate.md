# Replicate

当用户选择 `--provider replicate` 时阅读。Replicate support 有意限制在 baoyu-image-gen 能够本地验证并保存、不会丢失 outputs 的 model families。

## Supported Families

**`google/nano-banana*`** (default: `google/nano-banana-2`)

- 支持 prompt-only 和 reference-image generation
- 使用 Replicate `aspect_ratio`、`resolution` 和 `output_format`
- `--size <WxH>` 只作为已文档化 `aspect_ratio` 加 `1K` / `2K` 的 shorthand 接受

**`bytedance/seedream-4.5`**

- 支持 prompt-only 和 reference-image generation
- 使用 Replicate `size`、`aspect_ratio` 和 `image_input`
- Local validation 会在 API call 前阻止不支持的 `1K` requests

**`bytedance/seedream-5-lite`**

- 支持 prompt-only 和 reference-image generation
- 使用 Replicate `size`、`aspect_ratio` 和 `image_input`
- Local validation 目前只接受 `2K` / `3K`

**`wan-video/wan-2.7-image`**

- 支持 prompt-only 和 reference-image generation
- 使用 Replicate `size` 和 `images`
- Max output 为 2K

**`wan-video/wan-2.7-image-pro`**

- 支持 prompt-only 和 reference-image generation
- 使用 Replicate `size` 和 `images`
- 4K 仅允许用于 text-to-image；local validation 会阻止 `4K + --ref`

## Guardrails

- 在此工具中，Replicate 当前只支持 single-output save semantics；保持 `--n 1`
- 如果某个 model 不在上面的 compatibility list 中，baoyu-image-gen 会将它视为 prompt-only，并拒绝 advanced local options，而不是猜测 nano-banana-style schema

## Examples

```bash
# Default model
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Explicit model
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana
```
