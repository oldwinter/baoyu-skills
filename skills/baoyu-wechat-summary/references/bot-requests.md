# @bot 请求 —— 提取、误触过滤与回答来源

当一批消息中至少有一条命中 `bot_aliases` 触发词时，从 SKILL.md 的 Step 3.9 读取本文件。

**提取**到内部 worklist `== @bot 请求清单 ==`（仅 working memory —— 绝不写入最终 digest）：

- 提问者真实姓名 —— 完成 Step 3.6 解析后；对于 `self_wxid` 用户替换为 `self_display`。
- 请求正文 —— 去掉 `@<alias>` 前缀后的文本。如果该消息是 reply（按 Step 3.5 的 quote/reply fields 判断），包含 quoted message 作为 context。
- 用于 back-reference 的 anchor `local_id`。

**误触过滤**：如果真实成员昵称恰好等于某个 alias，按上下文判断。只保留真正面向 digest bot 的消息（问题或请求）；跳过明显的人对人对话 —— 例如给那个真人的 reply，或调侃他们的玩笑。（选择没有真实成员使用的 `bot_aliases` 值可从源头避免问题；此过滤是兜底。）纯问候/闲聊（`@bot 在吗`）可以保留并简短回复。

**Answer-source constraint**（按 [output-formats.md](output-formats.md) 渲染 section 时遵守）：只从群聊上下文和你自己的知识回答 —— **不要 web access**。对于任何需要实时或外部信息且你无法验证的请求，诚实说明（`这个我查不到实时数据，需要联网确认`），不要编造。
