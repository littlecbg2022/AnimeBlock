import type { Anime, Language, SummarySource } from './types';

export interface Messages {
  brandSub: string;
  searchPlaceholder: string;
  searchHint: string;
  searchClear: string;
  filterUnwatched: string;
  random: string;
  radar: string;
  settings: string;
  language: string;
  marked: string;
  titles: string;
  yearsUnit: string;
  heroKicker: string;
  heroMeta: (first: number, last: number, years: number, total: number) => string;
  archiveMap: string;
  archiveMapHint: string;
  legendWatched: string;
  legendUnwatched: string;
  legendSealed: string;
  tasteKicker: string;
  tasteTitle: string;
  tasteBasedOn: (count: number) => string;
  tasteHint: string;
  tasteEmpty: string;
  tasteWatchedCount: (count: number) => string;
  tasteClear: string;
  tasteToggle: string;
  tasteLegendHeal: string;
  tasteLegendDark: string;
  tasteLegendAction: string;
  tasteLegendWorld: string;
  tasteLegendCharacter: string;
  tasteLegendCraft: string;
  radarTitle: string;
  radarKicker: string;
  radarEmpty: string;
  radarEmptyHint: string;
  radarViewAll: string;
  radarReason: (tags: string, rating: string) => string;
  radarScore: string;
  radarBasedOn: (count: number) => string;
  radarBecause: (title: string, tags: string, rating: string) => string;
  radarRefresh: string;
  radarNeedMore: (count: number) => string;
  archiveTitle: string;
  archiveKicker: string;
  sortBy: string;
  sortRating: string;
  sortDate: string;
  sortTitle: string;
  yearOngoing: string;
  yearComplete: string;
  yearCount: (watched: number, total: number) => string;
  sealed: string;
  sealedNote: string;
  sealedCount: (count: number) => string;
  detailArchive: string;
  detailEpisodes: (count: number) => string;
  detailStatus: string;
  detailScore: string;
  detailVotes: (value: string) => string;
  detailTags: string;
  detailSummary: string;
  summaryFromDouban: string;
  summaryFromBilibili: string;
  summaryFromLegacy: string;
  summaryFromAniList: string;
  summaryNone: string;
  summaryEnglishNote: string;
  machineTranslation: string;
  summaryFallback: (language: string) => string;
  watchTitle: string;
  watchNote: string;
  watchFreeTitle: string;
  watchFreeNote: string;
  watchOfficialFreeTitle: string;
  watchOfficialFreeNote: string;
  watchPaidTitle: string;
  watchAgedm: string;
  watchOmofuna: string;
  searchFallback: string;
  searchFull: string;
  searchJapanese: string;
  searchBing: string;
  watchYoutube: string;
  watchMuseAsia: string;
  watchAniOne: string;
  watchCrunchyroll: string;
  watchTubi: string;
  watchBilibili: string;
  watchIqiyi: string;
  watchYouku: string;
  watchTencent: string;
  watchNetflix: string;
  watchWeb: string;
  detailLinks: string;
  linkAniList: string;
  linkBangumi: string;
  linkBilibili: string;
  linkDouban: string;
  markWatched: string;
  unmarkWatched: string;
  close: string;
  securityTitle: string;
  securityIntro: string;
  securityBody: string;
  securityTarget: string;
  cancel: string;
  continue: string;
  settingsTitle: string;
  settingsKicker: string;
  settingsExport: string;
  settingsExportHint: string;
  settingsImport: string;
  settingsImportHint: string;
  settingsReset: string;
  settingsResetHint: string;
  settingsResetConfirm: string;
  settingsSources: string;
  settingsVersion: string;
  exported: string;
  imported: (count: number) => string;
  importError: string;
  resetDone: string;
  noResults: string;
  noResultsHint: string;
  clearFilters: string;
  noUnwatched: string;
  footerNote: string;
  footerData: string;
  updated: string;
  progressLabel: string;
  allTitles: string;
  filtered: string;
  openDetails: string;
  expandYear: (count: number) => string;
  collapseYear: string;
}

export const languageLabels: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
};

const zh: Messages = {
  brandSub: '个人补番档案 / 2006—2026',
  searchPlaceholder: '搜索标题或标签',
  searchHint: '按 / 聚焦',
  searchClear: '清除搜索',
  filterUnwatched: '只看未看',
  random: '随机一部',
  radar: '推荐雷达',
  settings: '设置',
  language: '语言',
  marked: '已标记',
  titles: '部',
  yearsUnit: '年',
  heroKicker: 'TITLES MARKED',
  heroMeta: (first, last, years, total) =>
    `${first} — ${last} · ${years} 年 · ${total.toLocaleString('en-US')} 部`,
  archiveMap: 'ARCHIVE MAP',
  archiveMapHint: '移动光标查看作品 · 点击跳到年份',
  legendWatched: '已看',
  legendUnwatched: '未看',
  legendSealed: '封印',
  tasteKicker: 'TASTE CLOUD / 口味成分',
  tasteTitle: '口味词云',
  tasteBasedOn: (count) => `基于 ${count} 部已看`,
  tasteHint: '点击标签筛选，再点一次取消',
  tasteEmpty: '标记几部作品后，这里会生成你的口味词云。',
  tasteWatchedCount: (count) => `已看 ${count} 部`,
  tasteClear: '清除标签筛选',
  tasteToggle: '展开或收起口味词云',
  tasteLegendHeal: '治愈 / 日常',
  tasteLegendDark: '致郁 / 沉重',
  tasteLegendAction: '燃 / 动作',
  tasteLegendWorld: '幻想 / 世界',
  tasteLegendCharacter: '人物 / 关系',
  tasteLegendCraft: '制作 / 风格',
  radarTitle: '推荐雷达',
  radarKicker: 'EXPLAINABLE PICKS',
  radarEmpty: '再标记几部，雷达就会启动。',
  radarEmptyHint: '至少需要 3 部已看作品才能计算口味画像。',
  radarViewAll: '查看全部推荐',
  radarReason: (tags, rating) => `与你已看作品的 ${tags} 口味接近，AniList 评分 ${rating}。`,
  radarScore: '契合度',
  radarBasedOn: (count) => `基于 ${count} 部已看作品`,
  radarBecause: (title, tags, rating) =>
    `因为你喜欢《${title}》的 ${tags} 口味；AniList 评分 ${rating}。`,
  radarRefresh: '换一批',
  radarNeedMore: (count) => `再标记 ${count} 部即可启动推荐。`,
  archiveTitle: 'THE ARCHIVE',
  archiveKicker: '全部年份 / 每年 50 部',
  sortBy: '排序',
  sortRating: '评分',
  sortDate: '发布时间',
  sortTitle: '首字母',
  yearOngoing: '进行中',
  yearComplete: '已完结',
  yearCount: (watched, total) =>
    `${String(watched).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
  sealed: 'SEALED',
  sealedNote: '该作品被手动排除，排在每年末尾，不参与进度、排序、评分与推荐。',
  sealedCount: (count) => `${count} 封印`,
  detailArchive: '作品档案',
  detailEpisodes: (count) => `${count} 话`,
  detailStatus: '状态',
  detailScore: '评分',
  detailVotes: (value) => `${value} 人评分`,
  detailTags: '风格标签',
  detailSummary: '剧情简介',
  summaryFromDouban: '豆瓣',
  summaryFromBilibili: 'B 站',
  summaryFromLegacy: '本地档案',
  summaryFromAniList: 'AniList',
  summaryNone: '暂无简介。',
  summaryEnglishNote: '中文简介暂缺，以下为 AniList 英文简介。',
  machineTranslation: '机器翻译',
  summaryFallback: (language) => `当前语言简介暂缺，显示 ${language} 版本。`,
  watchTitle: '在线观看',
  watchNote: '以下为正版平台的搜索链接；部分内容需要会员或付费，本站不存储视频。',
  watchFreeTitle: '第三方资源站',
  watchFreeNote:
    '以下为第三方资源站，非官方授权，可能含广告或版权风险；请自行判断。本站不存储视频。',
  watchOfficialFreeTitle: '官方免费（可能锁区）',
  watchOfficialFreeNote: '官方免费 / 广告支持渠道，部分地区不可用。',
  watchPaidTitle: '正版平台',
  watchAgedm: 'AGE 动漫',
  watchOmofuna: 'OmoFun',
  searchFallback: '搜不到？换关键词',
  searchFull: '全名',
  searchJapanese: '日文名',
  searchBing: 'Bing 站内搜索',
  watchYoutube: 'YouTube 官方',
  watchMuseAsia: 'Muse Asia',
  watchAniOne: 'Ani-One Asia',
  watchCrunchyroll: 'Crunchyroll 免费',
  watchTubi: 'Tubi 免费',
  watchBilibili: 'B 站',
  watchIqiyi: '爱奇艺',
  watchYouku: '优酷',
  watchTencent: '腾讯视频',
  watchNetflix: 'Netflix',
  watchWeb: '全网搜索',
  detailLinks: '外部资料',
  linkAniList: 'AniList',
  linkBangumi: 'Bangumi',
  linkBilibili: 'Bilibili',
  linkDouban: '豆瓣',
  markWatched: '标记已看',
  unmarkWatched: '取消已看',
  close: '关闭',
  securityTitle: '外链安全提醒',
  securityIntro: '你即将离开 ANIMEBLOCK，前往第三方网站。',
  securityBody:
    '本站只做个人补番记录与推荐，不存储任何视频文件。目标站点的内容、广告与安全性由该站点负责，请注意保护隐私。',
  securityTarget: '目标站点',
  cancel: '取消',
  continue: '继续前往',
  settingsTitle: '设置',
  settingsKicker: 'SETTINGS / LOCAL DATA',
  settingsExport: '导出进度',
  settingsExportHint: '下载一个 JSON 文件，包含所有已看作品的 AniList ID。',
  settingsImport: '导入进度',
  settingsImportHint: '从之前导出的 JSON 文件合并记录；不会删除现有标记。',
  settingsReset: '清空进度',
  settingsResetHint: '删除本机保存的所有已看标记，无法撤销。',
  settingsResetConfirm: '再次点击确认清空',
  settingsSources: '数据来源',
  settingsVersion: 'v2.0 · ANIMEBLOCK',
  exported: '进度已导出。',
  imported: (count) => `已导入 ${count} 条记录。`,
  importError: '文件格式不正确，未导入任何记录。',
  resetDone: '进度已清空。',
  noResults: '没有匹配的作品',
  noResultsHint: '换一个关键词，或清除筛选条件。',
  clearFilters: '清除筛选',
  noUnwatched: '所有作品都已标记。',
  footerNote: '仅作个人补番记录，不存储任何视频；封面与资料版权归原作者及来源站所有。',
  footerData: 'DATA · ANILIST / BANGUMI-DATA / BILIBILI',
  updated: '更新于',
  progressLabel: '补番进度',
  allTitles: '全部作品',
  filtered: 'FILTERED',
  openDetails: '查看详情',
  expandYear: (count) => `展开全部 ${count} 部`,
  collapseYear: '收起',
};

const en: Messages = {
  brandSub: 'personal anime archive / 2006—2026',
  searchPlaceholder: 'Search title or tag',
  searchHint: 'Press / to focus',
  searchClear: 'Clear search',
  filterUnwatched: 'Unwatched only',
  random: 'Random pick',
  radar: 'Radar',
  settings: 'Settings',
  language: 'Language',
  marked: 'marked',
  titles: 'titles',
  yearsUnit: 'years',
  heroKicker: 'TITLES MARKED',
  heroMeta: (first, last, years, total) =>
    `${first} — ${last} · ${years} years · ${total.toLocaleString('en-US')} titles`,
  archiveMap: 'ARCHIVE MAP',
  archiveMapHint: 'Hover to inspect · click to jump to a year',
  legendWatched: 'watched',
  legendUnwatched: 'unwatched',
  legendSealed: 'sealed',
  tasteKicker: 'TASTE CLOUD / PERSONAL MIX',
  tasteTitle: 'Taste Cloud',
  tasteBasedOn: (count) => `based on ${count} watched`,
  tasteHint: 'Click a tag to filter; click again to clear',
  tasteEmpty: 'Mark a few titles and your taste cloud will grow here.',
  tasteWatchedCount: (count) => `${count} watched`,
  tasteClear: 'Clear tag filter',
  tasteToggle: 'Expand or collapse the taste cloud',
  tasteLegendHeal: 'healing / daily',
  tasteLegendDark: 'dark / heavy',
  tasteLegendAction: 'action / hype',
  tasteLegendWorld: 'fantasy / world',
  tasteLegendCharacter: 'character / drama',
  tasteLegendCraft: 'craft / style',
  radarTitle: 'Recommendation Radar',
  radarKicker: 'EXPLAINABLE PICKS',
  radarEmpty: 'Mark a few titles and the radar wakes up.',
  radarEmptyHint: 'At least 3 watched titles are needed to build a taste profile.',
  radarViewAll: 'View all picks',
  radarReason: (tags, rating) => `Close to your ${tags} taste, with an AniList score of ${rating}.`,
  radarScore: 'match',
  radarBasedOn: (count) => `Based on ${count} watched titles`,
  radarBecause: (title, tags, rating) =>
    `Because you liked ${title} and its ${tags} taste; AniList score ${rating}.`,
  radarRefresh: 'Refresh',
  radarNeedMore: (count) => `Mark ${count} more title(s) to wake the radar.`,
  archiveTitle: 'THE ARCHIVE',
  archiveKicker: 'all years / 50 titles per year',
  sortBy: 'Sort',
  sortRating: 'Rating',
  sortDate: 'Release',
  sortTitle: 'A–Z',
  yearOngoing: 'in progress',
  yearComplete: 'complete',
  yearCount: (watched, total) =>
    `${String(watched).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
  sealed: 'SEALED',
  sealedNote:
    'Manually excluded and placed at the end of each year; not part of progress, sorting, ratings or recommendations.',
  sealedCount: (count) => `${count} sealed`,
  detailArchive: 'Title Archive',
  detailEpisodes: (count) => `${count} eps`,
  detailStatus: 'Status',
  detailScore: 'Score',
  detailVotes: (value) => `${value} votes`,
  detailTags: 'Taste Tags',
  detailSummary: 'Synopsis',
  summaryFromDouban: 'Douban',
  summaryFromBilibili: 'Bilibili',
  summaryFromLegacy: 'Local archive',
  summaryFromAniList: 'AniList',
  summaryNone: 'No synopsis available.',
  summaryEnglishNote: 'No Chinese synopsis yet; showing the AniList English synopsis.',
  machineTranslation: 'MT',
  summaryFallback: (language) => `No synopsis in this language yet; showing the ${language} version.`,
  watchTitle: 'Where to watch',
  watchNote: 'Search links to official platforms. Some titles require a subscription or rental; no video is hosted here.',
  watchFreeTitle: 'Third-party sites',
  watchFreeNote:
    'Third-party sites, not officially licensed. They may contain ads or copyright risk; use your own judgement. No video is hosted here.',
  watchOfficialFreeTitle: 'Official free (region-locked)',
  watchOfficialFreeNote: 'Official free / ad-supported channels; availability varies by region.',
  watchPaidTitle: 'Official platforms',
  watchAgedm: 'AGE Anime',
  watchOmofuna: 'OmoFun',
  searchFallback: 'No result? Try another query',
  searchFull: 'full title',
  searchJapanese: 'Japanese title',
  searchBing: 'Bing site search',
  watchYoutube: 'YouTube official',
  watchMuseAsia: 'Muse Asia',
  watchAniOne: 'Ani-One Asia',
  watchCrunchyroll: 'Crunchyroll Free',
  watchTubi: 'Tubi Free',
  watchBilibili: 'Bilibili',
  watchIqiyi: 'iQIYI',
  watchYouku: 'Youku',
  watchTencent: 'Tencent Video',
  watchNetflix: 'Netflix',
  watchWeb: 'Web search',
  detailLinks: 'External sources',
  linkAniList: 'AniList',
  linkBangumi: 'Bangumi',
  linkBilibili: 'Bilibili',
  linkDouban: 'Douban',
  markWatched: 'Mark as watched',
  unmarkWatched: 'Remove mark',
  close: 'Close',
  securityTitle: 'External link notice',
  securityIntro: 'You are leaving ANIMEBLOCK for a third-party website.',
  securityBody:
    'ANIMEBLOCK is a personal watch tracker. It does not host video files. The destination site is responsible for its own content, ads and safety.',
  securityTarget: 'Destination',
  cancel: 'Cancel',
  continue: 'Continue',
  settingsTitle: 'Settings',
  settingsKicker: 'SETTINGS / LOCAL DATA',
  settingsExport: 'Export progress',
  settingsExportHint: 'Download a JSON file with every watched AniList id.',
  settingsImport: 'Import progress',
  settingsImportHint: 'Merge records from a previous export. Existing marks are kept.',
  settingsReset: 'Clear progress',
  settingsResetHint: 'Remove every watched mark stored in this browser. This cannot be undone.',
  settingsResetConfirm: 'Click again to confirm',
  settingsSources: 'Data sources',
  settingsVersion: 'v2.0 · ANIMEBLOCK',
  exported: 'Progress exported.',
  imported: (count) => `Imported ${count} records.`,
  importError: 'That file is not a valid export. Nothing was imported.',
  resetDone: 'Progress cleared.',
  noResults: 'No matching titles',
  noResultsHint: 'Try another keyword, or clear the filters.',
  clearFilters: 'Clear filters',
  noUnwatched: 'Every title is marked.',
  footerNote: 'A personal watch log. No video is hosted here; covers and metadata belong to their sources.',
  footerData: 'DATA · ANILIST / BANGUMI-DATA / BILIBILI',
  updated: 'updated',
  progressLabel: 'Progress',
  allTitles: 'All titles',
  filtered: 'FILTERED',
  openDetails: 'Open details',
  expandYear: (count) => `Show all ${count}`,
  collapseYear: 'Collapse',
};

const ja: Messages = {
  brandSub: '個人アニメ記録 / 2006—2026',
  searchPlaceholder: 'タイトル・タグを検索',
  searchHint: '/ でフォーカス',
  searchClear: '検索をクリア',
  filterUnwatched: '未視聴のみ',
  random: 'ランダム',
  radar: '推薦レーダー',
  settings: '設定',
  language: '表示言語',
  marked: '記録済み',
  titles: '作品',
  yearsUnit: '年',
  heroKicker: 'TITLES MARKED',
  heroMeta: (first, last, years, total) =>
    `${first} — ${last} · ${years} 年 · ${total.toLocaleString('en-US')} 作品`,
  archiveMap: 'ARCHIVE MAP',
  archiveMapHint: 'カーソルで作品を確認 · クリックで年へ移動',
  legendWatched: '視聴済み',
  legendUnwatched: '未視聴',
  legendSealed: '封印',
  tasteKicker: 'TASTE CLOUD / 趣味の成分',
  tasteTitle: '趣味のワードクラウド',
  tasteBasedOn: (count) => `${count} 作品の視聴から`,
  tasteHint: 'タグをクリックで絞り込み、もう一度で解除',
  tasteEmpty: '作品をいくつか記録すると、ここに趣味のワードクラウドが育ちます。',
  tasteWatchedCount: (count) => `${count} 作品視聴`,
  tasteClear: 'タグ絞り込みを解除',
  tasteToggle: 'ワードクラウドを開閉',
  tasteLegendHeal: '癒し / 日常',
  tasteLegendDark: '鬱 / 重厚',
  tasteLegendAction: '燃え / アクション',
  tasteLegendWorld: '幻想 / 世界',
  tasteLegendCharacter: '人物 / 関係',
  tasteLegendCraft: '制作 / スタイル',
  radarTitle: '推薦レーダー',
  radarKicker: 'EXPLAINABLE PICKS',
  radarEmpty: '数作品を記録すると、レーダーが起動します。',
  radarEmptyHint: '嗜好プロフィールの計算には 3 作品以上の記録が必要です。',
  radarViewAll: 'すべての推薦を見る',
  radarReason: (tags, rating) => `記録済み作品の ${tags} 傾向に近く、AniList 評価は ${rating} です。`,
  radarScore: '適合度',
  radarBasedOn: (count) => `${count} 作品の記録から算出`,
  radarBecause: (title, tags, rating) =>
    `「${title}」の ${tags} の好みに近いため。AniList 評価 ${rating}。`,
  radarRefresh: '別の候補',
  radarNeedMore: (count) => `あと ${count} 作品を記録すると推薦が始まります。`,
  archiveTitle: 'THE ARCHIVE',
  archiveKicker: '全年度 / 毎年50作品',
  sortBy: '並び順',
  sortRating: '評価',
  sortDate: '放送日',
  sortTitle: '五十音',
  yearOngoing: '放送中',
  yearComplete: '完結',
  yearCount: (watched, total) =>
    `${String(watched).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
  sealed: 'SEALED',
  sealedNote: '手動で除外された作品です。各年の末尾に表示され、進捗・並び替え・評価・推薦には含まれません。',
  sealedCount: (count) => `${count} 封印`,
  detailArchive: '作品アーカイブ',
  detailEpisodes: (count) => `${count} 話`,
  detailStatus: '状態',
  detailScore: '評価',
  detailVotes: (value) => `${value} 人の評価`,
  detailTags: '嗜好タグ',
  detailSummary: 'あらすじ',
  summaryFromDouban: '豆瓣',
  summaryFromBilibili: 'Bilibili',
  summaryFromLegacy: 'ローカル記録',
  summaryFromAniList: 'AniList',
  summaryNone: 'あらすじは未登録です。',
  summaryEnglishNote: '中国語のあらすじが未登録のため、AniList の英語あらすじを表示します。',
  machineTranslation: '機械翻訳',
  summaryFallback: (language) => `この言語のあらすじが未登録のため、${language} 版を表示しています。`,
  watchTitle: '配信を探す',
  watchNote: '公式配信の検索リンクです。一部は会員・有料です。当サイトは動画を保存していません。',
  watchFreeTitle: '外部サイト',
  watchFreeNote:
    '外部の第三者サイトです。公式許諾ではなく、広告や著作権上のリスクがあります。自己判断でご利用ください。当サイトは動画を保存していません。',
  watchOfficialFreeTitle: '公式無料（地域制限あり）',
  watchOfficialFreeNote: '公式の無料 / 広告付き配信。地域によって利用できない場合があります。',
  watchPaidTitle: '公式配信',
  watchAgedm: 'AGE アニメ',
  watchOmofuna: 'OmoFun',
  searchFallback: '見つからない場合は別の語で',
  searchFull: '正式名',
  searchJapanese: '日本語名',
  searchBing: 'Bing サイト内検索',
  watchYoutube: 'YouTube 公式',
  watchMuseAsia: 'Muse Asia',
  watchAniOne: 'Ani-One Asia',
  watchCrunchyroll: 'Crunchyroll 無料',
  watchTubi: 'Tubi 無料',
  watchBilibili: 'Bilibili',
  watchIqiyi: 'iQIYI',
  watchYouku: 'Youku',
  watchTencent: 'Tencent Video',
  watchNetflix: 'Netflix',
  watchWeb: 'Web検索',
  detailLinks: '外部資料',
  linkAniList: 'AniList',
  linkBangumi: 'Bangumi',
  linkBilibili: 'Bilibili',
  linkDouban: '豆瓣',
  markWatched: '視聴済みにする',
  unmarkWatched: '記録を解除',
  close: '閉じる',
  securityTitle: '外部リンクの確認',
  securityIntro: 'ANIMEBLOCK を離れて、外部サイトへ移動します。',
  securityBody:
    '当サイトは個人の視聴記録と推薦のためのツールであり、動画ファイルは保存していません。移動先サイトの内容・広告・安全性は移動先の責任です。',
  securityTarget: '移動先',
  cancel: 'キャンセル',
  continue: '続行',
  settingsTitle: '設定',
  settingsKicker: 'SETTINGS / LOCAL DATA',
  settingsExport: '進捗を書き出す',
  settingsExportHint: '視聴済み AniList ID を含む JSON ファイルをダウンロードします。',
  settingsImport: '進捗を読み込む',
  settingsImportHint: '以前の書き出しファイルから記録を統合します。既存の記録は残ります。',
  settingsReset: '進捗を消去',
  settingsResetHint: 'このブラウザに保存された視聴記録をすべて削除します。元に戻せません。',
  settingsResetConfirm: 'もう一度クリックで確定',
  settingsSources: 'データソース',
  settingsVersion: 'v2.0 · ANIMEBLOCK',
  exported: '進捗を書き出しました。',
  imported: (count) => `${count} 件の記録を読み込みました。`,
  importError: '形式が正しくないため、何も読み込まれていません。',
  resetDone: '進捗を消去しました。',
  noResults: '該当する作品がありません',
  noResultsHint: '別のキーワードを試すか、絞り込みを解除してください。',
  clearFilters: '絞り込みを解除',
  noUnwatched: 'すべての作品が記録済みです。',
  footerNote: '個人の視聴記録です。動画は保存していません。カバーと資料の権利は各権利者に帰属します。',
  footerData: 'DATA · ANILIST / BANGUMI-DATA / BILIBILI',
  updated: '更新',
  progressLabel: '進捗',
  allTitles: 'すべての作品',
  filtered: 'FILTERED',
  openDetails: '詳細を見る',
  expandYear: (count) => `全${count}作品を表示`,
  collapseYear: '閉じる',
};

export const messages: Record<Language, Messages> = { zh, en, ja };

const tagLabels: Record<string, Partial<Record<Language, string>>> = {
  Action: { zh: '动作', ja: 'アクション' },
  Adventure: { zh: '冒险', ja: '冒険' },
  Comedy: { zh: '喜剧', ja: 'コメディ' },
  Drama: { zh: '剧情', ja: 'ドラマ' },
  Fantasy: { zh: '奇幻', ja: 'ファンタジー' },
  Mystery: { zh: '悬疑', ja: 'ミステリー' },
  Psychological: { zh: '心理', ja: '心理' },
  Romance: { zh: '恋爱', ja: '恋愛' },
  'Sci-Fi': { zh: '科幻', ja: 'SF' },
  'Slice of Life': { zh: '日常', ja: '日常' },
  Supernatural: { zh: '超自然', ja: '超自然' },
  Thriller: { zh: '惊悚', ja: 'スリラー' },
  Sports: { zh: '运动', ja: 'スポーツ' },
  Music: { zh: '音乐', ja: '音楽' },
  Mecha: { zh: '机甲', ja: 'メカ' },
  Horror: { zh: '恐怖', ja: 'ホラー' },
  Crime: { zh: '犯罪', ja: '犯罪' },
  School: { zh: '校园', ja: '学園' },
  'Coming of Age': { zh: '成长', ja: '成長' },
  'Female Protagonist': { zh: '女性主角', ja: '女性主人公' },
  'Male Protagonist': { zh: '男性主角', ja: '男性主人公' },
  'Ensemble Cast': { zh: '群像', ja: '群像劇' },
  'Found Family': { zh: '羁绊家庭', ja: '疑似家族' },
  'Anti-Hero': { zh: '反英雄', ja: 'アンチヒーロー' },
  Detective: { zh: '侦探', ja: '探偵' },
  War: { zh: '战争', ja: '戦争' },
  Military: { zh: '军事', ja: 'ミリタリー' },
  Shoujo: { zh: '少女向', ja: '少女' },
  Shounen: { zh: '少年向', ja: '少年' },
  Seinen: { zh: '青年向', ja: '青年' },
  Isekai: { zh: '异世界', ja: '異世界' },
  Magic: { zh: '魔法', ja: '魔法' },
  Parody: { zh: '恶搞', ja: 'パロディ' },
  Samurai: { zh: '武士', ja: '侍' },
  Guns: { zh: '枪战', ja: '銃撃' },
  'Super Power': { zh: '超能力', ja: '超能力' },
  Superhero: { zh: '超级英雄', ja: 'スーパーヒーロー' },
  'Primarily Teen Cast': { zh: '青少年群像', ja: '十代中心' },
  'Primarily Adult Cast': { zh: '成人群像', ja: '大人中心' },
  Tsundere: { zh: '傲娇', ja: 'ツンデレ' },
  'Love Triangle': { zh: '三角恋', ja: '三角関係' },
  'Time Manipulation': { zh: '时间操纵', ja: '時間操作' },
  Revenge: { zh: '复仇', ja: '復讐' },
  Gore: { zh: '血腥', ja: 'グロ' },
  Demons: { zh: '恶魔', ja: '悪魔' },
  Gods: { zh: '神明', ja: '神' },
  'Martial Arts': { zh: '武术', ja: '武術' },
  Ninja: { zh: '忍者', ja: '忍者' },
  Pirates: { zh: '海盗', ja: '海賊' },
  Space: { zh: '太空', ja: '宇宙' },
  'Virtual World': { zh: '虚拟世界', ja: '仮想世界' },
  'Video Games': { zh: '电子游戏', ja: 'ゲーム' },
  'Otaku Culture': { zh: '宅文化', ja: 'オタク文化' },
  Idol: { zh: '偶像', ja: 'アイドル' },
  Band: { zh: '乐队', ja: 'バンド' },
  'School Club': { zh: '社团', ja: '部活' },
  Work: { zh: '职场', ja: '仕事' },
  Family: { zh: '家庭', ja: '家族' },
  Parenthood: { zh: '育儿', ja: '子育て' },
  Friendship: { zh: '友情', ja: '友情' },
  Iyashikei: { zh: '治愈', ja: '癒し' },
  'Surreal Comedy': { zh: '荒诞喜剧', ja: 'シュールコメディ' },
  'Gag Humor': { zh: '搞笑', ja: 'ギャグ' },
  Satire: { zh: '讽刺', ja: '風刺' },
  Historical: { zh: '历史', ja: '歴史' },
  'Post-Apocalyptic': { zh: '末日', ja: '終末' },
  Dystopian: { zh: '反乌托邦', ja: 'ディストピア' },
  Cyberpunk: { zh: '赛博朋克', ja: 'サイバーパンク' },
  Steampunk: { zh: '蒸汽朋克', ja: 'スチームパンク' },
  'Urban Fantasy': { zh: '都市奇幻', ja: '都市ファンタジー' },
  Reincarnation: { zh: '转生', ja: '転生' },
  Villainess: { zh: '恶役千金', ja: '悪役令嬢' },
  Josei: { zh: '女性向', ja: '女性向け' },
  Kids: { zh: '儿童', ja: 'キッズ' },
  Travel: { zh: '旅行', ja: '旅' },
  Elf: { zh: '精灵', ja: 'エルフ' },
  Wilderness: { zh: '荒野', ja: '荒野' },
  Ecchi: { zh: '擦边', ja: 'エッチ' },
  Harem: { zh: '后宫', ja: 'ハーレム' },
  'Reverse Harem': { zh: '逆后宫', ja: '逆ハーレム' },
  Polyamorous: { zh: '多角恋', ja: 'ポリアモリー' },
  Polyamorphous: { zh: '多形态', ja: '多形態' },
  Mature: { zh: '成人向', ja: '成人向け' },
  'Primarily Female Cast': { zh: '女性群像', ja: '女性中心' },
  'Primarily Male Cast': { zh: '男性群像', ja: '男性中心' },
  'LGBTQ+ Themes': { zh: 'LGBTQ+', ja: 'LGBTQ+' },
  'Mahou Shoujo': { zh: '魔法少女', ja: '魔法少女' },
  'Cute Girls Doing Cute Things': { zh: '空气系', ja: '空気系' },
  'Time Travel': { zh: '时间旅行', ja: 'タイムトラベル' },
  Mythology: { zh: '神话', ja: '神話' },
  Battle: { zh: '战斗', ja: 'バトル' },
  Dungeon: { zh: '迷宫', ja: 'ダンジョン' },
  CGI: { zh: 'CGI', ja: 'CGI' },
  'Full CGI': { zh: '全 CGI', ja: 'フルCG' },
  Meta: { zh: '元叙事', ja: 'メタ' },
  Episodic: { zh: '单元剧', ja: '一話完結' },
  Anthology: { zh: '单元集', ja: 'アンソロジー' },
  Experimental: { zh: '实验', ja: '実験的' },
  'Avant Garde': { zh: '前卫', ja: 'アバンギャルド' },
  'Real Robot': { zh: '真实系机甲', ja: 'リアルロボット' },
  'Super Robot': { zh: '超级系机甲', ja: 'スーパーロボット' },
  Assassins: { zh: '刺客', ja: '暗殺者' },
  Espionage: { zh: '谍战', ja: 'スパイ' },
  Police: { zh: '警察', ja: '警察' },
  Delinquents: { zh: '不良', ja: '不良' },
  Nakama: { zh: '伙伴', ja: '仲間' },
  Vampire: { zh: '吸血鬼', ja: '吸血鬼' },
  Robots: { zh: '机器人', ja: 'ロボット' },
  'Artificial Intelligence': { zh: '人工智能', ja: '人工知能' },
  Survival: { zh: '生存', ja: 'サバイバル' },
  Grief: { zh: '失落', ja: '喪失' },
  Tragedy: { zh: '悲剧', ja: '悲劇' },
  Gyaru: { zh: '辣妹', ja: 'ギャル' },
  Kuudere: { zh: '三无', ja: 'クーデレ' },
  Yandere: { zh: '病娇', ja: 'ヤンデレ' },
  Adaptation: { zh: '改编', ja: '原作あり' },
  Manga: { zh: '漫画原作', ja: '漫画原作' },
  'Light Novel': { zh: '轻小说原作', ja: 'ラノベ原作' },
  'Visual Novel': { zh: '视觉小说原作', ja: 'ビジュアルノベル原作' },
  'Original Work': { zh: '原创', ja: 'オリジナル' },
  '4-Koma': { zh: '四格漫画', ja: '4コマ' },
};

export function getAnimeTitle(anime: Anime, lang: Language): string {
  const title = lang === 'zh' ? anime.zh : lang === 'en' ? anime.en : anime.ja;
  return (title || anime.zh || anime.en || anime.ja || anime.romaji || 'Untitled').trim();
}

export function getTagLabel(tag: string, lang: Language): string {
  if (lang === 'en') return tag;
  return tagLabels[tag]?.[lang] || tag;
}

export function joinLocalizedTags(tags: string[], lang: Language): string {
  return tags.map((tag) => getTagLabel(tag, lang)).join(lang === 'en' ? ' / ' : '、');
}

export function getSummarySourceLabel(source: SummarySource, lang: Language): string {
  const t = messages[lang];
  switch (source) {
    case 'douban':
      return t.summaryFromDouban;
    case 'bilibili':
      return t.summaryFromBilibili;
    case 'legacy':
      return t.summaryFromLegacy;
    case 'anilist':
      return t.summaryFromAniList;
    default:
      return t.summaryNone;
  }
}
