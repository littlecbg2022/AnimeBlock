# ANIMEBLOCK

> 2006 — 2026，每年 50 部动画的个人补番矩阵、进度记录与可解释推荐。

ANIMEBLOCK 是一个纯前端的个人动画档案：把 21 年 × 50 部作品压缩成一块可被填满的 **ARCHIVE MAP**，点格子记录“看过”，用标签画像生成可解释的推荐；数据存本机，可随时导出。

## 特性

- **ARCHIVE MAP**：21 × 50 的微缩矩阵，一眼看到全部年份的补完度；悬停查看作品，点击跳到对应年份。
- **矩阵打卡**：每年 50 部，全部可打卡；进度条、年度进度和总完成度实时更新。
- **清新浅色界面**：薄荷纸感背景、白色卡片、圆角小格子；桌面 13 列，移动端 4 列。
- **大尺寸悬停预览**：720px 浮层，封面、标题、评分、标签和简介一次看全。
- **排序**：每年默认按评分，可切换发布时间和首字母（中文按拼音）。
- **可解释推荐**：标签 IDF、低分作品负权重、同系列去重、评分与热度校正；已看过的季/前作不会被推荐，同系列只推后续，并给出“因为你喜欢《…》”的理由，支持换一批。
- **口味词云**：从已看作品自动汇总类型、情绪与高阶标签，字号随片数变化、颜色按情绪分组；悬停显示“已看 N 部”，点击标签直接筛选档案，再点一次取消。标签库经过筛选，只保留能说明口味的词，不展示技术性或不适标签；词云可折叠。
- **三语界面**：中文 / English / 日本語；1050 部作品的中 / 英 / 日简介均已补齐，机器翻译在详情标注。
- **在线观看**：AGE 动漫 / OmoFun 第三方资源站置顶，自动用去掉季度和副标题的正片名搜索，搜不到可切全名 / 日文名 / Bing 站内搜索；官方免费渠道折叠备用，正版平台单独分区；全部走外链提醒。
- **本地优先**：`localStorage` 保存进度，支持 JSON 导出/导入，跨标签页同步。
- **后端屏蔽**：9 部手动排除的作品不进入公开目录；`data/blocklist.json` 保留屏蔽名单，后续更新榜单时自动跳过并补足每年 50 部。

## 数据来源

| 用途 | 来源 |
| --- | --- |
| 作品 id、标题、封面、标签、AniList 评分、热度 | [AniList GraphQL](https://anilist.co) |
| 中文标题、Bangumi / Bilibili 跨站 id | [bangumi-data](https://github.com/bangumi-data/bangumi-data) |
| 中文简介、B 站评分 | [Bilibili](https://www.bilibili.com/anime/) |
| 中文简介、豆瓣评分（fallback） | [豆瓣](https://movie.douban.com/) |
| 中 / 英 / 日简介补译 | [Chrome 内置翻译模型](https://developer.chrome.com/docs/ai/translator-api)（预生成） |

- 目录范围：**2006—2026**，每年按 AniList 热度取前 50 部 TV / TV_SHORT 动画，共 **1050 部**；屏蔽名单中的作品会自动跳过并顺延补足 50 部，2026 标记为“进行中”。
- 简介先采用 B 站 / 豆瓣 / 本地中文档案 / AniList 英文原文，再用 **Chrome 内置翻译模型**补齐中、英、日三种语言；译文在详情里标注“机器翻译”。
- 23 条缺少中文名的标题按官方中文名或官方原名校正；没有通行中文名的作品保留官方英文名（如 `CLANNAD`、`NEW GAME!`）。
- 本站不存储任何视频文件；封面、简介与评分的版权归原作者及来源站所有。

### 当前数据快照（2026-10）

- **1050** 部作品，**1050** 部可打卡；9 部屏蔽作品不进入公开目录，名单保存在 `data/blocklist.json`。
- 中文简介 **1050 / 1050**，英文简介 **1050 / 1050**，日文简介 **1050 / 1050**。
- 机器翻译：英文 **885** 条、中文 **177** 条、日文 **980** 条；源语言内容保留原文并标注来源。
- B 站简介 **289** 条、B 站评分 **287** 条；豆瓣 fallback **3** 条（豆瓣的公开 suggest 接口在抓取期间被限流，只保留了已验证的详情）。
- 2026 年同样具备中 / 英 / 日简介；新番的中文原文仍以 B 站和本地档案为主。
- 抓取管道已不再调用 TMDB；旧快照里的 651 条中文摘要作为 `legacy` 保留（无法逐条追溯来源，后续可用 Bilibili / Bangumi 逐步替换）。

## 技术栈

- Next.js 16 App Router + React 19 + TypeScript（strict）
- Tailwind CSS 4（仅用于基础样式与少量工具类，视觉系统在 `app/globals.css`）
- `lucide-react` 图标
- 原生 `<dialog>` 实现详情抽屉、推荐面板、设置与外链提醒（自带焦点陷阱与 Esc 关闭）

## 项目结构

```text
app/
  layout.tsx          页面元信息与根布局
  page.tsx            服务端入口
  globals.css         设计 token、布局、组件样式
  icon.svg            favicon
components/
  archive.tsx         客户端根组件：状态、筛选、导入导出、快捷键
  site-header.tsx     品牌、进度、搜索、操作
  overview-plate.tsx  21 × 50 的 ARCHIVE MAP
  year-section.tsx    年份标题 + 50 个格子（移动端折叠）
  anime-cell.tsx      单个格子（打卡 / 详情）
  preview-card.tsx    悬停时唯一的一张封面预览
  detail-sheet.tsx    右侧作品档案抽屉
  radar-sheet.tsx     完整推荐列表
  radar-strip.tsx     首页推荐条
  settings-menu.tsx   导出 / 导入 / 清空
  external-link-dialog.tsx  外链安全提醒
  toast.tsx           轻量反馈
lib/
  types.ts            数据模型
  catalog.ts          目录索引与派生统计
  i18n.ts             三语文案与标签本地化
  recommendations.ts  口味画像与推荐算法
  watchlist.ts        localStorage 存储（useSyncExternalStore）
  format.ts           数字 / 日期 / 百分比格式化
  use-dialog.ts       <dialog> 开关、body 滚动锁
scripts/
  build-catalog.mjs   数据抓取与合并
  validate-catalog.mjs 目录结构校验
data/
  catalog.json        生成后的完整目录（构建时直接 import）
```

## 本地运行

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm start
```

其他命令：

```bash
pnpm lint
pnpm typecheck
pnpm data:validate
```

## 数据管道

```bash
pnpm data
```

脚本会：

1. 从 AniList 抓取 2006—2026 每年热度前 50 的作品；
2. 用 `bangumi-data` 的 AniList id 映射中文标题、Bangumi id 与 Bilibili id；
3. 用 Bilibili 详情补中文简介、B 站评分；
4. 对仍缺中文简介的作品尝试豆瓣 suggest + 详情补全（公开接口会限流，能补多少补多少）；
5. 合并、校验并写入 `data/catalog.json`；
6. 本次快照额外用 Chrome 内置翻译模型补齐中 / 英 / 日简介（译文标注“机器翻译”）；新增条目需要在目录更新后重新补译。

常用参数：

```bash
node scripts/build-catalog.mjs --years=2007,2026 --limit=10
node scripts/build-catalog.mjs --skip-douban
node scripts/build-catalog.mjs --refresh
```

- 接口响应缓存于 `scripts/.cache/`（已在 `.gitignore` 中），重复运行可断点续跑。
- 不需要任何 API key；请遵守各来源站的使用条款，不要高频抓取。
- 重新生成后运行 `pnpm data:validate` 检查年份数量、id 唯一性、必填字段与中 / 英 / 日简介覆盖率。

## 进度存储

- 主键：`animeblock.watchlist.v2`
- 结构：`{ version: 2, ids: string[], updatedAt: string }`
- 自动迁移旧的 `watchedAnime` 数组格式。
- 只保存 AniList id，不保存标题或封面；目录更新后旧标记仍然有效。
- 导出文件结构：

```json
{
  "app": "animeblock",
  "version": 2,
  "ids": ["1535", "2167"],
  "exportedAt": "2026-10-17T09:00:00.000Z"
}
```

## 设计约定

- 颜色：`#f5f8f3` 背景、`#18221d` 主文字、`#2f9e6e` 强调、`#df6a58` 封印。
- 字体：系统无衬线 + 等宽；数字使用 tabular-nums。
- 圆角 10—20px 的白色卡片/格子，轻阴影；层级依靠 1px 细线、字号与留白。
- 动效只保留 150—450ms 的淡入/位移；尊重 `prefers-reduced-motion`。
- 移动端年份默认折叠为 12 部，可展开全部。

## 声明

这是一个个人补番记录项目，与 AniList、Bangumi、Bilibili、豆瓣均无隶属关系。数据仅用于个人浏览与记录；如需商用或大规模分发，请先确认各来源的授权条款。

在线观看中的第三方资源站（AGE 动漫、OmoFun）仅作为用户自行选择的外部搜索入口，与本站无隶属关系；本站不存储视频，也不对第三方站点的内容、广告、版权状态或安全性负责。
