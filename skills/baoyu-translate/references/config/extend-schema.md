# baoyu-translate 的 EXTEND.md Schema

## Format

EXTEND.md 使用 YAML 格式：

```yaml
# Default target language (ISO code or common name)
target_language: zh-CN

# Default translation mode
default_mode: normal  # quick | normal | refined

# Target audience (affects annotation depth and register)
audience: general  # general | technical | academic | business | or custom string

# Translation style preference
style: storytelling  # storytelling | formal | technical | literal | academic | business | humorous | conversational | elegant | or custom string

# Word count threshold to trigger chunked translation
chunk_threshold: 4000

# Max words per chunk
chunk_max_words: 5000

# Custom glossary (merged with built-in glossary)
# CLI --glossary flag overrides these
# Supports inline entries and/or file paths
glossary:
  - from: "Reinforcement Learning"
    to: "强化学习"
  - from: "Transformer"
    to: "Transformer"
    note: "Keep English"

# Load glossary from external file(s)
# Supports absolute path or relative to EXTEND.md location
# File format: markdown table with | from | to | note | columns,
# or YAML list of {from, to, note} entries
glossary_files:
  - ./my-glossary.md
  - /path/to/shared-glossary.yaml

# Language-pair specific glossaries
glossaries:
  en-zh:
    - from: "AI Agent"
      to: "AI 智能体"
  ja-zh:
    - from: "人工知能"
      to: "人工智能"
```

## 字段

| Field | Type | Default | 说明 |
|-------|------|---------|-------------|
| `target_language` | string | `zh-CN` | 默认目标语言代码 |
| `default_mode` | string | `normal` | 默认翻译模式（`quick` / `normal` / `refined`） |
| `audience` | string | `general` | 目标读者画像（`general` / `technical` / `academic` / `business` / custom） |
| `style` | string | `storytelling` | 翻译风格（`storytelling` / `formal` / `technical` / `literal` / `academic` / `business` / `humorous` / `conversational` / `elegant` / custom） |
| `chunk_threshold` | number | `4000` | 触发 chunked translation 的词数阈值 |
| `chunk_max_words` | number | `5000` | 每个 chunk 最大词数 |
| `glossary` | array | `[]` | 通用 glossary entries（内联） |
| `glossary_files` | array | `[]` | 外部 glossary 文件路径（绝对路径或相对 EXTEND.md） |
| `glossaries` | object | `{}` | 特定语言对 glossary entries |

## Glossary Entry

| Field | Required | 说明 |
|-------|----------|-------------|
| `from` | yes | 源术语 |
| `to` | yes | 目标译法 |
| `note` | no | 使用说明（例如 "Keep English", "Only in tech context"） |

## Glossary File Format

外部 glossary 文件（`glossary_files`）支持两种格式：

**Markdown table** (`.md`):
```markdown
| from | to | note |
|------|----|------|
| Reinforcement Learning | 强化学习 | |
| Transformer | Transformer | Keep English |
```

**YAML list** (`.yaml` / `.yml`):
```yaml
- from: "Reinforcement Learning"
  to: "强化学习"
- from: "Transformer"
  to: "Transformer"
  note: "Keep English"
```

路径可以是绝对路径，或相对 EXTEND.md 文件所在位置。

## Priority

1. CLI `--glossary` file entries
2. EXTEND.md `glossaries[pair]` entries
3. EXTEND.md `glossary` entries (inline)
4. EXTEND.md `glossary_files` entries (in listed order, later files override earlier)
5. Built-in glossary (e.g., `references/glossary-en-zh.md`)

对同一源术语，后面的 entries 会覆盖前面的。
