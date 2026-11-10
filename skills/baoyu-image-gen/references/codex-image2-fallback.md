---
name: codex-image2-fallback
description: 当 baoyu-image-gen 缺少 OpenAI API credentials 但 Codex/native image generation 可用时的 fallback 行为
---

# Codex Image2 Fallback

在没有 `OPENAI_API_KEY` 时使用 `--provider openai --model gpt-image-2.5-flare`，会失败并显示：

```text
OPENAI_API_KEY is required. Codex/ChatGPT desktop login does not automatically grant OpenAI Images API access to this script.
```

这是预期行为。`openai` provider 使用 public OpenAI Images API，并需要 `OPENAI_API_KEY`。Codex / ChatGPT image2 entitlement 是独立的 runtime-native path。

## Fallback pattern

1. provider credentials 可用时，使用 `baoyu-image-gen`。
2. 如果只是缺少 `OPENAI_API_KEY` 而失败，不要让用户等待。使用第一个可用项：
   - Codex runtime 原生 `imagegen` skill/tool（如可用）。
   - `baoyu-image-gen --provider codex-cli`（优先；包装 bundled `scripts/codex-imagegen/main.ts`，上游 `packages/baoyu-codex-imagegen/src/main.ts`），前提是 `codex` CLI 已安装并登录。
   - Hermes 原生 `image_generate`（如可用）。
3. Reference images：如果 backend 接受 refs，直接传入；否则从它们派生简洁的 identity-preserving prompt，并说明这是 text-description fallback，不是严格的 reference-image editing。
4. 及时返回生成的 media path 或 structured backend error。

## 面向用户的措辞

使用简洁措辞，例如：

> The OpenAI API path needs `OPENAI_API_KEY`; Codex login is a separate image2 backend. I used the available Codex/native image backend instead. Reference images were [passed directly / reconstructed from visual traits].

避免暗示 `baoyu-image-gen --provider openai` 可以在没有专用 provider implementation 的情况下使用 Codex OAuth。
