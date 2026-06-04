# MiniMax

当用户选择 `--provider minimax` 或设置 `default_model.minimax` 时读取。默认 model 是 `image-01`。

## Models

**`image-01`**（推荐默认）

- 支持 text-to-image 和 subject-reference image generation
- 支持官方 `aspect_ratio` values：`1:1`、`16:9`、`4:3`、`3:2`、`2:3`、`3:4`、`9:16`、`21:9`
- 通过 `--size <WxH>` 支持 documented custom `width` / `height`
- Width 和 height 都必须在 `[512, 2048]` 内，且能被 `8` 整除

**`image-01-live`** - lower-latency variant

- 使用 `--ar` 控制 sizing；MiniMax 只为 `image-01` 文档化 custom `width`/`height`

## Subject Reference

- `--ref` files 会作为 MiniMax `subject_reference` 发送
- `subject_reference[].type` 当前为 `character`
- Official docs 表示 `image_file` 支持 public URLs 或 Base64 Data URLs；baoyu-image-gen 将 local refs 作为 Data URLs 发送
- 推荐 refs：front-facing portraits、JPG/JPEG/PNG、10MB 以下

## Official References

- [Image Generation Guide](https://platform.minimaxi.com/docs/guides/image-generation)
- [Text-to-Image API](https://platform.minimaxi.com/docs/api-reference/image-generation-t2i)
- [Image-to-Image API](https://platform.minimaxi.com/docs/api-reference/image-generation-i2i)
