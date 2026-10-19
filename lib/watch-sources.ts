import rawSources from '@/data/watch-sources.json';
import { getSearchTitles } from './search';
import type { Anime, Language } from './types';

export type WatchSourceGroup = 'thirdParty' | 'officialFree' | 'paid';
export type WatchQuery = 'base' | 'baseShort' | 'zh' | 'en' | 'web';

interface RawWatchSource {
  id: string;
  labelKey: string;
  url: string;
  query: WatchQuery;
}

export interface WatchSource extends RawWatchSource {
  group: WatchSourceGroup;
}

const sourceGroups = rawSources as Record<WatchSourceGroup, RawWatchSource[]>;

export const WATCH_SOURCES: WatchSource[] = (
  Object.entries(sourceGroups) as [WatchSourceGroup, RawWatchSource[]][]
).flatMap(([group, sources]) => sources.map((source) => ({ ...source, group })));

function resolveQuery(source: WatchSource, anime: Anime, lang: Language): string {
  const titles = getSearchTitles(anime, lang);
  switch (source.query) {
    case 'baseShort':
      return Array.from(titles.base).length <= 8 ? titles.base : titles.short;
    case 'base':
      return titles.base;
    case 'zh':
      return anime.zh || titles.fullChinese;
    case 'en':
      return titles.english || anime.en;
    case 'web':
      return `${anime.zh} ${anime.en} 在线观看 正版`;
  }
}

export function buildWatchUrl(source: WatchSource, anime: Anime, lang: Language): string {
  const query = encodeURIComponent(resolveQuery(source, anime, lang));
  return source.url.replaceAll('{query}', query);
}
