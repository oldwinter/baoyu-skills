# baoyu-skills 中文本地化档案

同步上游后，先读本档案，再处理新增或变更的中文内容。

## 项目定位

- 上游项目：`https://github.com/JimLiu/baoyu-skills`
- 中文 fork：`https://github.com/oldwinter/baoyu-skills`
- 主要安装面：skills CLI 与 Claude plugin marketplace
- 目标用户：使用 Claude Code、Codex 或其他 Agent Skills 兼容工具的中文用户
- 用户安装后实际读取的入口文件：`skills/baoyu-*/SKILL.md`、相邻 `references/`、`scripts/` 和 `assets/`
- 不应宣传为中文版安装的入口：指向 `JimLiu/baoyu-skills` 的安装命令
- 当前同步上游 commit：`6b7a2e4`

## 本地化目标

上游内容以中文为主。本 fork 的重点是提供明确、可复制的中文分叉安装入口，并确保 plugin picker、skill runtime 和用户文档保持中文可用。

## 语气

- 保留上游自然、实用的中文表达，不做无意义的同义改写。
- agent、skill、plugin、workflow、prompt、runtime、frontmatter 等技术词可保留英文。
- 操作步骤先给命令，再解释适用范围。
- 涉及凭据、发布和外部平台操作时，保留原有风险说明。

## 术语表

| 英文 | 中文 | 备注 |
|---|---|---|
| skill | skill | Agent Skills 语境下保留英文小写 |
| agent | Agent | 产品语境按原文大小写 |
| plugin | plugin | 命令和 manifest 语境保留英文 |
| workflow | 工作流 | 命令名或文件名中保留英文 |
| runtime | runtime | 指安装后实际加载内容 |
| upstream | 上游 | 指 `JimLiu/baoyu-skills` |
| fork | fork | GitHub fork 语境保留英文 |

## 不翻译清单

- 命令、参数、环境变量、URL、文件路径、包名、plugin 名和 skill slug。
- YAML/JSON key、frontmatter 字段名、API 字段和 schema 值。
- 测试 fixture、snapshot、golden string、正则和脚本依赖的精确文本。
- Prompt 模板中的占位符、工具名和外部平台专名。

## README 中文安装区块

README 顶部必须标明社区维护中文 fork 和当前同步 commit。skills CLI、marketplace 与 Agent 安装示例必须使用 `oldwinter/baoyu-skills`；指向上游的链接只能作为来源或英文原文链接。

## 同步后检查

- `git diff --check`
- 精确冲突标记扫描：`rg -n '^(<<<<<<< .+|=======|>>>>>>> .+)$' .`
- README 的中文版安装命令全部指向 `oldwinter/baoyu-skills`。
- `.claude-plugin/marketplace.json` 的 skill 路径均存在，picker 文案为中文。
- 新增 `skills/baoyu-*/SKILL.md` 可被安装器发现，并保留引用文件完整性。
- 运行 `docs/testing.md` 中与变更 surface 对应的检查。

## 项目特殊规则

- 上游本身中文优先；同步时不重复翻译已经自然可用的中文。
- `docs/creating-skills.md` 与 `docs/publishing.md` 中用于上游发布身份的 homepage 可以保留 `JimLiu`，不能把作者来源改成 fork。
- 微信、X、Weibo、ClawHub 等外部发布动作必须保留确认、凭据和 dry-run 边界。
