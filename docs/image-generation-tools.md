# Image Generation Tools

本仓库的 skills 会被多个 agent runtime 加载（Claude Code、Codex、Cursor、Hermes、其他 agents、裸 CLI）。不同 runtime 暴露不同的 image-generation capability：有些有 runtime-native tool（Codex `imagegen`、Cursor `GenerateImage`、Hermes `image_generate`），有些依赖已安装 skill（`baoyu-image-gen` 或用户自定义 skill）。本文件定义每个渲染图片的 skill 都应遵循的 canonical **backend-selection rule**，以保证 skills 可移植。

## The Rule

每个渲染图片的 `SKILL.md` 都原样内联本 section，并把 text-patching rule 中的三个 `{…}` 占位符替换为该 skill 自己的措辞（什么文字、什么产物、哪个低文字量 fallback），以及它使用的 prompt-file 命名（例如 slide-deck 中的 `NN-slide-[slug].md`）。本段文字变更时，请同步所有副本。

```markdown
## Image Generation Tools

按以下顺序解析 image backend：

1. **用户在当前消息中点名某个 backend** → 使用它。
2. **`EXTEND.md` 中的 `preferred_image_backend`** 指向当前可用的 backend → 使用它。`ask` 表示每次运行都询问。
3. **Auto-select**（preference 为 `auto`、未设置，或 pinned backend 不可用），先匹配者胜出：
   - 可用 skills 中有 **Codex `imagegen`** skill → 说明你在 Codex 中，必须使用它：`Skill`，参数为 `skill: "imagegen"`，并传入 prompt file 内容、output path 和 aspect ratio。它优先于 `baoyu-image-gen` 等非 native skills。
   - **Codex via `codex exec`（`codex-imagegen`）**：没有 native `imagegen`，但 `codex` CLI 在 `PATH` 中且已有有效 `codex login` → `baoyu-image-gen --provider codex-cli`（preferred），如果 baoyu-image-gen 不可用则使用 bundled wrapper。仅在该分支加载 [references/codex-imagegen.md](references/codex-imagegen.md)。
   - **Cursor `GenerateImage`** → 使用它（优先于非 native skills）。它没有 aspect-ratio 参数，因此要在 `description` prompt 中说明宽高比/尺寸；它会保存到 tool 管理的位置，因此要把文件复制到期望的输出路径（例如 `outputs/.../NN-xxx.png`）。Reference images 放在 `reference_image_paths`。
   - **其他 runtime-native image tool**（例如 Hermes `image_generate`）→ 以同样方式使用。
   - 只安装了一个 non-native backend（例如 `baoyu-image-gen`）→ 使用它。
   - 有多个 non-native backends → 询问用户一次，并与其他初始问题 batch。
4. **没有可用 backend** → 告诉用户并询问如何继续。

**⛔ 仅 raster**：绝不要用 SVG、HTML/CSS、canvas 或其他 code-based rendering 替代 raster image，即使内容看起来像 diagram。如果无法解析 raster backend，进入第 4 步。

**⛔ 不要 patch bitmap 文字**：绝不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他 overlay 去覆盖、重写、擦除、描边或替换已生成 {artifact，例如 illustration} 中的 {text kinds，例如 labels、captions 或任何其他文字}。用修正后的 prompt 重新生成、{low-text fallback，例如用更少或无图内文字重绘}，或询问用户保留哪个不完美候选。

**Prompt file（hard）**：调用任何 backend 之前，把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（`NN-{type}-[slug].md`），并把该文件（或其内容）传给 backend。它既是可复现记录，也允许在不重写 prompts 的情况下切换 backend。

通过下方 `## Changing Preferences` 修改 pinned backend。上方工具名只是示例；其他 runtime 使用本地等价工具。
```

## The Preference Field

每个 image-consuming skill 的 `EXTEND.md` 都包含单一 `preferred_image_backend` 字段：

| Value | Meaning |
|---|---|
| `auto`（default） | 应用 auto-select 规则：优先 runtime-native；如果只安装一个 backend 则 fallback；多个 non-native 时询问。 |
| `ask` | 每次运行都确认 backend，即使存在 runtime-native tool。 |
| `<backend-id>`（例如 `codex-imagegen`、`baoyu-image-gen`、`GenerateImage`、`image_generate`） | 当该 backend 可用时固定使用；不可用时 fallback 到 `auto`。 |

该字段遵循 **absent-equals-auto**：旧的 `EXTEND.md` 即使没有该字段，也完全等同于设置了 `preferred_image_backend: auto`。引入该字段无需 bump schema version。

## How Skills Declare This

每个渲染图片的 `SKILL.md` 都包含 **恰好一个** `## Image Generation Tools` section（靠前位置，位于 `## User Input Tools` 之后、main workflow 之前），并且 **内联** 该规则。Skills 是自包含的，不能链接到 `docs/`；每个 skill folder 都必须在自己的 `SKILL.md` 中携带该规则。见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)。

每个 skill 的 `references/config/preferences-schema.md`（以及 `first-time-setup.md` 中的 `EXTEND.md` template）都会把 `preferred_image_backend` 与其他 preference fields 一起列出。First-time setup 不会询问用户 backend：会静默设置为 `auto`。想 pinned 特定 backend 的用户可稍后编辑 `EXTEND.md`，每个 skill 的 `## Changing Preferences` section 也记录了常见的一行编辑。

本文档和 SKILL.md 中的具体工具名（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）都是 **示例**；其他 runtime 中的 agents 应应用上方规则，并替换成本地等价工具。这些 backend 的 skill-specific parameters 也是说明性示例；没有对应参数的 runtime 可以省略。

## Backend Skills Are Exempt

本身就是 image-generation backend 的 skills（目前是 `baoyu-image-gen`、已弃用的 `baoyu-image-gen`，以及 `baoyu-danger-gemini-web`）不需要包含 `## Image Generation Tools` section。它们直接通过自身 provider integrations 渲染，不需要“选择 backend”。本规则只适用于把渲染委托给 runtime 可用 backend 的 consumer skills。
