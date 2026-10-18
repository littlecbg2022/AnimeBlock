#!/usr/bin/env node
/**
 * Build the ANIMEBLOCK catalog.
 *
 * Sources:
 *  - AniList GraphQL: canonical id, titles, cover, tags, global score, popularity.
 *  - bangumi-data: Chinese titles + Bangumi / Bilibili / AniList cross-site ids.
 *  - Bilibili: Chinese synopsis + Chinese audience score.
 *  - Douban: Chinese synopsis + Chinese audience score (fallback / enrichment).
 *
 * Usage:
 *   node scripts/build-catalog.mjs
 *   node scripts/build-catalog.mjs --years=2007,2026 --limit=5 --skip-douban
 *   node scripts/build-catalog.mjs --refresh
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const OUT_FILE = path.join(ROOT, 'data', 'catalog.json');
const BLOCKLIST_FILE = path.join(ROOT, 'data', 'blocklist.json');
const BANGUMI_DATA_URL = 'https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json';
const ANILIST_URL = 'https://graphql.anilist.co';

const START_YEAR = 2006;
const END_YEAR = 2026;
const PER_YEAR = 50;
const BANNED_KEYWORDS = [
  /my hero academia/i,
  /boku no hero academia/i,
  /我的英雄学院/,
  /僕のヒーローアカデミア/,
];

const args = parseArgs(process.argv.slice(2));
const years = args.years?.length ? args.years : range(START_YEAR, END_YEAR);
const perYear = args.limit ?? PER_YEAR;
const skipDouban = Boolean(args['skip-douban']);
const skipBilibili = Boolean(args['skip-bilibili']);
const refresh = Boolean(args.refresh);

let blocklistIds = new Set();

async function loadBlocklist() {
  try {
    const data = JSON.parse(await fs.readFile(BLOCKLIST_FILE, 'utf8'));
    blocklistIds = new Set((data.ids || []).map(String));
    log(`[blocklist] ${blocklistIds.size} ids`);
  } catch {
    blocklistIds = new Set();
    log('[blocklist] none');
  }
}

const UA = 'AnimeBlock/2.0 (+https://github.com/LittleCabbage2022/AnimeBlock)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (...a) => console.log(...a);

async function mapLimit(items, limit, worker) {
  let cursor = 0;
  const size = Math.min(Math.max(1, limit), items.length);
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index], index);
      }
    }),
  );
}

await fs.mkdir(CACHE_DIR, { recursive: true });
await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

/* ------------------------------------------------------------------ */
/* cache + http                                                        */
/* ------------------------------------------------------------------ */

async function readCache(name) {
  if (refresh) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(CACHE_DIR, name), 'utf8'));
  } catch {
    return null;
  }
}

async function writeCache(name, data) {
  await fs.writeFile(path.join(CACHE_DIR, name), JSON.stringify(data));
}

async function fetchJson(url, options = {}, { retries = 4, timeout = 30000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeout),
        headers: {
          'user-agent': UA,
          accept: 'application/json',
          ...(options.headers || {}),
        },
      });
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(800 * attempt);
    }
  }
  throw lastError;
}

/* ------------------------------------------------------------------ */
/* legacy catalog (best effort)                                        */
/* ------------------------------------------------------------------ */

async function loadLegacy() {
  const map = new Map();

  try {
    const legacyPath = path.join(ROOT, 'data', 'animeList_ultimate.ts');
    const mod = await import(pathToFileURL(legacyPath).href);
    for (const group of mod.animeData || []) {
      for (const anime of group.list || []) map.set(String(anime.id), anime);
    }
    log(`[legacy] loaded ${map.size} entries from animeList_ultimate.ts`);
  } catch {
    log('[legacy] no legacy TS file');
  }

  try {
    const catalog = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'catalog.json'), 'utf8'));
    let merged = 0;
    for (const group of catalog.years || []) {
      for (const anime of group.items || []) {
        const previous = map.get(String(anime.id)) || {};
        map.set(String(anime.id), { ...previous, ...anime });
        merged += 1;
      }
    }
    log(`[legacy] merged ${merged} entries from previous catalog.json`);
  } catch {
    log('[legacy] no previous catalog.json');
  }

  return map;
}

/* ------------------------------------------------------------------ */
/* bangumi-data                                                        */
/* ------------------------------------------------------------------ */

function normalizeTitle(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/第[一二三四五六七八九十0-9]+季/g, '')
    .replace(/season\s*\d+/gi, '')
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ''));
}

function isChinese(value) {
  const text = String(value || '');
  if (!hasCjk(text)) return false;
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  return cjk / Math.max(text.length, 1) > 0.2;
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsefulSummary(value) {
  const text = cleanText(value);
  return text.length >= 30;
}

async function loadBangumiData() {
  const cached = await readCache('bangumi-data.json');
  const data = cached || (await fetchJson(BANGUMI_DATA_URL, {}, { timeout: 60000 }));
  if (!cached) await writeCache('bangumi-data.json', data);
  log(`[bangumi-data] ${data.items?.length ?? 0} items`);

  const byAniList = new Map();
  const byTitle = new Map();

  for (const item of data.items || []) {
    for (const site of item.sites || []) {
      if (site.site === 'aniList') byAniList.set(String(site.id), item);
    }
    const names = [
      item.title,
      ...(item.titleTranslate?.['zh-Hans'] || []),
      ...(item.titleTranslate?.['zh-Hant'] || []),
      ...(item.titleTranslate?.en || []),
    ];
    for (const name of names) {
      const key = normalizeTitle(name);
      if (!key) continue;
      if (!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key).push(item);
    }
  }
  return { byAniList, byTitle };
}

function findBangumiItem(anime, bangumi) {
  const direct = bangumi.byAniList.get(String(anime.id));
  if (direct) return direct;

  const year = anime.seasonYear || anime.startDate?.year;
  for (const name of [anime.title?.native, anime.title?.romaji, anime.title?.english]) {
    const key = normalizeTitle(name);
    if (!key) continue;
    const candidates = bangumi.byTitle.get(key) || [];
    const scored = candidates
      .map((item) => {
        const itemYear = Number(String(item.begin || '').slice(0, 4));
        let score = 0;
        if (itemYear === year) score += 10;
        else if (Math.abs(itemYear - year) === 1) score += 3;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score);
    if (scored[0]?.score > 0) return scored[0].item;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* anilist                                                             */
/* ------------------------------------------------------------------ */

const ANILIST_QUERY = `
query ($year: Int, $perPage: Int, $page: Int) {
  Page(page: $page, perPage: $perPage) {
    media(
      seasonYear: $year
      type: ANIME
      sort: POPULARITY_DESC
      isAdult: false
      format_in: [TV, TV_SHORT]
    ) {
      id
      title { romaji english native userPreferred }
      coverImage { extraLarge color }
      bannerImage
      genres
      tags { name rank isMediaSpoiler }
      description(asHtml: false)
      averageScore
      meanScore
      popularity
      favourites
      episodes
      duration
      format
      status
      season
      seasonYear
      startDate { year month day }
      siteUrl
    }
  }
}`;

async function fetchAniListPage(year, page) {
  const cacheName = `anilist-${year}-${perYear}-p${page}.json`;
  const cached = await readCache(cacheName);
  if (cached) return cached;

  const data = await fetchJson(ANILIST_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: ANILIST_QUERY,
      variables: { year, perPage, page },
    }),
  });
  if (data.errors?.length) throw new Error(`AniList ${year} p${page}: ${data.errors[0].message}`);
  const media = data.data?.Page?.media || [];
  await writeCache(cacheName, media);
  await sleep(1200);
  return media;
}

async function fetchAniListYear(year) {
  const collected = [];
  for (let page = 1; page <= 3; page += 1) {
    const media = await fetchAniListPage(year, page);
    collected.push(...media);
    const usable = collected.filter((entry) => !blocklistIds.has(String(entry.id)));
    if (usable.length >= perYear || media.length < perYear) break;
  }
  return collected
    .filter((entry) => !blocklistIds.has(String(entry.id)))
    .slice(0, perYear);
}

/* ------------------------------------------------------------------ */
/* bilibili                                                            */
/* ------------------------------------------------------------------ */

async function fetchBilibili(seasonId) {
  const cacheName = `bilibili-${seasonId}.json`;
  const cached = await readCache(cacheName);
  if (cached) return cached;

  try {
    const data = await fetchJson(
      `https://api.bilibili.com/pgc/view/web/season?season_id=${encodeURIComponent(seasonId)}`,
      { headers: { referer: 'https://www.bilibili.com/' } },
      { retries: 3 },
    );
    if (data.code !== 0 || !data.result) throw new Error(`code ${data.code}`);
    await writeCache(cacheName, data);
    await sleep(300);
    return data;
  } catch (error) {
    await writeCache(cacheName, { code: -1, error: error.message });
    await sleep(500);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* douban                                                              */
/* ------------------------------------------------------------------ */

function hash(value) {
  let h = 0;
  for (const char of String(value)) h = (Math.imul(31, h) + char.codePointAt(0)) | 0;
  return Math.abs(h).toString(36);
}

async function doubanSuggest(query) {
  const cacheName = `douban-suggest-${hash(query)}.json`;
  const cached = await readCache(cacheName);
  if (Array.isArray(cached) && cached.length > 0) return cached;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = await fetchJson(
        `https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}`,
        { headers: { referer: 'https://movie.douban.com/' } },
        { retries: 2 },
      );
      if (Array.isArray(data) && data.length > 0) {
        await writeCache(cacheName, data);
        await sleep(300);
        return data;
      }
      await sleep(500);
    } catch {
      await sleep(500);
    }
  }
  return [];
}

async function doubanDetail(id) {
  const cacheName = `douban-${id}.json`;
  const cached = await readCache(cacheName);
  if (cached && !cached.error) return cached;

  for (const kind of ['movie', 'tv']) {
    try {
      const data = await fetchJson(
        `https://m.douban.com/rexxar/api/v2/${kind}/${id}`,
        { headers: { referer: 'https://m.douban.com/' } },
        { retries: 2 },
      );
      if (data?.id) {
        await writeCache(cacheName, data);
        await sleep(300);
        return data;
      }
    } catch {
      // try the other type
    }
  }
  await writeCache(cacheName, { error: 'not-found' });
  await sleep(300);
  return null;
}

function scoreDoubanCandidate(candidate, anime) {
  const year = anime.year;
  const candidateYear = Number(candidate.year);
  const titles = [anime.zh, anime.ja, anime.romaji, anime.en].filter(Boolean).map(normalizeTitle);
  const names = [candidate.title, candidate.sub_title].filter(Boolean).map(normalizeTitle);

  let best = 0;
  for (const a of titles) {
    for (const b of names) {
      if (!a || !b) continue;
      if (a === b) best = Math.max(best, 100);
      else if (a.includes(b) || b.includes(a)) best = Math.max(best, 55);
    }
  }
  if (candidateYear === year) best += 40;
  else if (Math.abs(candidateYear - year) === 1) best += 8;
  if (candidate.episode) best += 4;
  return best;
}

async function findDouban(anime) {
  if (anime.doubanId) {
    const data = await doubanDetail(anime.doubanId);
    return data ? { data, id: anime.doubanId } : null;
  }

  const queries = [
    ...new Set([anime.zh, anime.ja, anime.romaji, anime.en].filter(Boolean)),
  ].slice(0, 2);

  for (const query of queries) {
    const candidates = await doubanSuggest(query);
    if (!candidates.length) continue;

    const ranked = candidates
      .map((candidate) => ({ candidate, score: scoreDoubanCandidate(candidate, anime) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score < 80) continue;

    const candidateYear = Number(best.candidate.year);
    if (candidateYear && Math.abs(candidateYear - anime.year) > 1) continue;

    const data = await doubanDetail(best.candidate.id);
    if (data) return { data, id: best.candidate.id };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* merge                                                               */
/* ------------------------------------------------------------------ */

function makeItem(media, year, legacy, bangumi) {
  const bd = findBangumiItem(media, bangumi);
  const sites = bd?.sites || [];
  const bilibiliSite = sites.find((site) => site.site === 'bilibili')?.id || null;
  const bangumiSite = sites.find((site) => site.site === 'bangumi')?.id || null;
  const bdZh = bd?.titleTranslate?.['zh-Hans']?.[0] || null;

  const legacyItem = legacy.get(String(media.id)) || {};
  const legacyZh =
    typeof legacyItem.zh === 'string' && isChinese(legacyItem.zh) ? legacyItem.zh.trim() : null;
  const zh =
    (typeof bdZh === 'string' && bdZh.trim()) ||
    legacyZh ||
    media.title?.native ||
    media.title?.romaji ||
    media.title?.english ||
    '未知作品';
  const en = media.title?.english || media.title?.romaji || legacyItem.en || zh;
  const ja = media.title?.native || legacyItem.ja || media.title?.romaji || zh;
  const romaji = media.title?.romaji || en;

  const tags = [
    ...new Set([
      ...(media.genres || []),
      ...(media.tags || [])
        .filter((tag) => tag.rank >= 60 && !tag.isMediaSpoiler)
        .sort((a, b) => b.rank - a.rank)
        .map((tag) => tag.name),
    ]),
  ].slice(0, 8);

  const legacySummary = cleanText(legacyItem.summary);
  const previousSource = legacyItem.summarySource;
  const previousSummaryUsable =
    ['bilibili', 'douban'].includes(previousSource) && isUsefulSummary(legacySummary);
  const anilistSummary = cleanText(media.description);

  let summary;
  let summarySource;
  if (previousSummaryUsable) {
    summary = legacySummary;
    summarySource = previousSource;
  } else if (isUsefulSummary(legacySummary) && isChinese(legacySummary)) {
    summary = legacySummary;
    summarySource = 'legacy';
  } else if (isUsefulSummary(anilistSummary)) {
    summary = anilistSummary;
    summarySource = 'anilist';
  } else {
    summary = '暂无简介。';
    summarySource = 'none';
  }
  const summaryLang =
    ['zh', 'en', 'ja'].includes(legacyItem.summaryLang)
      ? legacyItem.summaryLang
      : summary === '暂无简介。'
        ? 'none'
        : isChinese(summary)
          ? 'zh'
          : 'en';

  const legacyRating =
    legacyItem.ratings?.anilist ?? (typeof legacyItem.rating === 'number' ? legacyItem.rating : 0);
  const rating = media.averageScore ? Math.round(media.averageScore) / 10 : legacyRating || 0;

  const toId = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : undefined;
  };

  const isBanned =
    Boolean(legacyItem.isBanned) ||
    BANNED_KEYWORDS.some((pattern) =>
      [zh, en, ja, romaji, bd?.title, ...(bd?.titleTranslate?.['zh-Hans'] || [])]
        .filter(Boolean)
        .some((title) => pattern.test(title)),
    );

  return {
    id: String(media.id),
    anilistId: media.id,
    bangumiId: toId(bangumiSite) ?? toId(legacyItem.bangumiId),
    bilibiliId: toId(bilibiliSite) ?? toId(legacyItem.bilibiliId),
    doubanId: legacyItem.doubanId,
    year,
    startDate: media.startDate
      ? `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, '0')}-${String(media.startDate.day || 1).padStart(2, '0')}`
      : legacyItem.startDate || null,
    format: media.format || 'TV',
    episodes: media.episodes ?? null,
    status: media.status || 'FINISHED',
    season: media.season || null,
    zh,
    en,
    ja,
    romaji,
    cover: media.coverImage?.extraLarge || legacyItem.cover || '',
    color: media.coverImage?.color || null,
    banner: media.bannerImage || null,
    tags: tags.length ? tags : legacyItem.tags || [],
    genres: media.genres || [],
    summary,
    summarySource,
    summaryLang,
    summaries: legacyItem.summaries,
    summaryMachine: legacyItem.summaryMachine,
    summarySourceEn: legacyItem.summarySourceEn,
    titleMachineZh: legacyItem.titleMachineZh,
    ratings: {
      anilist: rating || undefined,
      douban: legacyItem.ratings?.douban,
      bilibili: legacyItem.ratings?.bilibili,
    },
    ratingCounts: legacyItem.ratingCounts,
    popularity: media.popularity || 0,
    favourites: media.favourites || 0,
    isBanned,
    siteUrl: media.siteUrl || `https://anilist.co/anime/${media.id}`,
  };
}

function applyBilibili(item, payload) {
  const result = payload?.result;
  if (!result) return;

  const score = result.rating?.score ?? result.media_score?.score;
  if (typeof score === 'number' && score > 0) {
    item.ratings.bilibili = score;
    item.ratingCounts = item.ratingCounts || {};
    item.ratingCounts.bilibili = result.rating?.count ?? result.media_score?.count ?? 0;
  }

  const evaluate = cleanText(result.evaluate);
  if (isUsefulSummary(evaluate) && isChinese(evaluate)) {
    // Bilibili synopsis wins over legacy TMDB text, but not over a Douban synopsis.
    if (item.summarySource !== 'douban') {
      item.summary = evaluate;
      item.summarySource = 'bilibili';
      item.summaryLang = 'zh';
    }
  }

  if (!hasCjk(item.zh) && hasCjk(result.title)) {
    item.zh = result.title.trim();
  }
}

function applyDouban(item, payload) {
  const data = payload?.data;
  if (!data) return;

  if (data.id) item.doubanId = String(data.id);
  const score = data.rating?.value;
  if (typeof score === 'number' && score > 0) {
    item.ratings.douban = score;
    item.ratingCounts = item.ratingCounts || {};
    item.ratingCounts.douban = data.rating?.count ?? 0;
  }

  const intro = cleanText(data.intro);
  if (isUsefulSummary(intro) && isChinese(intro)) {
    item.summary = intro;
    item.summarySource = 'douban';
    item.summaryLang = 'zh';
  }

  if (!hasCjk(item.zh) && hasCjk(data.title)) {
    item.zh = data.title.trim();
  }
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  log(`[build] years=${years.join(',')} perYear=${perYear}`);
  await loadBlocklist();
  const legacy = await loadLegacy();
  const bangumi = await loadBangumiData();

  const catalogYears = [];
  for (const year of years) {
    const media = await fetchAniListYear(year);
    if (!media.length) throw new Error(`AniList returned no media for ${year}`);
    if (media.length < perYear) log(`[warn] ${year}: only ${media.length}/${perYear} titles`);
    const items = media.map((entry) => makeItem(entry, year, legacy, bangumi));
    catalogYears.push({
      year,
      status: year === END_YEAR ? 'ongoing' : 'complete',
      items,
    });
    log(`[anilist] ${year}: ${items.length} titles`);
  }

  if (!skipBilibili) {
    const targets = catalogYears.flatMap((group) => group.items).filter((item) => item.bilibiliId);
    log(`[bilibili] enriching ${targets.length} titles`);
    let done = 0;
    for (const item of targets) {
      const payload = await fetchBilibili(item.bilibiliId);
      if (payload) applyBilibili(item, payload);
      done += 1;
      if (done % 10 === 0) log(`[bilibili] ${done}/${targets.length}`);
    }
  }

  if (!skipDouban) {
    const targets = catalogYears
      .flatMap((group) => group.items)
      .filter((item) => item.summaryLang !== 'zh');
    log(`[douban] attempting ${targets.length} missing Chinese synopses`);
    let done = 0;
    await mapLimit(targets, 3, async (item) => {
      const found = await findDouban(item);
      if (found) applyDouban(item, found);
      done += 1;
      if (done % 5 === 0) log(`[douban] ${done}/${targets.length}`);
    });
  }

  for (const group of catalogYears) {
    for (const item of group.items) {
      if (!item.summary || item.summary === '暂无简介。') {
        item.summary = '暂无简介。';
        item.summarySource = 'none';
        item.summaryLang = 'none';
      }
    }
    group.items.sort((a, b) => b.popularity - a.popularity);
  }

  catalogYears.sort((a, b) => b.year - a.year);

  const allItems = catalogYears.flatMap((group) => group.items);
  const banned = allItems.filter((item) => item.isBanned);
  const ids = new Set(allItems.map((item) => item.id));
  if (ids.size !== allItems.length) throw new Error('duplicate AniList ids in catalog');

  const coverage = {
    zhTitle: allItems.filter((item) => isChinese(item.zh)).length,
    zhSummary: allItems.filter((item) => item.summaryLang === 'zh').length,
    anilistRating: allItems.filter((item) => item.ratings.anilist).length,
    doubanRating: allItems.filter((item) => item.ratings.douban).length,
    bilibiliRating: allItems.filter((item) => item.ratings.bilibili).length,
    bangumiId: allItems.filter((item) => item.bangumiId).length,
    bilibiliId: allItems.filter((item) => item.bilibiliId).length,
  };

  const catalog = {
    meta: {
      generatedAt: new Date().toISOString(),
      years: catalogYears.map((group) => group.year),
      total: allItems.length,
      playable: allItems.length - banned.length,
      banned: banned.length,
      sources: {
        metadata: 'AniList GraphQL',
        chineseTitles: 'bangumi-data',
        chineseSynopsis: 'Bilibili (Douban fallback)',
        ratings: 'AniList / Bilibili / Douban (partial)',
      },
      coverage,
    },
    years: catalogYears,
  };

  const tmpFile = `${OUT_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(catalog), 'utf8');
  await fs.rename(tmpFile, OUT_FILE);

  log(`\n[done] ${allItems.length} titles, ${banned.length} sealed, ${catalog.meta.playable} playable`);
  log(`[done] coverage ${JSON.stringify(coverage)}`);
  log(`[done] ${OUT_FILE}`);
}

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, value] = arg.slice(2).split('=');
    if (key === 'years') out.years = value.split(',').map(Number).filter(Boolean);
    else if (key === 'limit') out.limit = Number(value);
    else out[key] = value === undefined ? true : value;
  }
  return out;
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exitCode = 1;
});
