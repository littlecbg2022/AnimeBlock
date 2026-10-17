import type { Anime, Language } from './types';
import { getAnimeTitle } from './i18n';

function cleanTitle(value: string): string {
  let title = value.trim();

  title = title.replace(/[（(【\[].*?[）)】\]]/g, ' ');
  title = title.replace(/第\s*[一二三四五六七八九十0-9]+\s*[季期部篇]/g, ' ');
  title = title.replace(
    /\b(season|part|final season|final|ova|ona|movie|the movie)\b.*$/i,
    ' ',
  );
  title = title.replace(/\b(2nd|3rd|4th|5th|second|third|fourth|fifth)\b.*$/i, ' ');
  title = title.replace(/\bS\d+\b/gi, ' ');
  title = title.replace(/\b(II|III|IV|V|VI|VII|VIII|IX|X)\b/g, ' ');
  title = title.replace(/[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/g, ' ');
  title = title.replace(
    /(最终季|最終季|最终章|最終章|完结篇|完結編|剧场版|劇場版|特别篇|特別篇|番外篇|前篇|后篇|後篇|序章|终章|終章)\s*$/g,
    ' ',
  );
  title = title.replace(/\s+[^\s]{2,8}篇\s*$/g, ' ');
  title = title.replace(/\s+/g, ' ').trim();

  const parts = title.split(/\s*[:：\-–—|·]\s*/);
  if (parts.length > 1 && parts[0].trim().length >= 4) {
    title = parts[0].trim();
  }

  return title.replace(/\s+/g, ' ').trim();
}

export interface SearchTitles {
  full: string;
  fullChinese: string;
  base: string;
  short: string;
  japanese: string;
  english: string;
}

export function getSearchTitles(anime: Anime, lang: Language): SearchTitles {
  const full = getAnimeTitle(anime, lang);
  const fullChinese = (anime.zh || full).trim();
  const base = cleanTitle(fullChinese) || cleanTitle(full) || fullChinese;
  const short = Array.from(base).slice(0, 8).join('').trim();

  return {
    full,
    fullChinese,
    base,
    short,
    japanese: (anime.ja || full).trim(),
    english: (anime.en || full).trim(),
  };
}
