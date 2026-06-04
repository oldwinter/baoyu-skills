# Changesets

此文件夹存放由 Changesets 管理的 version bumps 的 release notes。

合并 user-facing change 前，创建一个新的 changeset：

```bash
bunx changeset
```

Changeset 合入 `main` 后，GitHub Actions 会自动打开或更新 release PR。合并该 release PR 会发布下一个 npm version。
