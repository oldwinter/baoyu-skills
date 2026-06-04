# 自动选择规则

当某个 dimension 被省略时，根据 content signals 选择。

## 自动选择 Type

| 信号 | Type |
|---------|------|
| Product, launch, announcement, release, reveal | `hero` |
| Architecture, framework, system, API, technical, model | `conceptual` |
| Quote, opinion, insight, thought, headline, statement | `typography` |
| Philosophy, growth, abstract, meaning, reflection | `metaphor` |
| Story, journey, travel, lifestyle, experience, narrative | `scene` |
| Zen, focus, essential, core, simple, pure | `minimal` |

## Auto Palette Selection

| Signals | Palette |
|---------|---------|
| Personal story, emotion, lifestyle, human | `warm` |
| Business, professional, thought leadership, luxury | `elegant` |
| Architecture, system, API, technical, code | `cool` |
| Entertainment, premium, cinematic, dark mode | `dark` |
| Nature, wellness, eco, organic, travel | `earth` |
| Product launch, gaming, promotion, event | `vivid` |
| Fantasy, children, gentle, creative, whimsical | `pastel` |
| Zen, focus, essential, pure, simple | `mono` |
| History, vintage, retro, classic, exploration | `retro` |
| Movie poster, album cover, concert, cinematic, dramatic, two-color | `duotone` |
| Education, tutorial, knowledge, onboarding, concept explainer | `macaron` |

## 自动选择 Rendering

| 信号 | Rendering |
|---------|-----------|
| Clean, modern, tech, WeChat, icon-based, infographic | `flat-vector` |
| Sketch, note, personal, casual, doodle, warm | `hand-drawn` |
| Art, watercolor, soft, dreamy, creative, fantasy | `painterly` |
| Data, dashboard, SaaS, corporate, polished | `digital` |
| Gaming, retro, 8-bit, nostalgic | `pixel` |
| Education, tutorial, classroom, teaching | `chalk` |
| Poster, movie, album, concert, silhouette, mondo, limited-edition | `screen-print` |

## 自动选择 Text

| 信号 | Text 级别 |
|---------|------------|
| Visual-only, photography, abstract, art | `none` |
| Article, blog, standard cover | `title-only` |
| Series, tutorial, technical with context | `title-subtitle` |
| Announcement, features, multiple points, infographic | `text-rich` |

默认：`title-only`

## 自动选择 Mood

| 信号 | Mood 级别 |
|---------|------------|
| Professional, corporate, thought leadership, academic, luxury | `subtle` |
| General, educational, standard, blog, documentation | `balanced` |
| Launch, announcement, promotion, event, gaming, entertainment | `bold` |

默认：`balanced`

## 自动选择 Font

| 信号 | Font |
|---------|------|
| Personal, lifestyle, human, warm, friendly, story | `handwritten` |
| Technical, professional, clean, modern, minimal, data | `clean` |
| Editorial, academic, luxury, classic, literary | `serif` |
| Announcement, entertainment, promotion, bold, event, gaming | `display` |

默认：`clean`
