---
name: codex-image2-fallback
description: 当 baoyu-image-gen 缺少 OpenAI API credentials 但 Codex/native image generation 可用时的 fallback 行为
---

# Codex Image2 Fallback

使用 `baoyu-image-gen` 搭配 `--provider openai --model gpt-image-2` 时，CLI 可能失败并显示：

```text
OPENAI_API_KEY is required. Codex/ChatGPT desktop login does not automatically grant OpenAI Images API access to this script.
```

这是预期行为。`openai` provider 使用 public OpenAI Images API，并需要 `OPENAI_API_KEY`。Codex / ChatGPT image2 entitlement 是独立的 runtime-native path。

## Practical fallback pattern

1. 当 provider credentials 可用时，先尝试 `baoyu-image-gen`。
2. 如果仅因缺少 `OPENAI_API_KEY` 而失败，不要让用户等待。
3. 按以下顺序优先使用 Codex/native raster backend：
   - Codex runtime 原生 `imagegen` skill/tool（如可用）。
   - `baoyu-image-gen --provider codex-cli`（优先；包装 bundled `scripts/codex-imagegen/main.ts`；底层 repo-level package 位于 `packages/baoyu-codex-imagegen/src/main.ts`，供 standalone callers 使用），前提是 `codex` CLI 已安装/登录。
   - Hermes 原生 `image_generate`（如可用）。
4. 对 reference-image 行为保持透明：
   - 如果 fallback backend 接受 references，传入 reference images。
   - 如果不接受，则从 references 派生简洁的 identity-preserving prompt，并说明这是 text-description fallback，不是严格 reference-image editing。
5. 及时返回生成的 media path 或 structured backend error。

## 面向用户的措辞

使用简洁措辞，例如：

> The OpenAI API path needs `OPENAI_API_KEY`; Codex login is a separate image2 backend. I used the available Codex/native image backend instead. Reference images were [passed directly / reconstructed from visual traits].

避免暗示 `baoyu-image-gen --provider openai` 可以在没有专用 provider implementation 的情况下使用 Codex OAuth。
