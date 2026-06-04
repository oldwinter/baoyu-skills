# Profiles - user portrait files

此 reference 定义 per-user profile system。Profiles 让 digest 能跨多天延续观察，因此每期新 digest 的群友画像 section 可以呈现连续性（`蛙总今天罕见地没提空头`），而不是每次从零开始。

每个群的 digests 旁边有两个并行 profile directories：

- `profiles/` - observations 来源于 digest 的 **normal** 版本。
- `profiles-roast/` - observations 来源于 **roast** 版本。

两者严格分离。Normal-version generation 只读取 `profiles/`；roast-version generation 只读取 `profiles-roast/`。这可以防止 roast snark 污染严肃摘要，反之亦然。

在 Step 3.7（为活跃用户加载 profiles）、Step 8.5（digest 写入后更新 profiles）和 Step 9（backfill）期间加载此文件。

---

## 1. 文件格式

### 1.1 Path 和命名

- Normal: `wechat/{group_id}-{group_name}/profiles/{wxid}-{nickname}.md`
- Roast: `wechat/{group_id}-{group_name}/profiles-roast/{wxid}-{nickname}.md`

**稳定** identifier 是 `wxid` prefix。`-{nickname}` suffix 只是为了方便人类浏览 - 如果它变化，重命名文件。

Filename sanitization：将 `/`、`\`、`:`、`*`、`?`、`"`、`<`、`>`、`|`、NUL 和控制字符替换为 `_`。裁掉末尾 dots 和 whitespace。总文件名长度上限为 200 chars（少数 nicknames 可能很长）。

### 1.2 Frontmatter

每个 profile file 顶部的 YAML frontmatter：

```yaml
---
name: "<current display name>"
wxid: "<wxid>"
group_nicknames: ["<历史群昵称 1>", "<历史群昵称 2>"]
aliases: ["<群友给的称呼 1>", "<群友给的称呼 2>"]
tags: ["<标签 1>", "<标签 2>"]
first_seen: "YYYY-MM-DD"
last_seen: "YYYY-MM-DD"
total_messages: N
digest_appearances: N
avg_messages_per_digest: N.N
---
```

字段规则：

- `name`：来自 `from_nickname` 的最新 display name（所属用户则使用 `self_display`）。
- `wxid`：稳定；写入后永不改变。
- `group_nicknames`：用户自己在群中历史 display names 的 append-only history。当 `name` 改变时，将旧 `name` 推入这里。Dedupe，保持时间顺序（oldest → newest）。不要包含当前 `name`。
- `aliases`：**其他成员**称呼此用户的 nicknames（例如 `蛙总`、`老王`、`X 哥`）。在本批次观察到时 dedupe-append。不要包含当前 `name`，也不要重复 `group_nicknames` entries - 后者记录用户自己的历史 handles，不是群里如何称呼他们。
- `tags`：该用户的 free-form labels，**独立于**正文的 角色标签 / 人设标签 section。用于不适合 role/personality 框架的 cross-cutting attributes（地区、职业、社群、反复出现的长期兴趣等）。Agent 观察到稳定模式时可以 append 或 refine。无硬上限。
- `first_seen` / `last_seen`：首次/最近一次出现在 digest 中的日期，YYYY-MM-DD。
- `total_messages`：此 profile 已更新过的所有 digests 中累计消息数。
- `digest_appearances`：该用户有 3+ messages 的 digest files 数量。
- `avg_messages_per_digest`：`total_messages / digest_appearances`，一位小数。

**Backwards compatibility**：此 skill 早期版本用 `aliases` 表示现在的 `group_nicknames`。读取缺少 `group_nicknames` 或 `tags` 的既有 profile 时，将缺失字段视为 `[]`，并在下次写入时添加。**不要自动迁移**非空 legacy `aliases` values - agent 无法可靠区分历史 display names 和群友给的 nicknames。将这些值保留在 `aliases` 中；用户需要时可以手动把历史 display names 移入 `group_nicknames`。

### 1.3 Free-form body - normal profile

Section headers 是单独一行的纯文本。顺序固定。

```
角色标签

• {4-6 短语标签}

关注领域

• {领域 1}
• {领域 2}

发言风格

{1-3 句描述，可以多段}

互动模式

• {与某某的互动模式}
• {另一种互动模式}

经典金句

• [YYYY-MM-DD] 「{直接引用}」
• [YYYY-MM-DD] 「{直接引用}」

标志性事件

• [YYYY-MM-DD] {事件描述}
• [YYYY-MM-DD] {事件描述}
```

### 1.4 Free-form body - roast profile

同样使用 plain-text section header style，但 sections 不同。

```
人设标签

• {4-6 放大版标签}

核心槽点

• {可吐槽点 1}
• {可吐槽点 2}

毒舌语录库

• [YYYY-MM-DD] 「{该用户说过的话} — {简短毒舌点评}」
• [YYYY-MM-DD] 「{...}」

经典翻车现场

• [YYYY-MM-DD] {翻车描述 + 引用 / 证据}
• [YYYY-MM-DD] {...}
```

---

## 2. 更新规则

不同 section 使用不同规则。Append-only sections 绝不能丢失历史；mergeable sections 可随理解加深而重写。

### 2.1 Normal profile

| Section | Update mode | 说明 |
|---------|-------------|-------|
| 角色标签 | **Merge** | 上限 4-6 个 tags。可以用更强的标签替换代表性较弱的标签。始终保留支持最稳定的标签。 |
| 关注领域 | **Merge dedupe** | 添加新 domains；按语义 dedupe，而不是精确字符串。 |
| 发言风格 | **Refine** | 只有出现清晰新模式时才更新。避免每期 digest 都重写。 |
| 互动模式 | **Merge** | 添加新 modes；可用更多细节 refine 既有模式。 |
| 经典金句 | **Append-only** | 永不删除。无上限。每条 entry 必须有日期，并逐字引用。 |
| 标志性事件 | **Append-only** | 永不删除。无上限。每条 entry 带日期。 |

### 2.2 Roast profile

| Section | Update mode | 说明 |
|---------|-------------|-------|
| 人设标签 | **Merge** | 上限 4-6。随着模式重复，可让 tags 更锋利。 |
| 核心槽点 | **Append-only** | 永不删除；反复出现的槽点在这里积累。 |
| 毒舌语录库 | **Append-only** | 永不删除。无上限。每条 entry 带日期，并包含 quote 和 roast comment。 |
| 经典翻车现场 | **Append-only** | 永不删除。无上限。每条 entry 带日期。 |

### 2.3 Frontmatter on every update

- 如果当前 display name 与记录的 `name` 不同：
  - Push the old `name` onto `group_nicknames` if not already there (dedupe, preserve chronological order).
  - Update `name` to the current display name.
  - 将文件从 `{wxid}-{old_nickname}.md` 重命名为 `{wxid}-{new_nickname}.md`。
- 扫描本批次中**其他成员**用来称呼此用户的 nicknames，并 dedupe-append 到 `aliases`。信号：
  - `@mention` resolving to this `wxid`.
  - 用不同于 `name` 的称呼直接问候/指向此用户（例如 `蛙总你怎么看`、`老王说得对`）。
  - Digest body 中以不同于当前 `name` 的名称引用此用户。
  - 只有 attribution 明确时才添加；跳过不确定匹配。
- 如果本批次揭示了不适合 角色标签 / 人设标签 role/personality 框架的稳定 cross-cutting attribute（地区、职业、社群、持久兴趣等），append 或 refine `tags`。`tags` 独立于正文 tag sections - 不要镜像它们。
- 将 `last_seen` 更新为当前 digest 的结束日期。
- 将本批次该用户的 message count 加到 `total_messages`。
- 将 `digest_appearances` 加 1。
- 重新计算 `avg_messages_per_digest`。

---

## 3. Step 8.5 - 更新流程

在 digest file(s) 写入后运行。遍历本批次中每个有 3+ messages 的用户。

1. **查找 profile。**
   - 扫描 `profiles/`（roast pass 则扫描 `profiles-roast/`），查找文件名以 `{wxid}-` 开头的文件。
   - 如果找到：打开它。
   - 如果未找到：用 frontmatter template 创建新文件。`group_nicknames = []`、`aliases = []`、`tags = []`、`first_seen = last_seen = current digest end date`、`total_messages = this batch's count`、`digest_appearances = 1`。然后运行 §2.3，用本批次观察到的 aliases/tags 初始化。

2. **为新用户解析 wxid。** 新用户出现时，你已经从 wx-cli message data 知道他们的 `wxid` - 直接使用它。如果某些原因只知道 nickname，运行 `wx contacts --query "{nickname}" --json` 解析；如果有多个匹配，优先选择当前在群中的那个（需要时用 `wx members <group>` cross-check）。

3. **更新 frontmatter。** 按 §2.3。

4. **更新 body sections。**
   - 对 mergeable sections（角色标签，关注领域，发言风格，互动模式 / roast: 人设标签）：读取现有内容，整合本批次新 observations，重写该 section。
   - 对 append-only sections（经典金句，标志性事件 / roast: 毒舌语录库，经典翻车现场，核心槽点）：追加新 entries，每条带日期并逐字保留。绝不编辑或删除历史 entries。

5. **写回。** 覆盖文件。

6. **Source separation。** normal digest 的 pass 只写入 `profiles/`。roast digest 的 pass 只写入 `profiles-roast/`。即使两个版本在同一次 skill invocation 中生成，也要运行两次独立 update passes。

---

## 4. Step 9 - Backfill 流程

当用户说 `回溯画像`、`初始化画像`、`backfill profiles` 或类似内容时触发。它会从已写好的 digest files 构建初始 profiles，不从 wx-cli 重新 fetch。

1. **列出 inputs。**
   - 列出 `wechat/{group_id}-{group_name}/` 下每个 `*.md` digest file（顶层，不包括 `profiles/` 或 `profiles-roast/` 内部）。
   - 按文件名 suffix 分组：`*-roast.md` → roast pass，其他全部 → normal pass。
   - 打开单个文件前，也可先读取 `history-digests.jsonl` 以快速查找 metadata（date、message count）。

2. **决定是否运行 roast backfill。** 只有存在至少一个 `*-roast.md` 文件时才运行 roast pass。

3. **按 10-15 个 digest files 一批处理。** 一次读取全部会撑爆 context。对每批：
   - 读取 digests。
   - 对在该批 leaderboard 或群友画像中出现的每个用户，累计：
     - 每个 digest 的 message counts（来自 stats block）。
     - Role tags 和 observations（来自群友画像 section）。
     - Quotes（来自正文内联 「」）。
     - 带日期 events（来自 category bodies - 当 digest 提到具体 incidents 时）。
   - 如果尚未缓存，通过 `wx contacts --query "{nickname}" --json` 为每个累计用户解析 wxid。缓存 wxid↔nickname mapping 供后续 backfill 使用。

4. **Threshold。** 只为 corpus 中出现在 **3 个或更多** digests 的用户生成 profile file。少于此数量则跳过（可能只是一次性访客）。

5. **写入 profile files。**
   - Normal pass 写入 `profiles/{wxid}-{nickname}.md`。
   - Roast pass 写入 `profiles-roast/{wxid}-{nickname}.md`。
   - 使用最近的 nickname 作为 filename suffix。将较旧 display names 推入 `group_nicknames`（字段级规则见 step 6）。
   - 按日期时间顺序排序 经典金句、标志性事件、毒舌语录库、经典翻车现场 entries。
   - Backfill 期间 append-only sections 不设大小上限 - 让历史自然流入。

6. **计算 frontmatter。**
   - `first_seen` = 用户出现过的最早 digest date。
   - `last_seen` = 用户出现过的最新 digest date。
   - `total_messages` = per-digest counts 总和。
   - `digest_appearances` = 该用户达到 3-message threshold 的 digests 数量。
   - `group_nicknames` = best-effort。如果同一 `wxid` 在历史 digests 中以多个不同 display names 出现（例如 leaderboard 行 "X — N 条" 中 X 变化），按时间顺序填入旧名称（最新名称留在 `name`）。如果时间顺序不清楚，dedupe 并让后续 runs 修正。
   - `aliases` = best-effort。扫描历史 digest bodies，查找其他成员用不同于当前 `name` 的名称称呼此用户的形式（@mentions、direct salutations）。跳过不确定匹配；如果没有可靠发现，保留 `[]`。
   - `tags` = `[]`。Backfill 不初始化 `tags`；让 normal runs 自然积累。

7. **报告。** 两个 passes 都完成后，打印简短摘要：
   - `Backfilled {N} normal profiles from {M} digests.`
   - `Backfilled {K} roast profiles from {L} roast digests.`（仅当 roast pass 运行时）
   - 列出因 wxid resolution failures 而跳过的用户，方便用户手动修复。

8. **重复运行 backfill 是安全的。** 如果用户运行 backfill 两次，将现有 profile files 视为 prior state 并 merge - 使用与 Step 8.5 updates 相同的规则。不要清空现有 append-only entries。

---

## 5. Privacy guardrails

这些规则同时适用于 normal 和 roast profiles；roast 额外增加一层限制。

### 5.1 禁止内容（normal 和 roast 都不要写）

- **真实世界 full names**：当群里只用了 nickname 时不要写。如果本人自我介绍 `我叫王二`，`王二` 可以写；从其他渠道推断出的 `王晓明` 不可以。
- **电话号码、邮箱、身份证号、家庭地址、雇主地址、精确出生日期** - 即使群里提到过，也不要提升到 profile files。
- **健康、医疗、心理信息。** 即使是自我披露（`我最近有点抑郁`）也不要固化进永久 profile。
- **私人恋爱 / 家庭细节**，除非本人在群里公开讨论。其他成员顺口提及不算。
- **令人尴尬的私人失败。** 公开的（当众发表后来翻车的观点）可以写；私人的（简单提到求职被拒）不可以。
- **从 timestamps 推断睡眠 / 时区。** Server time ≠ recipient's local time，而且这暗含 surveillance。

### 5.2 Allowed

- **公开群内行为** - 他们说了什么、如何争论、分享了什么。
- **群里发言的 direct quotes**（这些已对群成员公开）。
- **兴趣领域、爱好、工具偏好**，以前提是它们在群聊中表达过。
- **与其他群成员的互动模式**。
- **公开提到的消费**（`蛙总今天又分享了买了什么书`）- 如果是他们自己提到的，就可以。
- **他们在群里公开分享的旅行 / 生活 anecdotes**。

### 5.3 Roast-only extras

除 §5.1 外，roast profile 还**不得**包含：

- **任何关于外貌、体重、身体、长相的内容。**
- **任何关于家庭成员的内容**（孩子、父母、伴侣）- 只写本人。
- **心理健康猜测**，即使是玩笑也不行。不要写 `这位需要看医生`，不要写 `典型 ADHD`。
- **基于身份的 roast。** 不嘲笑性取向、宗教、族裔、国籍、性别。

Roast 可以嘲讽：

- 愚蠢观点、前后矛盾、事实错误。
- 重复行为（`第 47 次预测见顶`）。
- 自我拆台时刻（`昨天说 X，今天说 not X`）。
- 没接住的 performative flexes。

经验法则：**roast the take, not the person.**

---

## 6. Digest generation 期间读取 profiles（Step 3.7）

为新 digest 加载 profile context 时：

1. 遍历本批次活跃用户（3+ messages）。
2. Normal pass 中，为每个用户读取 `profiles/{wxid}-*.md`。缺失则跳过。
3. 如果当前 run 也生成 roast 版本，在 roast generation pass 中**单独**读取 `profiles-roast/{wxid}-*.md`。
4. 编译一个精简 working-memory block：
   - 用户当前 `name`、`group_nicknames` 和 `aliases`（以便识别 prior display names 或 community-given nicknames）。
   - `tags`（cross-cutting attributes - 地区、职业、社群 - 可用于群友画像中的 callouts）。
   - 角色标签 / 人设标签（用于延续或形成反差）。
   - 最近 3-5 条 经典金句 / 毒舌语录 entries（用于发现 callbacks 和重复）。
   - 最近 3-5 条 标志性事件 / 翻车现场 entries（用于发现 recurring themes）。
5. 不要把整个 profile 倒进 digest - profile 是 *context*，digest 是 *today*。

如果 profile 与今天批次中看到的内容矛盾（例如 profile 说 `从不主动发起话题`，但今天他们开启了三个 threads），在当天群友画像中明确指出 - 这种反差会让 digest 更有意思。
