import { getRating } from './catalog';
import type { Anime } from './types';

export interface Recommendation {
  anime: Anime;
  score: number;
  matchedTags: string[];
  because?: {
    anime: Anime;
    tags: string[];
  };
}

export interface TasteProfile {
  tagWeights: Record<string, number>;
  tagPenalty: Record<string, number>;
  tagIdf: Record<string, number>;
  genreWeights: Record<string, number>;
  topTags: string[];
  watchedCount: number;
  averageYear: number;
  averageRating: number;
  favoriteFormat: string;
  averageEpisodes: number;
}

const TOP_PROFILE_TAGS = 10;
const MIN_RECOMMENDATION_RATING = 6.8;
const MIN_WATCHED_FOR_PROFILE = 3;

function hash(value: string): number {
  let h = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function franchiseKey(anime: Anime): string {
  const raw = `${anime.zh || ''} ${anime.en || ''} ${anime.ja || ''}`.toLowerCase();
  const key = raw
    .replace(/第[一二三四五六七八九十0-9]+[季期部篇]/g, '')
    .replace(/剧场版|劇場版/g, '')
    .replace(/\b(season|part|final season|final|ova|ona|movie|the movie)\b.*$/i, '')
    .replace(/\b(2nd|3rd|4th|5th|second|third|fourth|fifth)\b/g, '')
    .replace(/\b(ii|iii|iv|v|2nd|3rd|4th)\b/g, '')
    .replace(/[\u2160-\u217f]/g, '')
    .replace(/[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
  return key || anime.id;
}

function buildTagIdf(all: Anime[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const anime of all) {
    for (const tag of new Set(anime.tags)) counts[tag] = (counts[tag] || 0) + 1;
  }
  const total = Math.max(1, all.length);
  const idf: Record<string, number> = {};
  for (const [tag, count] of Object.entries(counts)) {
    idf[tag] = clamp(Math.log((total + 1) / (count + 1)) + 1, 1, 3);
  }
  return idf;
}

export function buildTasteProfile(watchedIds: Set<string>, all: Anime[]): TasteProfile {
  const tagWeights: Record<string, number> = {};
  const tagPenalty: Record<string, number> = {};
  const genreWeights: Record<string, number> = {};
  const tagIdf = buildTagIdf(all);
  const watched = all.filter((anime) => watchedIds.has(anime.id) && !anime.isBanned);
  const formatCounts: Record<string, number> = {};

  let yearTotal = 0;
  let ratingTotal = 0;
  let episodeTotal = 0;
  let episodeCount = 0;

  for (const anime of watched) {
    const rating = getRating(anime);
    const idfBoost = (tag: string) => tagIdf[tag] || 1;
    const positive = rating >= 7.5 ? 1 + (rating - 7.5) * 0.45 : Math.max(0.25, rating - 6.5);
    const negative = rating < 6.5 ? (6.5 - rating) * 0.35 : 0;

    yearTotal += anime.year;
    ratingTotal += rating;
    formatCounts[anime.format] = (formatCounts[anime.format] || 0) + 1;
    if (typeof anime.episodes === 'number' && anime.episodes > 0) {
      episodeTotal += anime.episodes;
      episodeCount += 1;
    }

    for (const tag of anime.tags) {
      if (negative > 0) {
        tagPenalty[tag] = (tagPenalty[tag] || 0) + negative * idfBoost(tag);
      } else {
        tagWeights[tag] = (tagWeights[tag] || 0) + positive * idfBoost(tag);
      }
    }
    for (const genre of anime.genres) {
      if (negative === 0) genreWeights[genre] = (genreWeights[genre] || 0) + positive;
    }
  }

  const topTags = Object.entries(tagWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_PROFILE_TAGS)
    .map(([tag]) => tag);

  const favoriteFormat =
    Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TV';

  return {
    tagWeights,
    tagPenalty,
    tagIdf,
    genreWeights,
    topTags,
    watchedCount: watched.length,
    averageYear: watched.length ? yearTotal / watched.length : 0,
    averageRating: watched.length ? ratingTotal / watched.length : 0,
    favoriteFormat,
    averageEpisodes: episodeCount ? episodeTotal / episodeCount : 12,
  };
}

interface Candidate {
  anime: Anime;
  score: number;
  matchedTags: string[];
  because?: Recommendation['because'];
  becauseOptions: Array<{
    anime: Anime;
    tags: string[];
    weight: number;
  }>;
}

export function calculateRecommendations(
  watchedIds: Set<string>,
  all: Anime[],
  limit = 5,
  seed = 0,
): Recommendation[] {
  if (watchedIds.size === 0) return [];

  const profile = buildTasteProfile(watchedIds, all);
  if (profile.watchedCount < MIN_WATCHED_FOR_PROFILE || profile.topTags.length === 0) {
    return [];
  }

  const watched = all.filter((anime) => watchedIds.has(anime.id) && !anime.isBanned);
  const topWeightTotal = profile.topTags.reduce(
    (sum, tag) => sum + (profile.tagWeights[tag] || 0),
    0,
  );
  const watchedFranchises = new Set(watched.map(franchiseKey));
  const candidates: Candidate[] = [];

  for (const anime of all) {
    if (anime.isBanned || watchedIds.has(anime.id)) continue;
    const rating = getRating(anime);
    if (rating < MIN_RECOMMENDATION_RATING) continue;

    const matchedTags = anime.tags.filter((tag) => (profile.tagWeights[tag] || 0) > 0);
    if (matchedTags.length < 2) continue;

    const tagWeight = matchedTags.reduce(
      (sum, tag) => sum + (profile.tagWeights[tag] || 0),
      0,
    );
    const tagPenalty = anime.tags.reduce(
      (sum, tag) => sum + (profile.tagPenalty[tag] || 0),
      0,
    );
    const tagScore = topWeightTotal ? clamp(tagWeight / topWeightTotal, 0, 1) : 0;
    const negative = topWeightTotal
      ? clamp((tagPenalty / topWeightTotal) * 0.35, 0, 0.18)
      : 0;
    const genreMatches = anime.genres.filter((genre) => profile.genreWeights[genre]);
    const genreScore = clamp(genreMatches.length / 3, 0, 1);
    const quality = clamp(rating / 10, 0, 1);
    const popularityScore = clamp(Math.log10(anime.popularity + 10) / 6, 0, 1);
    const yearAffinity = 1 - Math.min(0.2, Math.abs(anime.year - profile.averageYear) / 100);
    const formatAffinity = anime.format === profile.favoriteFormat ? 1 : 0;
    const episodes = anime.episodes ?? (anime.format === 'MOVIE' ? 1 : 12);
    const episodeAffinity = 1 - Math.min(1, Math.abs(episodes - profile.averageEpisodes) / 24);
    const sequel = watchedFranchises.has(franchiseKey(anime)) ? 0.08 : 0;
    const jitter = seed
      ? ((hash(`${anime.id}:${seed}`) % 1000) / 1000) * 0.06
      : 0;

    const rawScore =
      tagScore * 0.46 +
      quality * 0.24 +
      genreScore * 0.1 +
      popularityScore * 0.06 +
      yearAffinity * 0.03 +
      formatAffinity * 0.02 +
      episodeAffinity * 0.02 +
      sequel -
      negative +
      jitter;

    const becauseOptions = watched
      .map((source) => {
        const shared = source.tags
          .filter((tag) => (profile.tagWeights[tag] || 0) > 0)
          .sort((a, b) => (profile.tagWeights[b] || 0) - (profile.tagWeights[a] || 0));
        return {
          anime: source,
          tags: shared.slice(0, 2),
          weight: shared.reduce((sum, tag) => sum + (profile.tagWeights[tag] || 0), 0),
        };
      })
      .filter((option) => option.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    const because = becauseOptions[0]
      ? { anime: becauseOptions[0].anime, tags: becauseOptions[0].tags }
      : undefined;

    candidates.push({
      anime,
      score: rawScore,
      matchedTags: [...matchedTags]
        .sort((a, b) => (profile.tagWeights[b] || 0) - (profile.tagWeights[a] || 0))
        .slice(0, 3),
      because,
      becauseOptions,
    });
  }

  candidates.sort(
    (a, b) => b.score - a.score || getRating(b.anime) - getRating(a.anime),
  );

  const selected: Candidate[] = [];
  const usedFranchises = new Set<string>();
  const usedBecauseIds = new Set<string>();
  const selectedTags = new Set<string>();
  const selectedYears = new Set<number>();

  for (const candidate of candidates) {
    if (selected.length >= limit) break;

    const franchise = franchiseKey(candidate.anime);
    if (usedFranchises.has(franchise)) continue;

    const repeatedTags = candidate.matchedTags.filter((tag) => selectedTags.has(tag)).length;
    const yearPenalty = selectedYears.has(candidate.anime.year) ? 0.03 : 0;
    const penalty = repeatedTags * 0.06 + yearPenalty;
    const adjusted = candidate.score * Math.max(0.76, 1 - penalty);

    const becauseOption = candidate.becauseOptions.find(
      (option) => !usedBecauseIds.has(option.anime.id),
    );

    selected.push({
      ...candidate,
      score: adjusted,
      because: becauseOption
        ? { anime: becauseOption.anime, tags: becauseOption.tags }
        : undefined,
    });
    usedFranchises.add(franchise);
    if (becauseOption) usedBecauseIds.add(becauseOption.anime.id);
    candidate.matchedTags.forEach((tag) => selectedTags.add(tag));
    selectedYears.add(candidate.anime.year);
  }

  selected.sort((a, b) => b.score - a.score);
  const best = selected[0]?.score ?? 0;
  return selected.map((candidate) => ({
    anime: candidate.anime,
    score: best ? Math.max(1, Math.round((candidate.score / best) * 100)) : 0,
    matchedTags: candidate.matchedTags,
    because: candidate.because,
  }));
}

export function pickRandomAnime(watchedIds: Set<string>, all: Anime[]): Anime | null {
  const candidates = all.filter((anime) => !anime.isBanned && !watchedIds.has(anime.id));
  if (candidates.length === 0) return null;

  const weights = candidates.map((anime) => {
    const rating = Math.max(getRating(anime), 5);
    return Math.pow(rating, 2) * (1 + Math.log10(anime.popularity + 10));
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = Math.random() * total;

  for (let index = 0; index < candidates.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return candidates[index];
  }
  return candidates[candidates.length - 1];
}
