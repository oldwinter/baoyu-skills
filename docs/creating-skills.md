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

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun
4. Replace all `{baseDir}` and `${BUN_X}` in this document with actual values

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
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

Check EXTEND.md existence (priority order):

\`\`\`bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/<skill-name>/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

| Path | Location |
|------|----------|
| `.baoyu-skills/<skill-name>/EXTEND.md` | Project directory |
| `$XDG_CONFIG_HOME/baoyu-skills/<skill-name>/EXTEND.md` | XDG config (~/.config) |
| `$HOME/.baoyu-skills/<skill-name>/EXTEND.md` | User home (legacy) |

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary |
| Not found | Ask user via the runtime's user-input tool (see [user-input-tools.md](user-input-tools.md)) |
```

SKILL.md 结尾应包含：

```markdown
## Extension Support
Custom configurations via EXTEND.md. See **Step 1.1** for paths and supported options.
```

## User Input Tools Section（Required）

每个会向用户询问选项的 SKILL.md，必须在靠前位置包含恰好一个 `## User Input Tools` section（intro 之后、main workflow 之前）。该规则必须 **内联**，不要链接到 `docs/user-input-tools.md`（skills 是自包含的；见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)）。作者侧 canonical reference 位于 [user-input-tools.md](user-input-tools.md)；把其正文复制到每个新的 SKILL.md。

标准 snippet（原样复制）：

```markdown
## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.
```

## Image Generation Tools Section（image-gen skills 必需）

每个渲染图片的 SKILL.md（无论是直接调用 image-generation API，还是委托给其他 skill），必须在靠前位置包含恰好一个 `## Image Generation Tools` section（位于 `## User Input Tools` 之后、main workflow 之前）。该规则必须 **内联**，不要链接到 `docs/image-generation-tools.md`（skills 是自包含的；见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)）。作者侧 canonical reference 位于 [image-generation-tools.md](image-generation-tools.md)；把其正文复制到每个新的 SKILL.md。

标准 snippet（原样复制）：

```markdown
## Image Generation Tools

When this skill needs to render an image:

- **Use whatever image-generation tool or skill is available** in the current runtime — e.g., Codex `imagegen`, Cursor `GenerateImage`, Hermes `image_generate`, `baoyu-image-gen`, or any equivalent the user has installed.
- **If multiple are available**, ask the user **once** at the start which to use (batch with any other initial questions).
- **If none are available**, tell the user and ask how to proceed.

**Prompt file requirement (hard)**: write each image's full, final prompt to a standalone file under `prompts/` (naming: `NN-{type}-[slug].md`) BEFORE invoking any backend. The backend receives the prompt file (or its content); the file is the reproducibility record and lets you switch backends without regenerating prompts.

Concrete tool names (`imagegen`, `GenerateImage`, `image_generate`, `baoyu-image-gen`) above are examples — substitute the local equivalents under the same rule.
```
