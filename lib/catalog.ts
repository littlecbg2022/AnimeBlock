import rawCatalog from '@/data/catalog.json';
import type { Anime, Catalog, CatalogYear, Language } from './types';

export const catalog = rawCatalog as unknown as Catalog;

export const years: CatalogYear[] = [...catalog.years].sort((a, b) => b.year - a.year);

export const allAnime: Anime[] = years.flatMap((group) => group.items);

export const animeById = new Map(allAnime.map((anime) => [anime.id, anime]));

export const playableIds = new Set(
  allAnime.filter((anime) => !anime.isBanned).map((anime) => anime.id),
);

export const totals = {
  total: allAnime.length,
  playable: allAnime.filter((anime) => !anime.isBanned).length,
  banned: allAnime.filter((anime) => anime.isBanned).length,
  years: years.length,
  firstYear: years[years.length - 1]?.year ?? 0,
  lastYear: years[0]?.year ?? 0,
};

export const generatedAt = catalog.meta.generatedAt;

export function getRating(anime: Anime): number {
  return anime.ratings.anilist ?? anime.ratings.douban ?? anime.ratings.bilibili ?? 0;
}

export function getLocalizedSummary(anime: Anime, lang: Language): string {
  const localized = anime.summaries?.[lang];
  if (localized) return localized;
  const fallback = anime.summaries?.en || anime.summaries?.zh || anime.summary || '';
  return fallback === '暂无简介。' ? '' : fallback;
}

export function hasLocalizedSummary(anime: Anime, lang: Language): boolean {
  return Boolean(anime.summaries?.[lang]);
}

export function isMachineSummary(anime: Anime, lang: Language): boolean {
  return Boolean(anime.summaryMachine?.[lang]);
}
