# Sapiens AI Agnes Image

当用户选择 `--provider agnes` 或设置 `default_model.agnes` 时读取。默认模型是 `agnes-image-2.1-flash`。

## 模型

**`agnes-image-2.1-flash`**（唯一模型）

- 在同一个 `/images/generations` endpoint 中支持 text-to-image 和 image-to-image（通过 `--ref`）
- 支持 public URL 或 Data URI（base64）形式的 reference images
- 针对高信息密度、复杂布局和丰富细节优化
- 尺寸规则：宽高都能被 32 整除（720px 例外），长边 ≤ 2048，总像素 ≤ 约 4M
- 默认尺寸：`1024x1024`；自定义 `--size` 支持符合上述规则的任意 WxH
- 支持 `--ar`：按 2048 基准计算尺寸（长边 ≤ 2048，短边按比例，两个维度都对齐到 32px）；`1:1` 特殊映射为 `1024x1024`

## 响应格式

- 同步 API 总是返回 URL
- 默认（`--response-format file`）：下载图片并保存为 `.png`
- 传入 `--response-format url`：改为把 URL 字符串写入 `.txt`

## `--n` 行为

无论 `n` 参数是多少，Agnes API 每次请求都只返回一张图片。传入 `--n > 1` 会在发起 API 调用前由本地 `validateArgs` 报错。

## 行为说明

- 需要 API key：`AGNES_API_KEY`
- Base URL：`https://apihub.agnes-ai.com/v1`（可用 `AGNES_BASE_URL` 覆盖）
- Model override：`AGNES_IMAGE_MODEL` env
- `response_format` 总是嵌入 `extra_body`（不是请求顶层字段）
- Reference images：本地文件转为 Data URI base64 内联；远程 URL 原样传递
- Rate limit 默认值：concurrency=3，startIntervalMs=1100（可通过 `BAOYU_IMAGE_GEN_AGNES_CONCURRENCY` / `BAOYU_IMAGE_GEN_AGNES_START_INTERVAL_MS` 覆盖）
- Timeout：每个请求 120s

## 尺寸解析

- `--size <WxH>` 优先级高于 `--ar`
- `--ar` 会用以下算法映射为具体尺寸：长边 ≤ 2048，短边按比例，两个维度都对齐到 32px
- `--ar 1:1` 特殊映射为 `1024x1024`

### 常见 `--ar` 结果

| Aspect Ratio | 结果 |
|--------------|--------|
| `1:1` | `1024x1024` |
| `16:9` | `2048x1152` |
| `4:3` | `2048x1536` |
| `3:2` | `2048x1376` |
| `21:9` | `2048x896` |
| 未列出的比例 | 运行时即时计算（portrait mirror 会交换宽高） |

## 官方参考

- [Agnes AIGC API Hub](https://apihub.agnes-ai.com)
