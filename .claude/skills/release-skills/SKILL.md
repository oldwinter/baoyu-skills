---
name: release-skills
description: 通用 release workflow。自动检测 version files 和 changelogs。支持 Node.js、Python、Rust、Claude Plugin、GitHub Releases、annotated tags、historical release backfill 和 generic projects。当用户说 "release"、"发布"、"new version"、"bump version"、"push"、"推送"、"release notes"、"GitHub Release" 或 "回填 Release" 时使用。
---

# Release Skills

支持任意项目类型和多语言 changelog 的通用 release workflow。

## 用户输入工具

当此 skill 需要提示用户时，按以下工具选择规则执行（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等价工具。
2. **Fallback**：如果不存在这类工具，输出带编号的纯文本消息，并请用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持单次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级逐个询问。

下面具体的 `AskUserQuestion` 引用只是示例 - 在其他 runtime 中替换为本地等价工具。

## 快速开始

直接运行 `/release-skills` - 它会自动检测项目配置。

## 支持的项目

| Project Type | Version File | 自动检测 |
|--------------|--------------|---------------|
| Node.js | package.json | ✓ |
| Python | pyproject.toml | ✓ |
| Rust | Cargo.toml | ✓ |
| Claude Plugin | marketplace.json | ✓ |
| Generic | VERSION / version.txt | ✓ |

## Options

| Flag | 说明 |
|------|-------------|
| `--dry-run` | 预览变更，不执行 |
| `--major` | 强制 major version bump |
| `--minor` | 强制 minor version bump |
| `--patch` | 强制 patch version bump |
| `--backfill-releases` | 根据 changelog sections 为已有 tags 创建缺失的 GitHub Releases |

## Workflow

### Step 1: 检测项目配置

1. 检查 `.releaserc.yml`（可选 config override）
   - 如果存在，检查它是否定义了 release hooks
2. 通过扫描自动检测 version file（优先级顺序）：
   - `package.json` (Node.js)
   - `pyproject.toml` (Python)
   - `Cargo.toml` (Rust)
   - `marketplace.json` or `.claude-plugin/marketplace.json` (Claude Plugin)
   - `VERSION` or `version.txt` (Generic)
3. 使用 glob patterns 扫描 changelog files：
   - `CHANGELOG*.md`
   - `HISTORY*.md`
   - `CHANGES*.md`
4. 通过文件名后缀识别每个 changelog 的语言
5. 检测 GitHub release 支持：
   - 检查 `origin` 是否指向 GitHub
   - 检查 `gh` 是否已安装并认证
   - 可用时用 `gh release list --limit 5` 检查现有 releases
6. 显示检测到的配置

**Project Hook Contract**:

如果 `.releaserc.yml` 定义了 `release.hooks`，保持 release workflow 通用，并把项目特定的 packaging/publishing 委托给这些 hooks。

支持的 hooks：

| Hook | 目的 | 预期职责 |
|------|---------|-------------------------|
| `prepare_artifact` | 让一个 target 可发布 | 验证 target 自包含，同步/嵌入本地依赖，可选 stage 额外文件 |
| `publish_artifact` | 发布一个可发布 target | 上传准备好的 target（或项目使用的 staged directory），附加 version/changelog/tags |

支持的 placeholders：

| Placeholder | 含义 |
|-------------|---------|
| `{project_root}` | repository root 的绝对路径 |
| `{target}` | 正在发布的 module/skill 的绝对路径 |
| `{artifact_dir}` | 当项目使用 staging 时，此 target 的临时 staging directory 绝对路径 |
| `{version}` | release workflow 选择的 version |
| `{dry_run}` | `true` or `false` |
| `{release_notes_file}` | 包含 release notes/changelog text 的 UTF-8 文件绝对路径 |

执行规则：
- 保持 skill 通用：不要把 registry/package-manager/project layout 细节硬编码到此 SKILL。
- 如果 `prepare_artifact` 存在，在需要最终可发布 target 状态的 publish 相关检查前，对每个 target 运行一次。
- 将 release notes 写入临时文件，并把该文件路径传给 `publish_artifact`；不要把多行 changelog text inline 到 shell commands。
- 如果 hooks 不存在，fallback 到默认的 project-agnostic release workflow。

**语言检测规则**：

Changelog files 遵循 `CHANGELOG_{LANG}.md` 或 `CHANGELOG.{lang}.md` 模式，其中 `{lang}` / `{LANG}` 是语言或地区代码。

| Pattern | Example | Language |
|---------|---------|----------|
| 无后缀 | `CHANGELOG.md` | en（默认） |
| `_{LANG}`（大写） | `CHANGELOG_CN.md`, `CHANGELOG_JP.md` | 对应语言 |
| `.{lang}`（小写） | `CHANGELOG.zh.md`, `CHANGELOG.ja.md` | 对应语言 |
| `.{lang-region}` | `CHANGELOG.zh-CN.md` | 对应地区变体 |

常见语言代码：`zh`（Chinese）、`ja`（Japanese）、`ko`（Korean）、`de`（German）、`fr`（French）、`es`（Spanish）。

**输出示例**：
```
Project detected:
  Version file: package.json (1.2.3)
  Changelogs:
    - CHANGELOG.md (en)
    - CHANGELOG.zh.md (zh)
    - CHANGELOG.ja.md (ja)
```

### Step 2: 分析 Last Tag 之后的变更

```bash
LAST_TAG=$(git tag --sort=-v:refname | head -1)
git log ${LAST_TAG}..HEAD --oneline
git diff ${LAST_TAG}..HEAD --stat
```

按 conventional commit types 分类：

| Type | 说明 |
|------|-------------|
| feat | 新功能 |
| fix | Bug fixes |
| docs | Documentation |
| refactor | Code refactoring |
| perf | 性能优化 |
| test | 测试变更 |
| style | Formatting、styling |
| chore | 维护（在 changelog 中跳过） |

**Breaking Change 检测**：
- Commit message 以 `BREAKING CHANGE` 开头
- Commit body/footer 包含 `BREAKING CHANGE:`
- 移除了 public APIs、重命名 exports 或改变 interfaces

如果检测到 breaking changes，提醒用户："Breaking changes detected. Consider major version bump (--major flag)."

### Step 3: 确定 Version Bump

规则（优先级顺序）：
1. 用户 flag `--major/--minor/--patch` → 使用指定类型
2. 检测到 BREAKING CHANGE → Major bump（1.x.x → 2.0.0）
3. 存在 `feat:` commits → Minor bump（1.2.x → 1.3.0）
4. 否则 → Patch bump（1.2.3 → 1.2.4）

显示 version change：`1.2.3 → 1.3.0`

### Step 4: 生成多语言 Changelogs

对每个检测到的 changelog file：

1. **识别语言**：根据文件名后缀
2. **检测第三方贡献者**：
   - 检查 merge commits：`git log ${LAST_TAG}..HEAD --merges --pretty=format:"%H %s"`
   - 对每个已 merge PR，通过 `gh pr view <number> --json author --jq '.author.login'` 识别 PR author
   - 与 repo owner 比较（`gh repo view --json owner --jq '.owner.login'`）
   - 如果 PR author ≠ repo owner → 第三方贡献者
3. **用该语言生成内容**：
   - Section titles 使用目标语言
   - Change descriptions 用目标语言自然撰写（不是机器直译）
   - 日期格式：YYYY-MM-DD（通用）
   - **第三方贡献**：在 changelog entry 末尾追加贡献者 attribution `(by @username)`
4. **插入文件头部**（保留现有内容）

**Section Title Translations**（内置）：

| Type | en | zh | ja | ko | de | fr | es |
|------|----|----|----|----|----|----|-----|
| feat | Features | 新功能 | 新機能 | 새로운 기능 | Funktionen | Fonctionnalités | Características |
| fix | Fixes | 修复 | 修正 | 수정 | Fehlerbehebungen | Corrections | Correcciones |
| docs | Documentation | 文档 | ドキュメント | 문서 | Dokumentation | Documentation | Documentación |
| refactor | Refactor | 重构 | リファクタリング | 리팩토링 | Refactoring | Refactorisation | Refactorización |
| perf | Performance | 性能优化 | パフォーマンス | 성능 | Leistung | Performance | Rendimiento |
| breaking | Breaking Changes | 破坏性变更 | 破壊的変更 | 주요 변경사항 | Breaking Changes | Changements majeurs | Cambios importantes |

**Changelog 格式**：

```markdown
## {VERSION} - {YYYY-MM-DD}

### Features
- Description of new feature
- Description of third-party contribution (by @username)

### Fixes
- Description of fix

### Documentation
- Description of docs changes
```

只包含有变更的 sections。省略空 sections。

**第三方 Attribution 规则**：
- 只为不是 repo owner 的 contributors 添加 `(by @username)`
- 使用带 `@` 前缀的 GitHub username
- 放在 changelog entry 行尾
- 所有语言保持一致（始终使用 `(by @username)` 格式，不翻译）

**多语言示例**：

English (CHANGELOG.md):
```markdown
## 1.3.0 - 2026-01-22

### Features
- Add user authentication module (by @contributor1)
- Support OAuth2 login

### Fixes
- Fix memory leak in connection pool
```

Chinese (CHANGELOG.zh.md):
```markdown
## 1.3.0 - 2026-01-22

### 新功能
- 新增用户认证模块 (by @contributor1)
- 支持 OAuth2 登录

### 修复
- 修复连接池内存泄漏问题
```

Japanese (CHANGELOG.ja.md):
```markdown
## 1.3.0 - 2026-01-22

### 新機能
- ユーザー認証モジュールを追加 (by @contributor1)
- OAuth2 ログインをサポート

### 修正
- コネクションプールのメモリリークを修正
```

### Step 5: 按 Skill/Module 分组变更

分析 last tag 之后的 commits，并按受影响 skill/module 分组：

1. **识别每个 commit 的 changed files**
2. **按 skill/module 分组**：
   - `skills/<skill-name>/*` → 归入该 skill
   - Root files（CLAUDE.md 等）→ 归为 "project"
   - 一个 commit 涉及多个 skills → 拆分到多个 groups
3. **对每个 group**，识别需要的相关 README updates

**分组示例**：
```
baoyu-cover-image:
  - feat: add new style options
  - fix: handle transparent backgrounds
  → README updates: options table

baoyu-comic:
  - refactor: improve panel layout algorithm
  → No README updates needed

project:
  - docs: update CLAUDE.md architecture section
```

### Step 6: 分别提交每个 Skill/Module

对每个 skill/module group（按变更顺序）：

1. **检查是否需要 README updates**：
   - 扫描 `README*.md` 中对此 skill/module 的提及
   - 验证 options/flags 文档是否正确
   - 如果语法改变，更新 usage examples
   - 如果行为改变，更新 feature descriptions

2. **Stage and commit**：
   ```bash
   git add skills/<skill-name>/*
   git add README.md README.zh.md  # If updated for this skill
   git commit -m "<type>(<skill-name>): <meaningful description>"
   ```

3. **Commit message 格式**：
   - 使用 conventional commit 格式：`<type>(<scope>): <description>`
   - `<type>`: feat, fix, refactor, docs, perf, etc.
   - `<scope>`: skill name or "project"
   - `<description>`：清晰、有意义的变更说明

**Commit 示例**：
```bash
git commit -m "feat(baoyu-cover-image): add watercolor and minimalist styles"
git commit -m "fix(baoyu-comic): improve panel layout for long dialogues"
git commit -m "docs(project): update architecture documentation"
```

**常见需要检查的 README Updates**：
| 变更类型 | 需要检查的 README section |
|-------------|------------------------|
| New options/flags | Options table、usage examples |
| Renamed options | Options table、usage examples |
| New features | Feature description、examples |
| Breaking changes | Migration notes、deprecation warnings |
| Restructured internals | Architecture section（如果暴露给用户） |

### Step 7: 生成 Changelog 并更新 Version

1. **生成多语言 changelogs**（如 Step 4 所述）
2. **更新 version file**：
   - 读取 version file（JSON/TOML/text）
   - 更新 version number
   - 写回（保留 formatting）
3. **创建 release notes file**：
   - 优先使用 `CHANGELOG.md` 中的新 version section
   - 如果没有 English/default changelog，使用第一个检测到的 changelog
   - 只提取精确的 `## {VERSION} - {YYYY-MM-DD}` section，直到下一个 `##`
   - 需要时同时匹配 plain version 和带 tag prefix 的 headings，例如 `1.2.3` 和 `v1.2.3`
   - 将 breaking changes 保持在靠前位置；需要时在其他 sections 前加短 highlight
   - 将 notes 写入 UTF-8 temp file，并复用于 annotated tag messages、GitHub Releases 和 `publish_artifact`
   - 在 normal mode 中，如果找不到 notes，应停止，而不是创建空 tag 或 GitHub Release

**按文件类型的 Version Paths**：

| File | Path |
|------|------|
| package.json | `$.version` |
| pyproject.toml | `project.version` |
| Cargo.toml | `package.version` |
| marketplace.json | `$.metadata.version` |
| VERSION / version.txt | Direct content |

### Step 8: 用户确认

创建 release commit 前，请用户确认：

**使用 AskUserQuestion 提出三个问题**：

1. **Version bump**（single select）：
   - 基于 Step 3 分析展示推荐 version
   - Options：recommended（带 label）、其他 semver options
   - Example: `1.2.3 → 1.3.0 (Recommended)`, `1.2.3 → 1.2.4`, `1.2.3 → 2.0.0`

2. **Push to remote**（single select）：
   - Options："Yes, push after commit", "No, keep local only"

3. **Publish GitHub Release**（single select）：
   - 仅当 GitHub release support 可用时提供
   - 当用户也选择 push 时，默认使用 "Yes, publish after tag push"
   - 如果用户选择保持 release local，不要创建或编辑 GitHub Release

**确认前输出示例**：
```
Commits created:
  1. feat(baoyu-cover-image): add watercolor and minimalist styles
  2. fix(baoyu-comic): improve panel layout for long dialogues
  3. docs(project): update architecture documentation

Changelog preview (en):
  ## 1.3.0 - 2026-01-22
  ### Features
  - Add watercolor and minimalist styles to cover-image
  ### Fixes
  - Improve panel layout for long dialogues in comic

Release notes source: CHANGELOG.md#1.3.0
Ready to create release commit, annotated tag, and GitHub Release.
```

### Step 9: 创建 Release Commit 和 Annotated Tag

用户确认后：

1. **Stage version 和 changelog files**：
   ```bash
   git add <version-file>
   git add CHANGELOG*.md
   ```

2. **创建 release commit**：
   ```bash
   git commit -m "chore: release v{VERSION}"
   ```

3. **创建 annotated tag**：
   ```bash
   git tag -a v{VERSION} -F <release-notes-file>
   ```
   如果 `.releaserc.yml` 设置了 `tag.sign: true`，使用 `git tag -s` 和同一个 notes file。

4. **如果用户确认则 push**（Step 8）：
   ```bash
   git push origin main
   git push origin v{VERSION}
   ```

**注意**：不要添加 Co-Authored-By 行。这是 release commit，不是 code contribution。

### Step 10: 发布 Release Artifacts 和 GitHub Release

Project artifact publishing 和 GitHub Releases 是两个独立输出：

1. **Project artifacts**：
   - 如果 `release.hooks.publish_artifact` 存在，对每个已准备 target 运行一次
   - 传入 tag 和 GitHub Release 使用的同一个 `{release_notes_file}`
   - 在 dry-run mode 中，传入 `{dry_run}=true` 并报告将会发布什么

2. **GitHub Release**：
   - 仅当用户确认 remote publishing 且 GitHub support 可用时运行
   - 创建 release 前确认 tag 已存在于 remote
   - 使用提取出的 notes 创建或更新：
     ```bash
     if gh release view v{VERSION} >/dev/null 2>&1; then
       gh release edit v{VERSION} --title "v{VERSION}" --notes-file <release-notes-file>
     else
       gh release create v{VERSION} --title "v{VERSION}" --notes-file <release-notes-file> --verify-tag
     fi
     ```
   - 绝不要将多行 release notes inline 到 shell commands

**发布后输出**：
```
Release v1.3.0 created.

Commits:
  1. feat(baoyu-cover-image): add watercolor and minimalist styles
  2. fix(baoyu-comic): improve panel layout for long dialogues
  3. docs(project): update architecture documentation
  4. chore: release v1.3.0

Tag: v1.3.0
Tag type: annotated
GitHub Release: published  # or "skipped/local only"
Status: Pushed to origin  # or "Local only - run git push when ready"
```

## 回填已有 GitHub Releases

当用户要求回填 historical releases，或传入 `--backfill-releases` 时，使用此模式。

1. 不要 bump versions、编辑 changelogs 或创建 release commits。
2. 按 version 顺序列出现有 tags，并检测缺失的 releases：
   ```bash
   git tag --sort=v:refname
   gh release view <tag>
   ```
3. 对每个没有 GitHub Release 的 tag：
   - 去掉配置的 tag prefix 来规范化 changelog lookup，例如 `v1.2.3` -> `1.2.3`
   - 从 `CHANGELOG.md` 提取匹配 section；fallback 到第一个匹配的 changelog file
   - 如果没有匹配的 changelog section，发布前跳过或询问
   - 用以下命令创建 release：
     ```bash
     gh release create <tag> --title "<tag>" --notes-file <release-notes-file> --verify-tag
     ```
4. 用 `git cat-file -t <tag>` 检测 lightweight tags（`commit` 表示 lightweight，`tag` 表示 annotated）。
5. 默认不要重写 public lightweight tags。将现有 remote tag 转换为 annotated tag 需要用户明确确认，因为这会重写已发布引用。

## Configuration (.releaserc.yml)

项目根目录中的可选 config file，用于覆盖 defaults：

```yaml
# .releaserc.yml - Optional configuration

# Version file (auto-detected if not specified)
version:
  file: package.json
  path: $.version  # JSONPath for JSON, dotted path for TOML

# Changelog files (auto-detected if not specified)
changelog:
  files:
    - path: CHANGELOG.md
      lang: en
    - path: CHANGELOG.zh.md
      lang: zh
    - path: CHANGELOG.ja.md
      lang: ja

  # Section mapping (conventional commit type → changelog section)
  # Use null to skip a type in changelog
  sections:
    feat: Features
    fix: Fixes
    docs: Documentation
    refactor: Refactor
    perf: Performance
    test: Tests
    chore: null

# Commit message format
commit:
  message: "chore: release v{version}"

# Tag format
tag:
  prefix: v  # Results in v1.0.0
  sign: false

# Additional files to include in release commit
include:
  - README.md
  - package.json
```

## Dry-Run Mode

指定 `--dry-run` 时：

```
=== DRY RUN MODE ===

Project detected:
  Version file: package.json (1.2.3)
  Changelogs: CHANGELOG.md (en), CHANGELOG.zh.md (zh)

Last tag: v1.2.3
Proposed version: v1.3.0

Changes grouped by skill/module:
  baoyu-cover-image:
    - feat: add watercolor style
    - feat: add minimalist style
    → Commit: feat(baoyu-cover-image): add watercolor and minimalist styles
    → README updates: options table

  baoyu-comic:
    - fix: panel layout for long dialogues
    → Commit: fix(baoyu-comic): improve panel layout for long dialogues
    → No README updates

Changelog preview (en):
  ## 1.3.0 - 2026-01-22
  ### Features
  - Add watercolor and minimalist styles to cover-image
  ### Fixes
  - Improve panel layout for long dialogues in comic

Changelog preview (zh):
  ## 1.3.0 - 2026-01-22
  ### 新功能
  - 为 cover-image 添加水彩和极简风格
  ### 修复
  - 改进 comic 长对话的面板布局

Commits to create:
  1. feat(baoyu-cover-image): add watercolor and minimalist styles
  2. fix(baoyu-comic): improve panel layout for long dialogues
  3. chore: release v1.3.0

No changes made. Run without --dry-run to execute.
```

## 使用示例

```
/release-skills              # Auto-detect version bump
/release-skills --dry-run    # Preview only
/release-skills --minor      # Force minor bump
/release-skills --patch      # Force patch bump
/release-skills --major      # Force major bump (with confirmation)
/release-skills --backfill-releases  # Create missing GitHub Releases for existing tags
```

## 何时使用

当用户请求以下内容时触发此 skill：
- "release", "发布", "create release", "new version", "新版本"
- "bump version", "update version", "更新版本"
- "prepare release"
- "release notes", "GitHub Release", "回填 Release"
- "push to remote" (with uncommitted changes)

**重要**：如果用户在有未提交变更时说 "just push" 或 "直接 push"，仍然先执行上面的全部步骤。
