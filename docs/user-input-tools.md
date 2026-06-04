# User Input Tools

本仓库的 skills 会被多个 agent runtime 加载（Claude Code、其他 agents、裸 CLI）。不同 runtime 暴露的用户提问 API 不同。本文件定义每个 skill 都应遵循的 canonical **tool-selection rule**，以保证 skills 可移植。

## Tool Selection（优先级顺序）

1. **优先使用内置 user-input tools**：如果当前 agent runtime 暴露了相关工具，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等价工具，就优先使用。
2. **Fallback 到纯文本**：如果没有这类工具，输出编号式纯文本消息，让用户按每个问题回复编号/答案。
3. **Batching rule**：
   - 如果工具支持 **一次调用多个问题**（例如 `AskUserQuestion`）：**把所有适用问题合并到一次调用中。不要拆成多次调用。**
   - 如果工具 **每次只支持一个问题**（例如 single-prompt `clarify`）：按优先级顺序一次问一个。

## Skills 如何声明该规则

每个使用交互式用户输入的 `SKILL.md` 都必须包含恰好一个 `## User Input Tools` section（通常放在靠前位置，intro 之后），并且 **内联** 该规则。不要从 SKILL.md 链接到这里：skills 必须自包含（见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)）。本文件是作者侧 canonical source；把正文复制到每个 SKILL.md 中。随后，该规则约束该 skill 及其 `references/` 文件中的每次 user-input 交互。

skill 中其他位置提到的具体工具（例如 `AskUserQuestion`）都只是 **具体示例**；其他 runtime 下的 agents 应用上方规则，并替换成本地等价工具。工具专属参数（例如 `header:`、`multiSelect:`）也是示例；没有这些参数的 runtime 可以省略。
