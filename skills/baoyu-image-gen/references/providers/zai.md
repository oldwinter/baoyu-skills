# Z.AI GLM-Image

默认模型：`glm-image`。

## 模型

**`glm-image`**（推荐的默认模型）

- 仅 text-to-image（暂不支持 `--ref`）
- 原生 `quality` 选项为 `hd` 和 `standard`；本 skill 把 `2k` 映射为 `hd`，把 `normal` 映射为 `standard`
- 推荐尺寸：`1280x1280`, `1568x1056`, `1056x1568`, `1472x1088`, `1088x1472`, `1728x960`, `960x1728`
- 自定义 `--size` 要求宽/高在 `[1024, 2048]` 内、可被 `32` 整除、总像素 ≤ `2^22`

**`cogview-4-250304`**（legacy family，同一 endpoint）

- 自定义 `--size` 要求宽/高在 `[512, 2048]` 内、可被 `16` 整除、总像素 ≤ `2^21`

## 行为说明

- Sync API 返回临时 URL；baoyu-image-gen 会下载并写入本地
- Sync API 只返回单张图片，因此 `--n > 1` 会被拒绝

## 官方参考

- [GLM-Image Guide](https://docs.z.ai/guides/image/glm-image)
- [Generate Image API](https://docs.z.ai/api-reference/image/generate-image)
