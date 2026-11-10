# Creating New Skills

**必读**：[Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## Key Requirements

| Requirement | Details |
|-------------|---------|
| **Prefix** | 所有 skills 必须使用 `baoyu-` 前缀 |
| **name field** | 最多 64 个字符，只允许小写字母/数字/连字符，不能包含 "anthropic"/"claude" |
| **description** | 最多 1024 个字符，使用第三人称，包含做什么 + 何时使用 |
| **SKILL.md body** | 保持在 500 行以内；更多内容放到 `references/` |
| **References** | 从 SKILL.md 起只深入一层；避免 nested references |

## SKILL.md Frontmatter Template

```yaml
---
name: baoyu-<name>
description: <Third-person description. What it does + when to use it.>
version: <semver matching marketplace.json>
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-<name>
    requires:          # include only if skill has scripts
      anyBins:
        - bun
        - npx
---
```

## Steps

1. 创建带 YAML front matter 的 `skills/baoyu-<name>/SKILL.md`
2. 如适用，在 `skills/baoyu-<name>/scripts/` 中添加 TypeScript
3. 如需要，在 `skills/baoyu-<name>/prompts/` 中添加 prompt templates
4. 在 `.claude-plugin/marketplace.json` 的 `baoyu-skills` plugin entry 下注册该 skill
5. 如果 skill 有 scripts，在 SKILL.md 中添加 Script Directory section
6. 在 frontmatter 中添加 openclaw metadata

## Skill Grouping

所有 skills 都注册在单一 `baoyu-skills` plugin 下。决定 skill 在文档中出现的位置时，使用以下逻辑分组：

| If your skill... | Use group |
|------------------|-----------|
| 生成视觉内容（图片、幻灯片、漫画） | Content Skills |
| 发布到平台（X、WeChat、Weibo） | Content Skills |
| 提供 AI generation backend | AI Generation Skills |
| 转换或处理内容 | Utility Skills |

如果新增逻辑分组，请更新展示 grouped skills 的文档，但仍保持该 skill 注册在单一 `baoyu-skills` plugin entry 下。

## Writing Descriptions

**必须使用第三人称**：

```yaml
# Good
description: Generates Xiaohongshu infographic series from content. Use when user asks for "小红书图片", "XHS images".

# Bad
description: I can help you create Xiaohongshu images
```

## Script Directory Template

每个带 scripts 的 SKILL.md 都必须包含：

```markdown
## Script Directory

Scripts 位于本 skill 的 `scripts/` 子目录。

**Agent 执行说明**：
1. 把当前 SKILL.md 所在目录确定为 `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. 解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun
4. 把本文档中的 `{baseDir}` 和 `${BUN_X}` 替换为实际值

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | 主入口 |
```

## Progressive Disclosure

内容较多的 skills：

```text
skills/baoyu-example/
├── SKILL.md              # Main instructions (<500 lines)
├── references/
│   ├── styles.md         # Loaded as needed
│   └── examples.md       # Loaded as needed
└── scripts/
    └── main.ts
```

从 SKILL.md 链接（只深入一层）：

```markdown
**Available styles**: See [references/styles.md](references/styles.md)
```

## Extension Support（EXTEND.md）

每个 SKILL.md 都必须包含 EXTEND.md 加载逻辑。对 workflow skills，添加为 Step 1.1；对 utility skills，放在 "Preferences" section：

```markdown
**1.1 Load Preferences (EXTEND.md)**

按优先级检查 EXTEND.md 是否存在：

\`\`\`bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/<skill-name>/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

| Path | Location |
|------|----------|
| `.baoyu-skills/<skill-name>/EXTEND.md` | 项目目录 |
| `$XDG_CONFIG_HOME/baoyu-skills/<skill-name>/EXTEND.md` | XDG config (~/.config) |
| `$HOME/.baoyu-skills/<skill-name>/EXTEND.md` | User home (legacy) |

| Result | Action |
|--------|--------|
| Found | 读取、解析并显示摘要 |
| Not found | 通过 runtime 的 user-input tool 询问用户（见 [user-input-tools.md](user-input-tools.md)） |
```

SKILL.md 结尾应包含：

```markdown
## Extension Support
通过 EXTEND.md 自定义配置。路径和支持选项见 **Step 1.1**。
```

## User Input Tools Section（Required）

每个会向用户询问选项的 SKILL.md，必须在靠前位置包含恰好一个 `## User Input Tools` section（intro 之后、main workflow 之前）。该规则必须 **内联**，不要链接到 `docs/user-input-tools.md`（skills 是自包含的；见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)）。作者侧 canonical reference 位于 [user-input-tools.md](user-input-tools.md)；把其正文复制到每个新的 SKILL.md。

标准 snippet（原样复制，然后为本 skill 填写 `{…}` 占位符）：

```markdown
## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。
```

## Image Generation Tools Section（image-gen skills 必需）

每个渲染图片的 SKILL.md（无论是直接调用 image-generation API，还是委托给其他 skill），必须在靠前位置包含恰好一个 `## Image Generation Tools` section（位于 `## User Input Tools` 之后、main workflow 之前）。该规则必须 **内联**，不要链接到 `docs/image-generation-tools.md`（skills 是自包含的；见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)）。作者侧 canonical reference 位于 [image-generation-tools.md](image-generation-tools.md)；把其正文复制到每个新的 SKILL.md。

标准 snippet（原样复制）：

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

**⛔ 不要 patch bitmap 文字**：绝不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR scripts 或任何其他 overlay 去覆盖、重写、擦除、描边或替换已生成 {artifact, e.g. illustration} 中的 {text kinds, e.g. labels, captions, or any other text}。用修正后的 prompt 重新生成、{low-text fallback, e.g. redraw with less or no on-image text}，或询问用户保留哪个不完美候选。

**Prompt file（hard）**：调用任何 backend 之前，把每张图片完整、最终的 prompt 写入 `prompts/` 下的独立文件（`NN-{type}-[slug].md`），并把该文件（或其内容）传给 backend。它既是可复现记录，也允许在不重写 prompts 的情况下切换 backend。

通过下方 `## Changing Preferences` 修改 pinned backend。上方工具名只是示例；其他 runtime 使用本地等价工具。
```
