# Output formats - normal & roast digest

此 reference 定义此 skill 生成的两种 digest 变体：**normal** 版本（默认，清醒摘要）和 **roast** 版本（毒舌，sarcastic critique，opt-in）。在 Round 1（skeleton）期间加载此文件，并一直打开到 Round 3（audit）。

两个版本共享相同整体 layout 和写作规则；差异在 tone、leaderboard annotations、portraits 和 footer。当两个版本都被请求时，先写 normal 版本，它是 incremental mode 的 anchor，也是 profile updates 的 source of truth。

---

## 1. Normal version

### 1.1 Section 顺序（固定）

```
[标题行]
[① 开头概览 - 1-2 段 prose]
[② 分类正文 - 每天 3-6 个自命名 sections]
[③ 可选 pain-point section]
[④ 可选 @bot 答疑 section]
[⑤ 📊 Stats block + Top 10 leaderboard]
[⑥ 群友画像 - 每个 active user（3+ msgs）一个 entry]
[固定 footer]
```

摘要在前、话题居中、排行榜和画像收尾 — 读者先看到内容，数据和人物放在后面翻阅。

### 1.2 Title line

- 单行，不使用 markdown heading。
- 形式：`{群名} 群聊精华 · {日期或日期区间}`
- 单日日期：`2026-03-12`。Date range：`2026-03-12 ~ 2026-03-15`。

示例：

```
相亲相爱一家人 群聊精华 · 2026-03-12
```

### 1.3 Opening summary（群聊摘要）

- Comes immediately after the title line.
- 紧跟标题行。
- 1-2 段，plain prose，无 headings，无 bullets。
- Hook the reader：以当天最有辨识度的 thread 开头（激烈辩论、意外 announcement、有人反应强烈的 market move）。
- 在 prose 中提到当天 2-4 个 category titles，让读者知道后文内容。
- 只有当某人贡献很核心时才提到 1-2 个具体人物；否则保持 topic-focused。
- 不写 timestamps，不写 message counts（这些属于 stats block）。

### 1.4 Categorized body（群话题）

- 每天 3-6 个 self-named categories。
- 每个 category 是 thematic bucket，按*话题*命名，不要使用泛称（禁止 "讨论"、"闲聊" 这类 label）。
- Category header：`{emoji} {标题}`，一个 emoji 前缀，后接简短 noun phrase。
  - Suggested emoji: 🛠 工具/技术，📦 产品发布，📰 新闻/市场，💬 观点辩论，😄 笑料/段子，📚 学习分享，💸 钱与消费，🍜 生活日常。
- 每个 category 内的 body：嵌入 quotes 的 prose。列出 3+ 个平行项目时使用 `•` bullets；否则使用段落。
- Attribution：thread 首次提及时写出 speaker（`蛙总说他...`）。同一 thread 的后续句子，如果链条短且清晰，attribution 可隐含。
- Quotes：direct quotes 使用 「」。措辞生动、意外或有个人特征时引用；否则 paraphrase。
- Merge：多人讨论是一个 entry，不是一串单行回复列表。
- Links：完整 URL inline 保留。Article titles 逐字保留。

示例：

```
🛠 Claude Code 4.7 实测

蛙总下午把 4.7 装上后第一反应是「比 4.6 慢一倍」，老王跟着复现，怀疑是 Opus 默认配置导致。阿喵贴了官方文档 https://docs.claude.com/.../opus-4-7 ，提到可以切回 Sonnet 4.6 跑速测，三人最终结论：复杂任务 4.7 强，日常用 4.6 更顺手。
```

### 1.5 Pain-point section（可选）

- 只有当天聊天包含至少一个具体的 unresolved 或 partially-resolved problem 时才包含。
- Heading：`今日待解决问题` 或 `本周悬而未决`。
- 每个 problem 一个 entry。格式：
  ```
  问题：<一句话描述>
  提出者：<昵称>
  背景：<1-2 句来龙去脉>
  状态：<✅ 已解决 / ⚠️ 部分解决 / ❌ 仍未解决>
  方案：<若有人提了方案，写在这；否则写"暂无方案">
  ```
- 如果没有真正 pain points，整段跳过，不要用琐碎问题填充。

### 1.6 @bot 答疑 section (optional)

- 仅当 SKILL.md Step 3.9 本批捕获到至少一条真实 @bot 请求时出现；否则整段省略。
- Heading：`🤖 @bot 答疑`
- 一条请求一个条目（• 请求行 + 缩进的 🤖 答复行）。多人问同一件事合并成一答。
- **请求行措辞自由发挥**：点出提问者真名 + 自然转述其请求即可，别套「X 问：」这类固定句式。
- 语气：真诚、热心、有用的助手——与普通版整体一致。答复落地、给具体建议，别空泛。
- 来源：仅群聊上下文 + 自有知识，不联网。需实时/外部数据又无法核实的，如实说明（`这个我查不到实时数据，需要联网确认`），不编造。
- Format（遵守 §3：不用 markdown、列表用 •、标题一个 emoji）：
  ```
  🤖 @bot 答疑

  • {提问者 + 自然转述的请求}
    🤖 {真诚、简洁、有用的回答；查不到实时信息就如实说明}
  ```

### 1.7 Statistics block（消息统计 + 排行榜）

- 以 `📊 消息统计: 共 N 条消息` 开头。
- 后接 leaderboard，按 message count 排名前 10 的发送者，每人一行。
- 每行形式：`{排名}. {昵称}: {消息数} 条`
- 计数规则：
  - 包含 images、emojis、links、voice transcripts，任何占据聊天行的内容都算一条 message。
  - 排除 system messages 和 revoked messages（`[系统]`、`revokemsg`）。
  - 对 `self_wxid` 用户，在计数/显示前替换为 EXTEND.md 中的 `self_display`。
  - 统计前按 SKILL.md Step 3.6 解析 ambiguous nicknames，避免同一人被重复计数。
  - **Counts 必须从 `$TMPDIR` messages file 机械计算**（例如 `jq 'group_by(.from_wxid) | map({name: .[0].from_nickname, n: length}) | sort_by(-.n)'`），绝不能目测估算。总数和每个人的数量都要机械计算。
- **Incremental runs 必须显示精确覆盖窗口**：按日期粒度的 date range 会与上一期摘要共享边界日，读者容易误解为重叠。在 message count 后立刻加一行：`⏱ 覆盖区间: MM-DD HH:MM ~ MM-DD HH:MM`（第一条与最后一条已包含 message timestamps）。

示例：

```
📊 消息统计: 共 387 条消息
1. 蛙总: 92 条
2. 老王: 58 条
3. 阿喵: 41 条
...
```

### 1.8 群友画像 section

- Heading line：`群友画像`
- 本批次每个有 3+ messages 的用户一个 entry。
- 顺序：按 message count 降序。
- Entry header：`{昵称}（{角色标签}）`，role tag 是你对这个人*今天*的一行判断。示例：`做空美股的乐子人`、`深夜技术指导`、`论坛级吐槽担当`。
- Body：2-5 条 bullets，使用 `•` 前缀。每条 bullet 陈述一个 observation。自然处内联引用证据。
- Continuity：如果 Step 3.7 加载了 prior profile，延续仍适用的既有 tags/observations，并明确指出*变化*（`今天罕见地没提空头`、`从昨天的乐观转向今天的焦虑`）。
- 不要编造 backstory，只使用 messages 或 prior profile 中的内容。

示例：

```
群友画像

蛙总（做空美股的乐子人）
• 全天反复提"做空 SPY"，被群友提醒已连续三周看错方向
• 难得正面回应技术问题："我那个脚本是用 Bun 跑的，慢得跟蜗牛似的"
• 临近收盘转为沉默，与昨日大放厥词的状态对比明显
```

### 1.9 Footer

固定行，必须是文件最后一行：

```
本简报由 AI 自动生成
```

不加日期、签名或版本号。

---

## 2. Roast version (毒舌版)

Roast 版基于普通版的话题骨架和素材，用毒舌、尖锐、挑衅的风格重写。整体结构与普通版相同，Section 顺序也一致（标题行、开头概览、正文分类、@bot 答疑（毒舌值班版，如有）、统计区块 + 排行榜、群友画像、结尾），但风格完全不同。痛点部分省略。仅当 `include_roast=true` 时生成。标题加 "毒舌版" 后缀。

风格要求：
- 你是一位以尖锐和挑衅风格著称的专业评论员
- 对每个群友的行为、言论进行犀利点评，不怕让人尴尬
- 发言排行旁给每个人加一句毒舌备注（括号内）
- 群友画像改为「不留情面版」，放大每个人的槽点和矛盾之处
- 开头概览用更戏谑的口吻，突出荒诞和讽刺
- 正文话题标题可以改得更损
- 引用原话时配上辛辣点评
- @bot 答疑改为「毒舌值班版」（本批有 @bot 请求时才出现，见 SKILL.md Step 3.9；位置与普通版相同——正文分类之后、统计区块之前；无则省略）：照样把干货答出来，但裹上调侃、嘴硬、吐槽提问者的口吻，与 roast 整体一致；来源同样只用群聊上下文 + 自有知识、不联网，查不到就嘴硬地承认查不到；同守下方红线。请求行措辞自由发挥，用调侃口吻点出提问者和请求即可，别套「又来了」这类固定句式。标题如 `🤖 bot 答疑（毒舌值班版）`，结构示意：

  ```
  🤖 bot 答疑（毒舌值班版）

  • {提问者 + 请求，调侃口吻}
    🤖 {带刺但仍有实质内容的回答}
  ```
- 结尾改为：本简报由一个没有感情的 AI 自动生成，如有冒犯，概不负责

注意：毒舌但不恶毒，调侃但不人身攻击。目标是让群友看了会笑，而不是生气。具体红线：
- 只嘲讽群里的公开行为，不碰外貌、体重、健康、家庭、私人关系
- 不用时间戳推断作息或时区（服务器时间不等于本地时间）
- 不做医学/心理诊断类玩笑（「这位需要看医生」「典型 ADHD」）
- 不揣测对方未主动公开的身份属性（性取向、宗教、政治立场）
- 嘲讽观点本身，不嘲讽发言的权利（「这个观点错得离谱」可以，「连这都不懂还敢发言」不行）
- 如果某人本期没有槽点（3+ 条但都很中性），给一句温和调侃即可，不要硬凑

**写作顺序：** 先放开写最狠的版本，写完再回头检查红线。不要边写边自我审查，那样只会写出温吞水。

---

## 3. 通用格式规则（两个版本）

- **No markdown。** 不使用 `**bold**`、`# headings`、`*italic*`、`[link](url)` syntax。Headings 是单独一行 plain text。
- **Bullets 使用 `•`。** Prose-style bullets 不用 `-`、不用 `*`、不用 `1.`。
- **Numbered lists**（`1.`、`2.`）只保留给 leaderboard。
- Body block 内的 **Subcategory hints** 是无 symbol prefix 的 plain text。
- **Links 逐字保留。** 完整 URL inline 粘贴。不要缩短，不要藏在文字后。
- **每个 category title 一个 emoji。** 不要堆叠 🛠💬 等。
- **Pain-point statuses** 逐字使用 ✅⚠️❌。
- **Quotes 使用 「」。** 嵌套引用使用 single quotes。
- **Names 逐字保留。** 不要把 `蛙总` 缩写成 `蛙`，不要翻译中文名，不要匿名化。

---

## 4. 通用内容规则（两个版本）

- **只过滤纯噪音。** 删除：单独 emoji reactions、没有后续的 "好的"/"收到"/"哈哈哈"、重复转发。
- **保留 gossip、anecdotes、signature moments。** 这些是 highlight reel，也是 digest 的核心意义。
- **Plain language。** 保留生动表达和个人化措辞，这正是 speaker 可辨认的原因。
- **保留真实名称。** 既为了 traceability，也让 digest 可作为 memory 使用。
- **Tool、product、URL names 完整。** 写 `Claude Code 4.7`，不要写 `CC`。写 `https://github.com/...`，不要写 `GitHub 上那个项目`。
- **Merge, don't list。** 30 条消息的辩论写成一段，不写成 30 个 bullet points。
- **Direct-quote deep observations。** 当有人说了很有意思的话，用 「」 逐字引用，而不是 paraphrase。
- **Shared articles → title + sharer。** `阿喵分享了《一个 Rust 工程师的反思》`，包含标题和分享者。
- **不基于 timestamp 推断睡眠/时区。**（这里重复一次，因为它适用于两个版本，不只 roast。任一版本都不要写 `凌晨 3 点还在线`。）
- **不编造事实。** 每个 claim 都必须由本批次实际 message（或已加载 profile）支持。如果你想“加点色彩”，停下。

---

## 5. Output skeleton - quick reference

写到一半忘记结构时，看这个 skeleton：

### Normal

```
{群名} 群聊精华 · {日期}

{开篇 1-2 段，无标题，直入主题}

🛠 {分类标题 1}

{该分类下的整理过的讨论 / 段落 / 引用}

📦 {分类标题 2}

{...}

今日待解决问题（可选，没有就不写）

问题: {一句话}
提出者: {昵称}
背景: {1-2 句}
状态: ⚠️ 部分解决
方案: {若有}

🤖 @bot 答疑（可选，没有就不写）

• {提问者 + 请求，自然转述}
  🤖 {真诚有用的回答}

📊 消息统计: 共 N 条消息
1. {昵称}: N 条
2. {昵称}: N 条
...
10. {昵称}: N 条

群友画像

{昵称}（{角色标签}）
• {观察 1}
• {观察 2}
• {观察 3}

{昵称}（{角色标签}）
• {观察 1}
• {观察 2}

本简报由 AI 自动生成
```

### Roast

```
{群名} 群聊精华 · {日期} · 毒舌版

{毒舌开篇 1-2 段}

🛠 {更大声的分类标题}

{保留真实引用的毒舌叙述}

🤖 bot 答疑（毒舌值班版，可选）

• {提问者 + 请求，调侃口吻}
  🤖 {带刺但仍有实质的回答}

📊 消息统计: 共 N 条消息
1. {昵称}: N 条 ({毒舌评语})
2. {昵称}: N 条 ({毒舌评语})
...

群友画像

{昵称}（{放大的角色标签}）
• {毒舌观察 1}
• {毒舌观察 2}

本简报由一个没有感情的 AI 自动生成,如有冒犯,概不负责
```

---

## 6. 保存前自检

写入 digest file 前，在脑中逐项检查：

1. Section 顺序是否正确？Opening summary → categorized body → (pain points) → (@bot) → stats block → portraits → footer？
2. Stats block 是否准确？Counts 是否匹配过滤后的 message set？
3. Top 10 names 是否已解析（替换 self_display，消歧 ambiguous nicknames）？
4. Opening 是否 hook 了至少一个真实 category title？
5. 每个 active user（3+ msgs）是否都有画像 entry？
6. 每个 category 是否都有按话题命名的 title（不是 "讨论"）？
7. 每个 quote 是否使用 「」，并可追溯到真实 message？
8. Links 是否 inline 且完整？
9. 是否没有泄漏 markdown bold/heading/link syntax？
10. （仅 Roast）每条 roast bullet 是否都能通过 §2 红线 audit？
11. Footer line 是否完全匹配，并且是最后一行（在群友画像之后）？
12. （本批有 @bot 请求时）两版各有对应 @bot 答疑小节？普通版真诚有用、毒舌版带刺仍有干货？无编造的实时信息？
