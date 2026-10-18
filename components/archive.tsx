'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { allAnime, generatedAt, getRating, playableIds, totals, years } from '@/lib/catalog';
import { downloadJson, formatDate, formatInt, padCount, percent } from '@/lib/format';
import { getAnimeTitle, getTagLabel, messages } from '@/lib/i18n';
import {
  calculateRecommendations,
  pickRandomAnime,
  type Recommendation,
} from '@/lib/recommendations';
import type { Anime, CatalogYear, Language } from '@/lib/types';
import { useWatchlist } from '@/lib/watchlist';
import { DetailSheet } from './detail-sheet';
import { ExternalLinkDialog } from './external-link-dialog';
import { OverviewPlate } from './overview-plate';
import { PreviewCard } from './preview-card';
import { RadarSheet } from './radar-sheet';
import { RadarStrip } from './radar-strip';
import { SettingsMenu } from './settings-menu';
import { SiteHeader } from './site-header';
import { TasteCloud } from './taste-cloud';
import { Toast } from './toast';
import { YearSection } from './year-section';

const LANG_KEY = 'animeblock.lang';

type SortMode = 'rating' | 'date' | 'title';

function isLanguage(value: string | null): value is Language {
  return value === 'zh' || value === 'en' || value === 'ja';
}

function sortItems(items: CatalogYear['items'], mode: SortMode, lang: Language) {
  const playable = items.filter((anime) => !anime.isBanned);
  const sealed = items.filter((anime) => anime.isBanned);
  const sorted = [...playable];

  if (mode === 'date') {
    sorted.sort((a, b) => {
      const dateA = a.startDate || '0000-00-00';
      const dateB = b.startDate || '0000-00-00';
      return dateB.localeCompare(dateA) || getRating(b) - getRating(a);
    });
  } else if (mode === 'title') {
    const collator = new Intl.Collator(
      lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'zh-Hans-CN',
      { numeric: true, sensitivity: 'base' },
    );
    sorted.sort((a, b) =>
      collator.compare(getAnimeTitle(a, lang), getAnimeTitle(b, lang)),
    );
  } else {
    sorted.sort(
      (a, b) => getRating(b) - getRating(a) || b.popularity - a.popularity,
    );
  }

  return [...sorted, ...sealed];
}

function filterYears(
  groups: CatalogYear[],
  query: string,
  onlyUnwatched: boolean,
  tagFilter: string | null,
  watched: Set<string>,
  lang: Language,
): CatalogYear[] {
  const needle = query.trim().toLowerCase();
  if (!needle && !onlyUnwatched && !tagFilter) return groups;

  const yearNeedle = /^\d{4}$/.test(needle) ? Number(needle) : null;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((anime) => {
        if (anime.isBanned) return false;
        if (onlyUnwatched && watched.has(anime.id)) return false;
        if (
          tagFilter &&
          !anime.tags.includes(tagFilter) &&
          !anime.genres.includes(tagFilter)
        ) {
          return false;
        }
        if (!needle) return true;
        if (yearNeedle !== null && group.year === yearNeedle) return true;

        const haystack = [
          anime.zh,
          anime.en,
          anime.ja,
          anime.romaji,
          ...Object.values(anime.summaries || {}),
          ...anime.tags,
          ...anime.genres,
        ]
          .join(' ')
          .toLowerCase();

        if (haystack.includes(needle)) return true;
        return anime.tags.some((tag) => getTagLabel(tag, lang).toLowerCase().includes(needle));
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function Archive() {
  const [lang, setLang] = useState<Language>('zh');
  const [query, setQuery] = useState('');
  const [onlyUnwatched, setOnlyUnwatched] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [cloudOpen, setCloudOpen] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('rating');
  const [preview, setPreview] = useState<Anime | null>(null);
  const [selected, setSelected] = useState<Anime | null>(null);
  const [radarOpen, setRadarOpen] = useState(false);
  const [radarSeed, setRadarSeed] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | null>(null);
  const { watched, toggle, merge, clear, exportIds } = useWatchlist();
  const t = messages[lang];

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (isLanguage(saved)) setLang(saved);
    } catch {
      // localStorage can be unavailable in private mode.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const yearStats = useMemo(() => {
    const map = new Map<number, { watched: number; total: number }>();
    for (const group of years) {
      let watchedInYear = 0;
      let playable = 0;
      for (const anime of group.items) {
        if (anime.isBanned) continue;
        playable += 1;
        if (watched.has(anime.id)) watchedInYear += 1;
      }
      map.set(group.year, { watched: watchedInYear, total: playable });
    }
    return map;
  }, [watched]);

  const watchedCount = useMemo(
    () => [...yearStats.values()].reduce((sum, stats) => sum + stats.watched, 0),
    [yearStats],
  );
  const progress = percent(watchedCount, totals.playable);

  const watchedIdList = useMemo(() => [...watched].sort(), [watched]);
  const sortedYears = useMemo(
    () =>
      years.map((group) => ({
        ...group,
        items: sortItems(group.items, sortMode, lang),
      })),
    [sortMode, lang],
  );
  const recommendations = useMemo(
    () => calculateRecommendations(watched, allAnime, 5, radarSeed),
    [watched, radarSeed],
  );

  const deferredQuery = useDeferredValue(query);
  const filteredYears = useMemo(
    () => filterYears(sortedYears, deferredQuery, onlyUnwatched, tagFilter, watched, lang),
    [sortedYears, deferredQuery, onlyUnwatched, tagFilter, watched, lang],
  );
  const resultCount = useMemo(
    () => filteredYears.reduce((sum, group) => sum + group.items.length, 0),
    [filteredYears],
  );
  const isFiltering = query.trim().length > 0 || onlyUnwatched || Boolean(tagFilter);

  const changeLang = useCallback((next: Language) => {
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const handlePreview = useCallback((anime: Anime) => setPreview(anime), []);
  const handlePreviewEnd = useCallback(() => setPreview(null), []);
  const handleOpen = useCallback((anime: Anime) => {
    setPreview(null);
    setSelected(anime);
  }, []);
  const handleToggle = useCallback((id: string) => toggle(id), [toggle]);

  const handleRandom = useCallback(() => {
    const pick = pickRandomAnime(watched, allAnime);
    if (!pick) {
      showToast(t.noUnwatched);
      return;
    }
    setPreview(null);
    setSelected(pick);
  }, [watched, showToast, t.noUnwatched]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setOnlyUnwatched(false);
    setTagFilter(null);
  }, []);

  const handleQuery = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      window.requestAnimationFrame(() => {
        document.getElementById('archive')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, []);

  const handleJump = useCallback((year: number) => {
    setQuery('');
    setOnlyUnwatched(false);
    setTagFilter(null);
    window.requestAnimationFrame(() => {
      document.getElementById(`year-${year}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  const handleTasteTag = useCallback((tag: string) => {
    setQuery('');
    setOnlyUnwatched(false);
    setTagFilter((current) => (current === tag ? null : tag));
    window.requestAnimationFrame(() => {
      document.getElementById('archive')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  const handleSettings = useCallback(() => {
    setPreview(null);
    setSettingsOpen(true);
  }, []);

  const handleViewAllRadar = useCallback(() => {
    setPreview(null);
    setRadarOpen(true);
  }, []);

  const handleOpenRecommendation = useCallback(
    (recommendation: Recommendation) => {
      setRadarOpen(false);
      handleOpen(recommendation.anime);
    },
    [handleOpen],
  );

  const handleExport = useCallback(() => {
    const payload = {
      app: 'animeblock',
      version: 2,
      ids: exportIds(),
      exportedAt: new Date().toISOString(),
    };
    downloadJson(`animeblock-watchlist-${new Date().toISOString().slice(0, 10)}.json`, payload);
    setSettingsOpen(false);
    showToast(t.exported);
  }, [exportIds, showToast, t.exported]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const parsed = JSON.parse(await file.text()) as { ids?: unknown } | unknown[];
        const ids = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.ids)
            ? parsed.ids
            : null;
        if (!ids) throw new Error('invalid watchlist');
        const valid = ids.filter(
          (id): id is string => typeof id === 'string' && playableIds.has(id),
        );
        merge(valid);
        setSettingsOpen(false);
        showToast(t.imported(valid.length));
      } catch {
        setSettingsOpen(false);
        showToast(t.importError);
      }
    },
    [merge, showToast, t],
  );

  const handleClear = useCallback(() => {
    clear();
    setSettingsOpen(false);
    showToast(t.resetDone);
  }, [clear, showToast, t.resetDone]);

  const handleExternal = useCallback((url: string) => setExternalUrl(url), []);
  const handleConfirmExternal = useCallback(() => {
    if (externalUrl) window.open(externalUrl, '_blank', 'noopener,noreferrer');
    setExternalUrl(null);
  }, [externalUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;

      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable);

      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleRandom();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRandom]);

  return (
    <div className="app">
      <SiteHeader
        lang={lang}
        onLang={changeLang}
        query={query}
        onQuery={handleQuery}
        onlyUnwatched={onlyUnwatched}
        onToggleUnwatched={() => setOnlyUnwatched((value) => !value)}
        watchedCount={watchedCount}
        total={totals.playable}
        progress={progress}
        hasRecommendations={recommendations.length > 0}
        onRandom={handleRandom}
        onRadar={handleViewAllRadar}
        onSettings={handleSettings}
        searchRef={searchRef}
      />

      <main className="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{t.heroKicker}</p>
            <div className="hero-count">
              <span className="hero-number">{padCount(watchedCount)}</span>
              <span className="hero-total">/ {formatInt(totals.playable)}</span>
            </div>
            <div className="hero-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="hero-meta">
              {t.heroMeta(totals.firstYear, totals.lastYear, totals.years, totals.total)}
            </p>
            <p className="hero-note">{t.footerData}</p>
          </div>

          <OverviewPlate years={sortedYears} watched={watched} lang={lang} onJump={handleJump} />
        </section>

        <RadarStrip
          recommendations={recommendations}
          watchedCount={watchedCount}
          lang={lang}
          onOpen={handleOpenRecommendation}
          onViewAll={handleViewAllRadar}
        />

        <TasteCloud
          watched={watched}
          lang={lang}
          activeTag={tagFilter}
          open={cloudOpen}
          onToggle={() => setCloudOpen((value) => !value)}
          onTag={handleTasteTag}
        />

        <section className="archive" id="archive">
          <div className="archive-head">
            <p className="eyebrow">{t.archiveKicker}</p>
            <div className="archive-tools">
              <div className="sort-switch" role="group" aria-label={t.sortBy}>
                {(['rating', 'date', 'title'] as SortMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`sort-btn ${sortMode === mode ? 'is-active' : ''}`}
                    aria-pressed={sortMode === mode}
                    onClick={() => setSortMode(mode)}
                  >
                    {mode === 'rating'
                      ? t.sortRating
                      : mode === 'date'
                        ? t.sortDate
                        : t.sortTitle}
                  </button>
                ))}
              </div>
              {tagFilter ? (
                <button
                  type="button"
                  className="tag-filter-chip"
                  onClick={() => setTagFilter(null)}
                  aria-label={t.tasteClear}
                >
                  <span className="tag-filter-hash" aria-hidden="true">
                    #
                  </span>
                  {getTagLabel(tagFilter, lang)}
                  <span className="tag-filter-x" aria-hidden="true">
                    ×
                  </span>
                </button>
              ) : null}
              <span className="archive-count">
                {isFiltering
                  ? `${formatInt(resultCount)} / ${formatInt(totals.playable)}`
                  : `${formatInt(totals.total)} ${t.titles}`}
              </span>
              {isFiltering ? (
                <button type="button" className="text-btn" onClick={clearFilters}>
                  {t.clearFilters}
                </button>
              ) : null}
            </div>
          </div>

          {filteredYears.length ? (
            filteredYears.map((group, index) => {
              const stats = yearStats.get(group.year) ?? {
                watched: 0,
                total: group.items.filter((anime) => !anime.isBanned).length,
              };
              return (
                <YearSection
                  key={group.year}
                  year={group.year}
                  status={group.status}
                  items={group.items}
                  watched={watched}
                  watchedCount={stats.watched}
                  playableCount={stats.total}
                  lang={lang}
                  index={index}
                  onToggle={handleToggle}
                  onPreview={handlePreview}
                  onPreviewEnd={handlePreviewEnd}
                  onOpen={handleOpen}
                />
              );
            })
          ) : (
            <div className="empty-state">
              <p className="eyebrow">{t.filtered}</p>
              <h3>{t.noResults}</h3>
              <p>{t.noResultsHint}</p>
              <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                {t.clearFilters}
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true" />
          <strong>ANIMEBLOCK</strong>
          <span className="dim">/ PERSONAL ANIME ARCHIVE</span>
        </div>
        <p className="footer-note">{t.footerNote}</p>
        <div className="footer-meta">
          <span>{t.footerData}</span>
          <span>
            {t.updated} {formatDate(generatedAt)}
          </span>
        </div>
      </footer>

      {preview ? <PreviewCard anime={preview} lang={lang} /> : null}

      <DetailSheet
        anime={selected}
        lang={lang}
        isWatched={selected ? watched.has(selected.id) : false}
        onClose={() => setSelected(null)}
        onToggle={handleToggle}
        onExternal={handleExternal}
      />

      <RadarSheet
        open={radarOpen}
        recommendations={recommendations}
        watchedCount={watchedCount}
        lang={lang}
        onClose={() => setRadarOpen(false)}
        onRefresh={() => setRadarSeed((value) => value + 1)}
        onOpen={handleOpenRecommendation}
      />

      <SettingsMenu
        open={settingsOpen}
        lang={lang}
        ids={watchedIdList}
        onClose={() => setSettingsOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
      />

      <ExternalLinkDialog
        url={externalUrl}
        lang={lang}
        onClose={() => setExternalUrl(null)}
        onConfirm={handleConfirmExternal}
      />

      <Toast message={toast} />
    </div>
  );
}
