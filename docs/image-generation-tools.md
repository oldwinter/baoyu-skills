# Image Generation Tools

本仓库的 skills 会被多个 agent runtime 加载（Claude Code、Codex、Hermes、其他 agents、裸 CLI）。不同 runtime 暴露不同的 image-generation capability：有些有 runtime-native tool（Codex `imagegen`、Hermes `image_generate`），有些依赖已安装 skill（`baoyu-image-gen` 或用户自定义 skill）。本文件定义每个渲染图片的 skill 都应遵循的 canonical **backend-selection rule**，以保证 skills 可移植。

## The Rule

当某个 skill 需要渲染图片时，按以下顺序解析 backend：

1. **Current-request override**：如果用户在当前消息中点名某个 backend，就使用它。
2. **Saved preference**：如果该 skill 的 `EXTEND.md` 把 `preferred_image_backend` 设置为当前可用 backend，就使用它。
3. **Auto-select**（当 preference 为 `auto`、未设置，或 pinned backend 不可用时）：
   - **Codex（`imagegen`）**：首先检查 available-skills / tool inventory。如果列出了名为 `imagegen` 的 skill，说明你运行在 Codex 内，必须使用它：通过 `Skill` tool 调用，参数为 `skill: "imagegen"`，并传入已保存 prompt file 的内容（再按 Codex `imagegen` 自身参数传 output path 和 aspect ratio）。Codex `imagegen` 是该 runtime 中的官方 raster backend，优先级高于任何非 native skill（例如 `baoyu-image-gen`），除非用户显式 pinned 了不同的 `preferred_image_backend`。
   - **Other runtime-native tools**：如果 runtime 暴露其他 native image tool（例如 Hermes `image_generate`），以同样方式使用。
   - 否则，如果只安装了一个 non-native backend（例如 `baoyu-image-gen`），使用它。
   - 否则（多个 non-native backends 且无 runtime-native tool），询问用户一次，并与其他初始问题 batch。
4. **如果没有可用 backend**，告诉用户并询问如何继续。

**⛔ 绝不要用 SVG、HTML、canvas 或其他 code-based rendering 替代 raster image generation。** Codex `imagegen` 自身说明表示，当输出应为 bitmap asset 而不是 repo-native code 或 vector 时应使用它。如果第 3 步无法解析 raster backend，就进入第 4 步询问用户；不要静默输出 SVG、写 inline `<svg>` markup，或用 HTML/CSS art 替代。即使文章/段落看起来像“diagram-like”也一样：调用本规则的 consumer skill 已经决定需要 raster image。

设置 `preferred_image_backend: ask` 会强制每次运行都执行第 3 步的询问，无论当前有哪些 backend。

## The Preference Field

每个 image-consuming skill 的 `EXTEND.md` 都包含单一 `preferred_image_backend` 字段：

| Value | Meaning |
|---|---|
| `auto`（default） | 应用 auto-select 规则：优先 runtime-native；如果只安装一个 backend 则 fallback；多个 non-native 时询问。 |
| `ask` | 每次运行都确认 backend，即使存在 runtime-native tool。 |
| `<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`image_generate`） | 当该 backend 可用时固定使用；不可用时 fallback 到 `auto`。 |

该字段遵循 **absent-equals-auto**：旧的 `EXTEND.md` 即使没有该字段，也完全等同于设置了 `preferred_image_backend: auto`。引入该字段无需 bump schema version。

## Prompt File Requirement（hard）

无论选择哪个 backend，每个渲染图片的 skill 都必须在调用任何 backend **之前**，把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。Backend 接收 prompt file（或其内容）；该文件是可复现记录，也允许在不重新生成 prompts 的情况下切换 backend。

## How Skills Declare This

每个渲染图片的 `SKILL.md` 都包含 **恰好一个** `## Image Generation Tools` section（靠前位置，位于 `## User Input Tools` 之后、main workflow 之前），并且 **内联** 该规则。Skills 是自包含的，不能链接到 `docs/`；每个 skill folder 都必须在自己的 `SKILL.md` 中携带该规则。见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)。

每个 skill 的 `references/config/preferences-schema.md`（以及 `first-time-setup.md` 中的 `EXTEND.md` template）都会把 `preferred_image_backend` 与其他 preference fields 一起列出。First-time setup 不会询问用户 backend：会静默设置为 `auto`。想 pinned 特定 backend 的用户可稍后编辑 `EXTEND.md`，每个 skill 的 `## Changing Preferences` section 也记录了常见的一行编辑。

本文档和 SKILL.md 中的具体工具名（`imagegen`、`image_generate`、`baoyu-image-gen`）都是 **示例**；其他 runtime 中的 agents 应应用上方规则，并替换成本地等价工具。这些 backend 的 skill-specific parameters 也是说明性示例；没有对应参数的 runtime 可以省略。

## Backend Skills Are Exempt

本身就是 image-generation backend 的 skills（目前是 `baoyu-image-gen`、已弃用的 `baoyu-image-gen`，以及 `baoyu-danger-gemini-web`）不需要包含 `## Image Generation Tools` section。它们直接通过自身 provider integrations 渲染，不需要“选择 backend”。本规则只适用于把渲染委托给 runtime 可用 backend 的 consumer skills。
