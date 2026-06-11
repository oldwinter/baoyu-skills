---
name: preferences-schema
description: baoyu-image-gen 用户偏好的 EXTEND.md YAML schema
---

# Preferences Schema

## 完整 Schema

```yaml
---
version: 1

default_provider: null      # google|openai|azure|openrouter|dashscope|zai|minimax|replicate|jimeng|seedream|codex-cli|agnes|null (null = auto-detect; codex-cli is never auto-detected — pin it here or via --provider)

default_quality: null       # normal|2k|null (null = use default: 2k)

default_aspect_ratio: null  # "16:9"|"1:1"|"4:3"|"3:4"|"2.35:1"|null

default_image_size: null    # 1K|2K|4K|null (Google/OpenRouter, overrides quality)

default_image_api_dialect: null  # openai-native|ratio-metadata|null (OpenAI-compatible gateways; null = use env/default)

default_model:
  google: null              # e.g., "gemini-3-pro-image", "gemini-3.1-flash-image"
  openai: null              # e.g., "gpt-image-2", "gpt-image-1.5", "gpt-image-1"
  azure: null               # Azure deployment name, e.g., "gpt-image-2" or "image-prod"
  openrouter: null          # e.g., "google/gemini-3.1-flash-image"
  dashscope: null           # e.g., "qwen-image-2.0-pro"
  zai: null                 # e.g., "glm-image"
  minimax: null             # e.g., "image-01"
  replicate: null           # e.g., "google/nano-banana-2"
  codex-cli: null           # Logical label only — Codex image_gen has no user-selectable model. Default: "codex-image-gen"
  agnes: null               # e.g., "agnes-image-2.1-flash"

batch:
  max_workers: 10
  provider_limits:
    replicate:
      concurrency: 5
      start_interval_ms: 700
    google:
      concurrency: 3
      start_interval_ms: 1100
    openai:
      concurrency: 3
      start_interval_ms: 1100
    azure:
      concurrency: 3
      start_interval_ms: 1100
    openrouter:
      concurrency: 3
      start_interval_ms: 1100
    dashscope:
      concurrency: 3
      start_interval_ms: 1100
    zai:
      concurrency: 3
      start_interval_ms: 1100
    minimax:
      concurrency: 3
      start_interval_ms: 1100
    codex-cli:
      concurrency: 1
      start_interval_ms: 2000
    agnes:
      concurrency: 3
      start_interval_ms: 1100
---
```

## 字段参考

| 字段 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema 版本 |
| `default_provider` | string\|null | null | 默认 provider（null = auto-detect） |
| `default_quality` | string\|null | null | 默认 quality（null = 2k） |
| `default_aspect_ratio` | string\|null | null | 默认 aspect ratio |
| `default_image_size` | string\|null | null | Google/OpenRouter image size（覆盖 quality） |
| `default_image_api_dialect` | string\|null | null | OpenAI-compatible image dialect（`openai-native` 或 `ratio-metadata`） |
| `default_model.google` | string\|null | null | Google 默认 model |
| `default_model.openai` | string\|null | null | OpenAI 默认 model |
| `default_model.azure` | string\|null | null | Azure 默认 deployment name |
| `default_model.openrouter` | string\|null | null | OpenRouter 默认 model |
| `default_model.dashscope` | string\|null | null | DashScope 默认 model |
| `default_model.zai` | string\|null | null | Z.AI 默认 model |
| `default_model.minimax` | string\|null | null | MiniMax 默认 model |
| `default_model.replicate` | string\|null | null | Replicate 默认 model |
| `default_model.codex-cli` | string\|null | null | Codex-CLI 逻辑标签（Codex image_gen 没有用户可选 model） |
| `default_model.agnes` | string\|null | null | Agnes 默认 model |
| `batch.max_workers` | int\|null | 10 | Batch worker 上限 |
| `batch.provider_limits.<provider>.concurrency` | int\|null | provider default | 每个 provider 最大同时请求数 |
| `batch.provider_limits.<provider>.start_interval_ms` | int\|null | provider default | 每个 provider 的请求启动最小间隔 |

## 示例

**Minimal**：

```yaml
---
version: 1
default_provider: google
default_quality: 2k
default_image_api_dialect: null
---
```

**Full**：

```yaml
---
version: 1
default_provider: google
default_quality: 2k
default_aspect_ratio: "16:9"
default_image_size: 2K
default_image_api_dialect: null
default_model:
  google: "gemini-3-pro-image"
  openai: "gpt-image-2"
  azure: "gpt-image-2"
  openrouter: "google/gemini-3.1-flash-image"
  dashscope: "qwen-image-2.0-pro"
  zai: "glm-image"
  minimax: "image-01"
  replicate: "google/nano-banana-2"
  agnes: "agnes-image-2.1-flash"
batch:
  max_workers: 10
  provider_limits:
    replicate:
      concurrency: 5
      start_interval_ms: 700
    azure:
      concurrency: 3
      start_interval_ms: 1100
    zai:
      concurrency: 3
      start_interval_ms: 1100
    openrouter:
      concurrency: 3
      start_interval_ms: 1100
    minimax:
      concurrency: 3
      start_interval_ms: 1100
    agnes:
      concurrency: 3
      start_interval_ms: 1100
---
```
