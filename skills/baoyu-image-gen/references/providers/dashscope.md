# DashScope (阿里通义万象)

当用户选择 `--provider dashscope`、设置 `default_model.dashscope`，或询问 Qwen-Image 行为时读取。SKILL.md 只说明默认值，本文件覆盖 model families、尺寸规则和限制。

## Model Families

**`qwen-image-2.0*`**：推荐的现代 family。成员：`qwen-image-2.0-pro`, `qwen-image-2.0-pro-2026-03-03`, `qwen-image-2.0`, `qwen-image-2.0-2026-03-03`。

- 自由格式 `size`，使用 `宽*高` 格式
- 总像素必须在 `512*512` 到 `2048*2048` 之间
- 默认 ≈ `1024*1024`
- 最适合自定义比例（例如 `21:9`）和文字密集的中英文布局

**Fixed-size family**：`qwen-image-max`, `qwen-image-max-2025-12-30`, `qwen-image-plus`, `qwen-image-plus-2026-01-09`, `qwen-image`。

- 只允许五种尺寸：`1664*928`, `1472*1104`, `1328*1328`, `1104*1472`, `928*1664`
- 默认是 `1664*928`
- `qwen-image` 当前能力与 `qwen-image-plus` 相同

**`wan2.7-image*`**：multimodal Wan 2.7 family。成员：`wan2.7-image-pro`, `wan2.7-image`。

- 自由格式 `size`，使用 `宽*高` 格式，并支持 aspect-ratio 推断
- `wan2.7-image-pro` text-to-image（无 `--ref`）：总像素在 `[768*768, 4096*4096]`，比例在 `[1:8, 8:1]`
- 带 reference images 的 `wan2.7-image-pro` 以及 `wan2.7-image`（所有场景）：总像素在 `[768*768, 2048*2048]`，比例在 `[1:8, 8:1]`
- 默认：`1024*1024`（`--quality normal`）或 `2048*2048`（`--quality 2k`）；4K 需要显式 `--size`
- `--ref` 支持最多 9 张 reference images（image editing / multi-image fusion）
- Reference images 以内联 base64 发送（如果路径是 `http(s)://` URL，则原样传递）
- API 不使用 `prompt_extend`；此 family 中 skill 会省略它
- Wan 2.7 API 在 non-collage mode 下默认 `n` 为 **4**，并按生成图片计费。baoyu-image-gen 强制 `n: 1` 并拒绝 `--n > 1`，避免静默为额外图片付费又丢弃它们。

**Legacy**：`z-image-turbo`, `z-image-ultra`, `wanx-v1`。只有用户明确要求 legacy behavior 时才使用。

## Size Resolution

- `--size` 优先于 `--ar`
- 对 `qwen-image-2.0*`：优先使用显式 `--size`；否则用下方推荐表从 `--ar` 推断
- 对 `qwen-image-max/plus/image`：只使用五种固定尺寸；如果请求比例不合适，切换到 `qwen-image-2.0-pro`
- 对 `wan2.7-image*`：显式 `--size` 会按对应模式的像素/比例限制验证；否则从 `--ar` 和 `--quality` 推导尺寸（`normal` ≈ 1K，`2k` ≈ 2K）。如需用 `wan2.7-image-pro` text-to-image 请求 4K，请显式传入 `--size`（例如 `4096*4096`, `3840*2160`）
- `--quality` 是 baoyu-image-gen preset，不是 DashScope 官方字段。将 `normal`/`2k` 映射到 `qwen-image-2.0*` 和 `wan2.7-image*` 表是实现选择，不是 API 保证

### 推荐 `qwen-image-2.0*` 尺寸

| Ratio | `normal` | `2k` |
|-------|----------|------|
| `1:1` | `1024*1024` | `1536*1536` |
| `2:3` | `768*1152` | `1024*1536` |
| `3:2` | `1152*768` | `1536*1024` |
| `3:4` | `960*1280` | `1080*1440` |
| `4:3` | `1280*960` | `1440*1080` |
| `9:16` | `720*1280` | `1080*1920` |
| `16:9` | `1280*720` | `1920*1080` |
| `21:9` | `1344*576` | `2048*872` |

## Reference Images

- 只有 `wan2.7-image-pro` 和 `wan2.7-image` 接受 `--ref`。其他 DashScope models（qwen-image-2.0*、qwen-image-max/plus/image、legacy）会拒绝 `--ref`，并引导用户换 provider/model。
- 每次请求最多 9 张 reference images。本地文件会以内联 base64 data URLs 发送；`http(s)://` URLs 原样转发。
- 提供任何 `--ref` 都会自动把 wan2.7-image-pro 的像素上限从 4K 限制到 2K（API 只对无图片输入的纯 text-to-image 支持 4K）。

## 未暴露

DashScope APIs 还支持 `negative_prompt`, `prompt_extend`, `watermark`, `thinking_mode`, `seed`, `bbox_list`, `enable_sequential`, `color_palette`。`baoyu-image-gen` 目前没有把它们暴露为 CLI flags；wan2.7 family 依赖 API 默认值（例如 `thinking_mode=true`）。此 skill 对 wan2.7 始终发送 `n=1`；如果你需要 grid/collage mode，目前需要直接调用 API。

## 官方参考

- [Qwen-Image API](https://help.aliyun.com/zh/model-studio/qwen-image-api)
- [Text-to-image guide](https://help.aliyun.com/zh/model-studio/text-to-image)
- [Qwen-Image Edit API](https://help.aliyun.com/zh/model-studio/qwen-image-edit-api)
- [Wan 2.7 image generation & editing API](https://help.aliyun.com/zh/model-studio/wan-image-generation-and-editing-api-reference)
