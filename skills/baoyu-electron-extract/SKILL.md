---
name: baoyu-electron-extract
description: 从任意已安装 Electron app（`.asar` bundle）中提取资源和 JavaScript；当存在 `.js.map` files 时从中还原原始 sources，否则使用 Prettier 格式化 minified code。当用户想 "extract Electron app"、"decompile Electron"、"get the source code of <app>"、"inspect app.asar"、"看 Electron 应用源码"、"提取 .asar"，或询问某个 desktop Electron app 如何构建时使用。会跳过 `node_modules`，并支持 macOS 和 Windows。
version: 1.119.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-electron-extract
    requires:
      anyBins:
        - bun
        - npx
---

# Electron App Extract

## User Input Tools

当该 skill 需要询问用户时，遵循以下 tool-selection rule（优先级顺序）：

1. **优先使用当前 agent runtime 暴露的内置 user-input tools**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任意等价工具。
2. **Fallback**：如果没有这类工具，输出编号式纯文本消息，让用户为每个问题回复所选编号/答案。
3. **Batching**：如果工具支持一次调用多个问题，把所有适用问题合并到一次调用；如果只支持单问题，则按优先级一次问一个。

下文中的具体 `AskUserQuestion` 只是示例；其他 runtime 中请替换成本地等价工具。

## Script Directory

Scripts 位于 `scripts/` 子目录。`{baseDir}` = 当前 SKILL.md 所在目录路径。解析 `${BUN_X}` runtime：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。把本文档中的 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | App discovery + asar extraction + source-map restoration + Prettier formatting |

## Workflow

**1. Determine the input.** 接受 **app name**（例如 `Codex`）或 **absolute path**（`/Applications/Codex.app`、`.asar` 文件或 Windows install dir）。如果用户没有给出，先询问；如果用户想指定 custom output directory，也一并询问。

**2. Run the script.**

```bash
${BUN_X} {baseDir}/scripts/main.ts "<app>" [--output <dir>] [--asar <path>] [--force]
```

如果不确定 discovery 是否会找到正确 bundle，先从 `--dry-run` 开始：它会打印 resolved paths 并退出，不触碰 filesystem。

**3. Handle the result.**

- **Success** → 报告 output paths 和 counts（extracted / restored / formatted）。
- **Multiple matches** → script 会列出 candidates 并非零退出。向用户展示 candidates，询问使用哪一个（通过 `AskUserQuestion` 或 runtime 等价工具），然后用选中的 absolute path 重新运行。
- **Existing non-empty output dir** → 没有 `--force` 时 script 会拒绝。询问用户是覆盖（`--force`）还是选择新的 `--output` path。
- **Unsupported platform / no match** → 如果用户知道 bundle 位置，建议传入 `--asar /full/path/to/app.asar`。

**4. Point the user at the result.** 默认 output dir 是 `~/Downloads/<AppName>-electron-extract/`。最值得阅读的子目录取决于发现了什么：

- 存在 `restored/` → 原始 source tree 已从 `.js.map` files 重建；优先阅读这里。
- 只有 `extracted/`（没有 maps）→ `extracted/` 中的 JS/CSS 已原地 Prettier-formatted；从这里阅读。

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts Codex                                   # → ~/Downloads/Codex-electron-extract/
${BUN_X} {baseDir}/scripts/main.ts "/Applications/Visual Studio Code.app"  # .app bundle、install dir 或 .asar
${BUN_X} {baseDir}/scripts/main.ts "C:\Users\you\AppData\Local\Programs\codex"
${BUN_X} {baseDir}/scripts/main.ts --asar /Applications/Codex.app/Contents/Resources/app.asar Codex
${BUN_X} {baseDir}/scripts/main.ts Codex --output ~/work/codex-source
${BUN_X} {baseDir}/scripts/main.ts Codex --json                            # stdout 输出一行 JSON
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `<app>` | | App name 或 absolute path。除非给出 `--asar`，否则 required。 | — |
| `--output` | `-o` | Output directory | `~/Downloads/<AppName>-electron-extract` |
| `--asar` | | 覆盖 resolved `.asar` path | auto-discovered |
| `--force` | `-f` | 允许写入已有且非空的 output dir | false |
| `--skip-format` | | 跳过 Prettier formatting | false |
| `--skip-restore` | | 跳过 source-map restoration | false |
| `--no-unpacked` | | 不复制旁边的 `app.asar.unpacked/` | false |
| `--dry-run` | | 打印 resolved paths 后退出，不写入 | false |
| `--json` | | 在 stdout 输出一行 JSON summary（抑制普通输出） | false |

## Output layout

```
~/Downloads/<AppName>-electron-extract/
├── extract-report.json          # JSON summary：counts、warnings、resolved paths
├── extracted/                   # 原始 asar 内容（无 map 时 JS/CSS 已 Prettier-formatted）
│   └── ...                      # node_modules 保持原样（跳过格式化）
├── extracted.unpacked/          # 如果存在 <asar>.unpacked/ 则复制过来
│   └── ...                      # native modules（.node）、大型 assets
└── restored/                    # 仅当至少一个 .js.map 可用时存在
    └── <original/source/tree>   # 由各 .js.map 的 sourcesContent 重建
```

## Source-Map Path Restoration

Script 应尽可能保留原始 source names 和 directory structure，只要 source map 允许：

- 当存在 `sourceRoot` 时，与每个 `sources[]` entry 合并解析，然后再相对于 `extracted/` 内 `.js.map` 文件所在目录解析。例如 `.vite/main/index.js.map` + `../../src/main.ts` 变为 `restored/src/main.ts`。
- `../` segments 不会被自动视为不安全：先从 map 所在位置解析，再清洗最终 path，确保仍位于 `restored/` 下。向上越过 `extracted/` 的路径会保留其可读部分 —— `.vite/main/index.js.map` + `../../../shared/src/lib/foo.ts` 变为 `restored/shared/src/lib/foo.ts`。
- 去掉 source names 中的 URL/query decorations（`webpack://`、`file://`、`?loader` suffixes）。
- 只有当 source name 为空或无法规约为安全 file path 时，才使用 `restored/__unknown/<hash>.<ext>`。
- 跳过 `node_modules` 和 `webpack/runtime/*` entries（bundler/runtime noise）。

## Notes

- **node_modules** 始终跳过：无论 source-map restoration 还是 Prettier formatting 都跳过。
- **Restoration needs embedded `sourcesContent`**（webpack、esbuild、Vite、rollup 的常见情况）。如果 map 引用了外部 files 但没有嵌入内容，该 map 会被跳过，对应 `.js` 改用 Prettier formatting；Skipped maps 会列在 `extract-report.json` 的 `warnings` 中。
- **App discovery**：macOS 搜索 `/Applications` + `~/Applications`；Windows 搜索 `%LOCALAPPDATA%\Programs`、`%PROGRAMFILES%`、`%PROGRAMFILES(X86)%`、`%APPDATA%`。多个 matches → script 退出并列出它们；用 absolute path 重新运行。Linux/其他平台：显式传入 `--asar /path/to/app.asar`。
- **Safety**：script 拒绝写入 `/`、用户 home 目录本身或当前 working directory；没有 `--force` 时，也拒绝写入已有且非空的 output dir。
- **No global installs**：`@electron/asar` 和 `prettier` 会通过 `npx -y` on-the-fly 解析；首次运行会因为 npx cache 而较慢。
