---
name: first-time-setup
description: baoyu-image-gen 的首次设置与默认模型选择流程
---

# First-Time Setup

## 概览

触发条件：

1. 未找到 EXTEND.md → 完整 setup（provider + model + preferences）
2. 找到 EXTEND.md，但 `default_model.[provider]` 为 null → 只选择 model

## Setup Flow

```text
No EXTEND.md found          EXTEND.md found, model null
        │                            │
        ▼                            ▼
┌─────────────────────┐    ┌──────────────────────┐
│ AskUserQuestion     │    │ AskUserQuestion       │
│ (full setup)        │    │ (model only)          │
└─────────────────────┘    └──────────────────────┘
        │                            │
        ▼                            ▼
┌─────────────────────┐    ┌──────────────────────┐
│ Create EXTEND.md    │    │ Update EXTEND.md      │
└─────────────────────┘    └──────────────────────┘
        │                            │
        ▼                            ▼
    Continue                     Continue
```

## Flow 1：No EXTEND.md（Full Setup）

**Language**：使用用户输入语言或已保存 language preference。

使用 AskUserQuestion，并把所有问题放入 **一次调用**：

### Question 1：Default Provider

```yaml
header: "Provider"
question: "Default image generation provider?"
options:
  - label: "Google (Recommended)"
    description: "Gemini multimodal - high quality, reference images, flexible sizes"
  - label: "OpenAI"
    description: "GPT Image 2 - latest OpenAI image model, reference-image workflows"
  - label: "Azure OpenAI"
    description: "Azure-hosted GPT Image deployments with resource-specific routing"
  - label: "OpenRouter"
    description: "Router for Gemini/FLUX/OpenAI-compatible image models"
  - label: "DashScope"
    description: "Alibaba Cloud - Qwen-Image, strong Chinese/English text rendering"
  - label: "Z.AI"
    description: "GLM-image, strong poster and text-heavy image generation"
  - label: "MiniMax"
    description: "MiniMax image generation with subject-reference character workflows"
  - label: "Replicate"
    description: "Curated Replicate image families - nano-banana-2, Seedream, and Wan image models"
  - label: "Agnes"
    description: "Sapiens AI Agnes - 针对高信息密度、复杂布局和 reference-image 支持优化"
```

### Question 2：Default Google Model

仅当用户选择 Google 或 auto-detect（没有 explicit provider）时展示。

```yaml
header: "Google Model"
question: "Default Google image generation model?"
options:
  - label: "gemini-3-pro-image (Recommended)"
    description: "Highest quality, best for production use"
  - label: "gemini-3.1-flash-image"
    description: "Fast generation, good quality, lower cost"
  - label: "gemini-3-flash-preview"
    description: "Fast generation, balanced quality and speed"
```

### Question 2b：Default OpenRouter Model

仅当用户选择 OpenRouter 时展示。

```yaml
header: "OpenRouter Model"
question: "Default OpenRouter image generation model?"
options:
  - label: "google/gemini-3.1-flash-image (Recommended)"
    description: "Best general-purpose OpenRouter image model with reference-image workflows"
  - label: "google/gemini-2.5-flash-image-preview"
    description: "Fast Gemini preview model on OpenRouter"
  - label: "black-forest-labs/flux.2-pro"
    description: "Strong text-to-image quality through OpenRouter"
```

### Question 2c：Default Azure Deployment

仅当用户选择 Azure OpenAI 时展示。

```yaml
header: "Azure Deploy"
question: "Default Azure image deployment name?"
options:
  - label: "gpt-image-2 (Recommended)"
    description: "Use if your Azure deployment uses the GPT Image 2 model name"
  - label: "gpt-image-1.5"
    description: "Previous GPT Image deployment name"
  - label: "gpt-image-1"
    description: "Earlier GPT Image deployment name"
```

### Question 2d：Default MiniMax Model

仅当用户选择 MiniMax 时展示。

```yaml
header: "MiniMax Model"
question: "Default MiniMax image generation model?"
options:
  - label: "image-01 (Recommended)"
    description: "Best default, supports aspect ratios and custom width/height"
  - label: "image-01-live"
    description: "Faster variant, use aspect ratio instead of custom size"
```

### Question 2e：Default Z.AI Model

仅当用户选择 Z.AI 时展示。

```yaml
header: "Z.AI Model"
question: "Default Z.AI image generation model?"
options:
  - label: "glm-image (Recommended)"
    description: "Best default for posters, diagrams, and text-heavy images"
  - label: "cogview-4-250304"
    description: "Legacy Z.AI image model on the same endpoint"
```

### Question 3：Default Quality

```yaml
header: "Quality"
question: "Default image quality?"
options:
  - label: "2k (Recommended)"
    description: "2048px - covers, illustrations, infographics"
  - label: "normal"
    description: "1024px - quick previews, drafts"
```

### Question 4：Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

### Save Locations

| 选择 | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Current project |
| User | `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | All projects |

### EXTEND.md Template

```yaml
---
version: 1
default_provider: [selected provider or null]
default_quality: [selected quality]
default_aspect_ratio: null
default_image_size: null
default_image_api_dialect: null
default_model:
  google: [selected google model or null]
  openai: null
  azure: [selected azure deployment or null]
  openrouter: [selected openrouter model or null]
  dashscope: null
  zai: [selected Z.AI model or null]
  minimax: [selected minimax model or null]
  replicate: null
  agnes: null
---
```

如果用户选择 `OpenAI`，但说明 endpoint 只是 OpenAI-compatible 且前面接的是其他 image model family，只有在用户明确确认该 gateway 期望 aspect-ratio `size` + metadata-based resolution 时，保存 `default_image_api_dialect: ratio-metadata`。否则保持 `null` / `openai-native`。

## Flow 2：EXTEND.md Exists, Model Null

当 EXTEND.md 存在但 `default_model.[current_provider]` 为 null 时，只询问当前 provider 的 model question。

### Google Model Selection

```yaml
header: "Google Model"
question: "Choose a default Google image generation model?"
options:
  - label: "gemini-3-pro-image (Recommended)"
    description: "Highest quality, best for production use"
  - label: "gemini-3.1-flash-image"
    description: "Fast generation, good quality, lower cost"
  - label: "gemini-3-flash-preview"
    description: "Fast generation, balanced quality and speed"
```

### OpenAI Model Selection

```yaml
header: "OpenAI Model"
question: "Choose a default OpenAI image generation model?"
options:
  - label: "gpt-image-2 (Recommended)"
    description: "Latest GPT Image model, flexible sizes up to 4K, high-fidelity image inputs"
  - label: "gpt-image-1.5"
    description: "Previous GPT Image model"
  - label: "gpt-image-1"
    description: "Earlier GPT Image model"
```

### Azure Deployment Selection

```yaml
header: "Azure Deploy"
question: "Choose a default Azure image deployment name?"
options:
  - label: "gpt-image-2 (Recommended)"
    description: "Use when your Azure deployment name matches the GPT Image 2 model"
  - label: "gpt-image-1.5"
    description: "Use when your Azure deployment name matches the GPT Image 1.5 model"
  - label: "gpt-image-1"
    description: "Use when your Azure deployment name matches GPT-image-1"
```

Azure setup notes：

- 在 `baoyu-image-gen` 中，Azure `--model` / `default_model.azure` 应该是 Azure deployment name，而不只是底层 model family。
- 如果 deployment name 是 custom，就把 exact deployment name 保存到 `default_model.azure`。

### OpenRouter Model Selection

```yaml
header: "OpenRouter Model"
question: "Choose a default OpenRouter image generation model?"
options:
  - label: "google/gemini-3.1-flash-image (Recommended)"
    description: "Recommended for image output and reference-image edits"
  - label: "google/gemini-2.5-flash-image-preview"
    description: "Fast preview-oriented image generation"
  - label: "black-forest-labs/flux.2-pro"
    description: "High-quality text-to-image through OpenRouter"
```

### DashScope Model Selection

```yaml
header: "DashScope Model"
question: "Choose a default DashScope image generation model?"
options:
  - label: "qwen-image-2.0-pro (Recommended)"
    description: "Best DashScope model for text rendering and custom sizes"
  - label: "qwen-image-2.0"
    description: "Faster 2.0 variant with flexible output size"
  - label: "qwen-image-max"
    description: "Legacy Qwen model with five fixed output sizes"
  - label: "qwen-image-plus"
    description: "Legacy Qwen model, same current capability as qwen-image"
  - label: "wan2.7-image-pro"
    description: "Wan 2.7 Pro — supports up to 4K text-to-image and reference-image editing"
  - label: "wan2.7-image"
    description: "Wan 2.7 base — faster generation, up to 2K, supports reference-image editing"
  - label: "z-image-turbo"
    description: "Legacy DashScope model for compatibility"
  - label: "z-image-ultra"
    description: "Legacy DashScope model, higher quality but slower"
```

DashScope setup notes：

- 当用户需要 custom `--size`、`21:9` 这类 uncommon ratios，或强 Chinese/English text rendering 时，优先 `qwen-image-2.0-pro`。
- `qwen-image-max` / `qwen-image-plus` / `qwen-image` 只支持五个 fixed sizes：`1664*928`、`1472*1104`、`1328*1328`、`1104*1472`、`928*1664`。
- `wan2.7-image-pro` 和 `wan2.7-image` 是唯一接受 `--ref` 的 DashScope models。用户想通过 DashScope 做 reference-image editing 或 multi-image fusion 时，选择其中之一。
- 在 `baoyu-image-gen` 中，`quality` 是 compatibility preset，不是 native DashScope parameter。

### Z.AI Model Selection

```yaml
header: "Z.AI Model"
question: "Choose a default Z.AI image generation model?"
options:
  - label: "glm-image (Recommended)"
    description: "Current flagship image model with better text rendering and poster layouts"
  - label: "cogview-4-250304"
    description: "Legacy model on the sync image endpoint"
```

Z.AI setup notes：

- Posters、diagrams 和 Chinese/English text-heavy layouts 优先 `glm-image`。
- 在 `baoyu-image-gen` 中，Z.AI 当前只暴露 text-to-image；该 provider 还未接入 reference images。
- Sync Z.AI image API 返回 downloadable image URL，runtime 下载后保存到本地。

### Replicate Model Selection

```yaml
header: "Replicate Model"
question: "Choose a default Replicate image generation model?"
options:
  - label: "google/nano-banana-2 (Recommended)"
    description: "Current default for general Replicate image generation in baoyu-image-gen"
  - label: "bytedance/seedream-4.5"
    description: "Replicate Seedream 4.5 with validated local size/ref guardrails"
  - label: "bytedance/seedream-5-lite"
    description: "Replicate Seedream 5 Lite with validated local size/ref guardrails"
  - label: "wan-video/wan-2.7-image-pro"
    description: "Replicate Wan 2.7 Image Pro with 4K text-to-image support"
```

### MiniMax Model Selection

```yaml
header: "MiniMax Model"
question: "Choose a default MiniMax image generation model?"
options:
  - label: "image-01 (Recommended)"
    description: "Best general-purpose MiniMax image model with custom width/height support"
  - label: "image-01-live"
    description: "Lower-latency MiniMax image model using aspect ratios"
```

MiniMax setup notes：

- `image-01` 是最稳默认值。它支持官方 `aspect_ratio` values 和 documented custom `width` / `height` output sizes。
- 当用户更偏好快速生成且可接受 aspect-ratio-based sizing 时，`image-01-live` 很有用。
- MiniMax subject reference 当前使用 `subject_reference[].type = character`；文档建议使用 10MB 以下的 JPG/JPEG/PNG 正面人像 references。

### Update EXTEND.md

用户选择 model 后：

1. 读取现有 EXTEND.md
2. 如果存在 `default_model:` section → 更新 provider-specific key
3. 如果缺少 `default_model:` section → 添加完整 section：

```yaml
default_model:
  google: [value or null]
  openai: [value or null]
  azure: [value or null]
  openrouter: [value or null]
  dashscope: [value or null]
  zai: [value or null]
  minimax: [value or null]
  replicate: [value or null]
  agnes: [value or null]
```

只设置所选 provider 的 model；其他 provider 保持当前值或 null。

## Setup 后

1. 如有需要，创建目录
2. 写入/更新带 frontmatter 的 EXTEND.md
3. 确认："Preferences saved to [path]"
4. 继续 image generation
