# Codex OAuth vs OpenAI API key for baoyu-image-gen

`baoyu-image-gen --provider openai` 使用标准 OpenAI Images API，并需要 `OPENAI_API_KEY`。它调用 OpenAI-compatible image endpoints，如 `/images/generations` 和 `/images/edits`。

Codex / ChatGPT login 是另一条路径。Codex image generation 由 Codex OAuth 和 Codex runtime 的 `image_gen` capability 驱动，而不是 public OpenAI Images API key 路径。Codex OAuth token 不能直接替代 `OPENAI_API_KEY`；把 `OPENAI_BASE_URL` 设为 Codex backend 也不会让 baoyu-image-gen 现有的 `openai` provider 可用，因为 auth、route 和 payload shape 都不同。

## 应该改用什么

- 如果在 Codex 内运行且原生 `imagegen` skill/tool 可用，直接使用它。
- 如果在 Codex 外运行，但 `codex` CLI 已安装并登录，调用 `baoyu-image-gen --provider codex-cli`（优先）。它会启动 bundled `scripts/codex-imagegen/main.ts`，并通过 baoyu-image-gen 的标准 CLI + batch flow 暴露其 retry/cache/log 机制。此 skill 外的 standalone callers 可以运行 `packages/baoyu-codex-imagegen/src/main.ts` 中的同一套代码。两者都会调用 `codex exec` 和 Codex `image_gen` tool；不需要 `OPENAI_API_KEY`。
- 如果在 Hermes 内运行且原生 `image_generate` tool 可用，将其作为 runtime-native fallback。需要明确 reference images 是直接传入，还是仅从提取出的 traits 重建。
- `baoyu-image-gen` 已经暴露独立的 `codex-cli` provider（包装 bundled `scripts/codex-imagegen/`）；不要修改现有 `openai` provider 来添加 Codex OAuth。

## Reference-image prompting note

使用真实 reference images 做 identity preservation 时，避免对 subject 写很长的泛化描述。长描述可能导致模型合成一个相似但新的 person/object。优先使用直接措辞：

> Use the person/object in the reference image(s) as the same identity. Do not redesign it or create a similar-looking new subject. Only change scene, clothing, pose, lighting, rendering style, and composition.
