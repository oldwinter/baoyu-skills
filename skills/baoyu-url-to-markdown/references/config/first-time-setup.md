---
name: first-time-setup
description: baoyu-url-to-markdown 偏好的首次设置流程
---

# 首次设置

## 概述

当找不到 EXTEND.md 时，引导用户完成偏好设置。

**阻塞操作**：必须先完成此设置，才能执行任何其他 workflow 步骤。不要：
- 开始转换 URLs
- 询问 URLs 或 output paths
- 进入任何 conversion

只询问本设置流程中的问题，保存 EXTEND.md，然后继续。

## 设置流程

```
No EXTEND.md found
        |
        v
+---------------------+
| AskUserQuestion     |
| (all questions)     |
+---------------------+
        |
        v
+---------------------+
| Create EXTEND.md    |
+---------------------+
        |
        v
    Continue conversion
```

## 问题

**Language**：使用用户的输入语言或已保存语言偏好。

使用 AskUserQuestion，在一次调用中包含所有问题：

### 问题 1：Download Media

```yaml
header: "Media"
question: "How to handle images and videos in pages?"
options:
  - label: "Ask each time (Recommended)"
    description: "After saving markdown, ask whether to download media"
  - label: "Always download"
    description: "Always download media to local imgs/ and videos/ directories"
  - label: "Never download"
    description: "Keep original remote URLs in markdown"
```

### 问题 2：Default Output Directory

```yaml
header: "Output"
question: "Default output directory?"
options:
  - label: "url-to-markdown (Recommended)"
    description: "Save to ./url-to-markdown/{domain}/{slug}.md"
```

注意：用户可能会选择 "Other" 来输入自定义路径。

### 问题 3：Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "User (Recommended)"
    description: "~/.baoyu-skills/ (all projects)"
  - label: "Project"
    description: ".baoyu-skills/ (this project only)"
```

## 保存位置

| 选择 | Path | 范围 |
|--------|------|-------|
| User | `~/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | 所有 projects |
| Project | `.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | 当前 project |

## 设置后

1. 按需创建目录
2. 写入 EXTEND.md
3. 确认："Preferences saved to [path]"
4. 使用已保存 preferences 继续 conversion

## EXTEND.md 模板

```md
download_media: [ask/1/0]
default_output_dir: [path or empty]
```

## 后续修改偏好

用户可以直接编辑 EXTEND.md，或删除它以再次触发设置。
