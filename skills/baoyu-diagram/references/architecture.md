# Architecture Diagram Layout

## Flow Direction

选择一个 primary direction：
- **Left-to-Right (LTR):** 最适合 data pipelines、request flows。Users/clients 在左侧，data stores 在右侧。
- **Top-to-Bottom (TTB):** 最适合 layered architectures。Clients 在顶部，infrastructure 在底部。

## Layout Algorithm

1. **Identify layers**：按 role（clients、gateways、services、data、infrastructure）分组 components
2. **Assign columns (LTR) or rows (TTB)**：每个 layer 占一列/一行
3. **Within each layer**：components 垂直堆叠（LTR）或水平排列（TTB），最小 gap 40px
4. **Region boundaries**：围绕共享 infrastructure 的组绘制边界（如 "AWS us-east-1"、"Kubernetes Cluster"）
5. **Connectors**：在 layers 之间路由 arrows。对于 layers 之间的 buses/queues，在间隙中放置细 connector bar。

## Typical Layer Structure (LTR)

```
Col 1 (x=40)     Col 2 (x=250)     Col 3 (x=460)     Col 4 (x=670)
┌──────────┐     ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client   │────▶│ Gateway  │─────▶│ Services │─────▶│ Database │
│  Layer    │     │  Layer   │      │  Layer   │      │  Layer   │
└──────────┘     └──────────┘      └──────────┘      └──────────┘
```

Column spacing：列起点之间 200-220px。如果 components 更宽，则调整。

## Typical Layer Structure (TTB)

```
Row 1 (y=60):   [ Browser ]  [ Mobile App ]  [ API Client ]
Row 2 (y=160):  [         Load Balancer / API Gateway       ]
Row 3 (y=280):  [ Auth Svc ]  [ User Svc ]  [ Order Svc ]
Row 4 (y=400):  [  Redis  ]   [ PostgreSQL ]  [ S3 Bucket ]
```

Row spacing：行起点之间 120-140px。

## Connection Routing

- 优先使用 straight horizontal 或 vertical lines
- 对会穿过 components 的 connections，使用 two-segment（L-shaped）paths：
  ```svg
  <path d="M x1,y1 L midX,y1 L midX,y2" fill="none" stroke="#64748b" marker-end="url(#arrow)"/>
  ```
- 对 busy diagrams，给不太重要的 connections 使用 `stroke-opacity="0.6"`
- 在 midpoint 附近用 text element 标注重要 connections

## Message Bus / Event Bus Pattern

当 services 通过 shared bus 通信时，在 service layer 之间将它画成 horizontal bar：

```
Services:  [ Svc A ]    [ Svc B ]    [ Svc C ]
              │              │            │
Bus:     ════╪══════════════╪════════════╪═══════
              │              │            │
Data:    [ DB A ]        [ DB B ]     [ Cache ]
```

bus bar 使用 Connector color（orange）。

## Multi-Region / Multi-Cloud

嵌套 region boundaries：
- Outer boundary：Cloud provider（AWS、GCP）
- Inner boundary：Region 或 VPC
- Innermost：Availability zones 或 subnets

使用不同 dash patterns 区分 nesting levels：
- Outer：`stroke-dasharray="12,4"`
- Middle：`stroke-dasharray="8,4"`
- Inner：`stroke-dasharray="4,4"`
