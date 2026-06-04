# Quality Gate & Recovery

Headless Chrome 可能静默返回低质量内容，如 layout shells、login walls 或 framework payloads，而 CLI 仍返回 0。每次 headless 运行后都阅读本节，以便发现并恢复这些情况。

## Agent 必须执行的检查

1. 确认 markdown title 匹配目标页面，而不是通用 site shell
2. 确认 body 包含预期 article/page content，而不只是 navigation、footer 或通用错误
3. 留意明显失败信号：
   - `Application error`
   - `This page could not be found`
   - Login、signup、subscribe 或 verification shells
   - 对本应是长文的页面，markdown 极短
   - Raw framework payloads 或大多为 boilerplate content
4. 不要仅因为 CLI 退出码为 `0` 就认定运行成功

**提示**：使用 `--format json` 运行，可获得包括 `status`、`login.state` 和 `interaction` 在内的结构化信号。`"status": "needs_interaction"` 表示页面需要人工交互。

## Recovery Workflow

1. 默认从 headless 开始，除非已有明确理由使用 interaction mode
2. 运行后立即 review markdown quality
3. 如果内容质量低，或显示 login/CAPTCHA：
   - `--wait-for interaction` for auto-detected gates (login, CAPTCHA, Cloudflare)
   - `--wait-for force` when the page needs manual browsing, scroll loading, or complex interaction
4. 如果使用 `--wait-for`，明确告诉用户要做什么：
   - Login required → 在 browser 中登录
   - CAPTCHA visible → 完成验证
   - Slow loading → 等到内容可见
   - `--wait-for force` → 准备好后按 Enter
5. 如果 JSON output 显示 `"status": "needs_interaction"`，自动切换到 `--wait-for interaction`

## Capture Modes

| Mode | 行为 | 适用场景 |
|------|----------|----------|
| Default | Headless Chrome，在 network idle 后自动提取 | Public pages、static content |
| `--headless` | 显式 headless（与默认相同） | 澄清意图 |
| `--wait-for interaction` | 打开 visible Chrome，自动检测 login/CAPTCHA gates，等待它们清除后继续 | Login-required、CAPTCHA-protected |
| `--wait-for force` | 打开 visible Chrome，自动检测或接受 Enter keypress 继续 | Complex flows、lazy loading、paywalls |

**Interaction gate auto-detection**：Cloudflare Turnstile / "just a moment" pages、Google reCAPTCHA、hCaptcha、custom challenge / verification screens。
