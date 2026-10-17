export type Language = 'zh' | 'en' | 'ja';

export type SummarySource = 'douban' | 'bilibili' | 'legacy' | 'anilist' | 'none';

export type YearStatus = 'complete' | 'ongoing';

export interface AnimeRatings {
  anilist?: number;
  douban?: number;
  bilibili?: number;
}

export interface RatingCounts {
  douban?: number;
  bilibili?: number;
}

export interface Anime {
  id: string;
  anilistId: number;
  bangumiId?: number;
  bilibiliId?: number;
  doubanId?: string;
  year: number;
  startDate?: string | null;
  format: string;
  episodes: number | null;
  status: string;
  season: string | null;
  zh: string;
  en: string;
  ja: string;
  romaji: string;
  cover: string;
  color: string | null;
  banner: string | null;
  tags: string[];
  genres: string[];
  summary: string;
  summaryLang: 'zh' | 'en' | 'ja' | 'none';
  summaries?: Partial<Record<Language, string>>;
  summaryMachine?: Partial<Record<Language, boolean>>;
  summarySourceEn?: string;
  summarySource: SummarySource;
  ratings: AnimeRatings;
  ratingCounts?: RatingCounts;
  popularity: number;
  favourites: number;
  isBanned: boolean;
  titleMachineZh?: boolean;
  siteUrl: string;
}

export interface CatalogYear {
  year: number;
  status: YearStatus;
  items: Anime[];
}

export interface CatalogSources {
  metadata: string;
  chineseTitles: string;
  chineseSynopsis: string;
  ratings: string;
  translations?: string;
}

export interface CatalogCoverage {
  zhTitle: number;
  zhSummary: number;
  enSummary?: number;
  jaSummary?: number;
  anilistRating: number;
  doubanRating: number;
  bilibiliRating: number;
  bangumiId: number;
  bilibiliId: number;
}

export interface CatalogMeta {
  generatedAt: string;
  years: number[];
  total: number;
  playable: number;
  banned: number;
  sources: CatalogSources;
  coverage: CatalogCoverage;
}

export interface Catalog {
  meta: CatalogMeta;
  years: CatalogYear[];
}
