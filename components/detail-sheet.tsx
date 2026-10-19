'use client';

import Image from 'next/image';
import { Check, ExternalLink, Eye, PlayCircle, Star, X } from 'lucide-react';
import type { Anime, Language } from '@/lib/types';
import {
  getAnimeTitle,
  getSummarySourceLabel,
  getTagLabel,
  languageLabels,
  messages,
} from '@/lib/i18n';
import {
  getLocalizedSummary,
  hasLocalizedSummary,
  isMachineSummary,
} from '@/lib/catalog';
import { getSearchTitles } from '@/lib/search';
import { buildWatchUrl, WATCH_SOURCES } from '@/lib/watch-sources';
import { formatInt, formatScore } from '@/lib/format';
import { useDialog } from '@/lib/use-dialog';

interface DetailSheetProps {
  anime: Anime | null;
  lang: Language;
  isWatched: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
  onExternal: (url: string) => void;
}

export function DetailSheet({
  anime,
  lang,
  isWatched,
  onClose,
  onToggle,
  onExternal,
}: DetailSheetProps) {
  const t = messages[lang];
  const ref = useDialog(Boolean(anime), onClose);

  const primarySource = anime
    ? anime.ratings.anilist
      ? 'anilist'
      : anime.ratings.douban
        ? 'douban'
        : 'bilibili'
    : 'none';

  const secondaryScores = anime
    ? [
        {
          key: 'anilist',
          label: 'AniList',
          value: anime.ratings.anilist,
          count: undefined as number | undefined,
        },
        {
          key: 'douban',
          label: t.linkDouban,
          value: anime.ratings.douban,
          count: anime.ratingCounts?.douban,
        },
        {
          key: 'bilibili',
          label: t.linkBilibili,
          value: anime.ratings.bilibili,
          count: anime.ratingCounts?.bilibili,
        },
      ].filter(
        (entry) =>
          entry.key !== primarySource && typeof entry.value === 'number' && entry.value > 0,
      )
    : [];

  const localizedSummary = anime ? getLocalizedSummary(anime, lang) : '';
  const summaryIsLocalized = anime ? hasLocalizedSummary(anime, lang) : false;
  const summaryIsMachine = anime ? isMachineSummary(anime, lang) : false;
  const fallbackLanguage = anime?.summaries?.en
    ? 'en'
    : anime?.summaries?.zh
      ? 'zh'
      : 'ja';

  const searchTitles = anime ? getSearchTitles(anime, lang) : null;

  const watchLinks = anime
    ? WATCH_SOURCES.map((source) => {
        const label = t[source.labelKey as keyof typeof t];
        return {
          ...source,
          label: typeof label === 'string' ? label : source.id,
          url: buildWatchUrl(source, anime, lang),
        };
      })
    : [];
  const thirdPartyWatchLinks = watchLinks.filter((link) => link.group === 'thirdParty');
  const officialFreeWatchLinks = watchLinks.filter((link) => link.group === 'officialFree');
  const paidWatchLinks = watchLinks.filter((link) => link.group === 'paid');

  const searchVariants =
    anime && searchTitles
      ? [
          {
            label: `AGE · ${t.searchFull}`,
            url: `https://www.agedm.io/search?query=${encodeURIComponent(searchTitles.fullChinese)}`,
          },
          {
            label: `OmoFun · ${t.searchFull}`,
            url: `https://www.omofuna.com/search/-------------.html?wd=${encodeURIComponent(searchTitles.fullChinese)}`,
          },
          {
            label: `OmoFun · ${t.searchJapanese}`,
            url: `https://www.omofuna.com/search/-------------.html?wd=${encodeURIComponent(searchTitles.japanese)}`,
          },
          {
            label: t.searchBing,
            url: `https://www.bing.com/search?q=site%3Aagedm.io+${encodeURIComponent(searchTitles.base)}`,
          },
        ]
      : [];

  return (
    <dialog
      ref={ref}
      className="sheet detail-sheet"
      aria-labelledby="detail-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {anime ? (
        <div className="sheet-panel">
          <button type="button" className="sheet-close" onClick={onClose} aria-label={t.close}>
            <X size={18} aria-hidden="true" />
          </button>

          <div className="detail-head">
            <div className="detail-poster">
              {anime.cover ? (
                <Image
                  src={anime.cover}
                  alt=""
                  width={132}
                  height={188}
                  sizes="132px"
                  loading="eager"
                  className="detail-poster-image"
                />
              ) : (
                <span className="detail-poster-fallback">{anime.zh.slice(0, 1)}</span>
              )}
            </div>

            <div className="detail-intro">
              <p className="eyebrow">
                {t.detailArchive} / {anime.year} / {anime.format}
              </p>
              <h2 className="detail-title" id="detail-title">
                {getAnimeTitle(anime, lang)}
              </h2>
              <p className="detail-native">
                {[anime.ja, anime.en].filter(Boolean).join('  ·  ')}
              </p>

              <div className="detail-rating">
                <span className="detail-score">
                  <Star size={16} fill="currentColor" aria-hidden="true" />
                  {formatScore(
                    anime.ratings.anilist ??
                      anime.ratings.douban ??
                      anime.ratings.bilibili,
                  )}
                </span>
                <span className="detail-score-label">
                  {anime.ratings.anilist
                    ? 'ANILIST'
                    : anime.ratings.douban
                      ? t.linkDouban
                      : anime.ratings.bilibili
                        ? t.linkBilibili
                        : t.detailScore}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-meta">
            <span>{anime.year}</span>
            <span>{anime.format}</span>
            {anime.episodes ? <span>{t.detailEpisodes(anime.episodes)}</span> : null}
            <span className="mono">{anime.status}</span>
          </div>

          {secondaryScores.length ? (
            <div className="detail-scores">
              {secondaryScores.map((entry) => (
                <span key={entry.key}>
                  {entry.label} <strong>{formatScore(entry.value)}</strong>
                  {entry.count ? (
                    <em>{t.detailVotes(formatInt(entry.count))}</em>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}

          {anime.tags.length ? (
            <div className="detail-block">
              <p className="detail-section-label">{t.detailTags}</p>
              <div className="tag-row">
                {anime.tags.slice(0, 12).map((tag) => (
                  <span className="tag" key={tag}>
                    {getTagLabel(tag, lang)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detail-block">
            <p className="detail-section-label">
              <span>{t.detailSummary}</span>
              <span className="detail-source-row">
                {anime.summarySource !== 'none' ? (
                  <span className="detail-source">
                    {getSummarySourceLabel(anime.summarySource, lang)}
                  </span>
                ) : null}
                {summaryIsMachine ? (
                  <span className="mt-badge">{t.machineTranslation}</span>
                ) : null}
              </span>
            </p>
            {!summaryIsLocalized && localizedSummary ? (
              <p className="detail-note">
                {t.summaryFallback(languageLabels[fallbackLanguage as Language])}
              </p>
            ) : null}
            <div className="detail-summary-text">
              {localizedSummary || t.summaryNone}
            </div>
          </div>

          {anime.isBanned ? (
            <p className="detail-sealed-note">{t.sealedNote}</p>
          ) : (
            <div className="detail-actions">
              <button
                type="button"
                className={`btn ${isWatched ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => onToggle(anime.id)}
              >
                {isWatched ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
                {isWatched ? t.unmarkWatched : t.markWatched}
              </button>
            </div>
          )}

          <div className="detail-block detail-watch">
            <p className="detail-section-label">
              <span>
                <PlayCircle size={13} aria-hidden="true" /> {t.watchTitle}
              </span>
            </p>

            <div className="watch-section watch-third">
              <p className="watch-section-title">
                <span className="third-badge">3RD-PARTY</span>
                {t.watchFreeTitle}
              </p>
              <p className="watch-note">{t.watchFreeNote}</p>
              <div className="watch-grid">
                {thirdPartyWatchLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    className="source-link third-link"
                    onClick={() => onExternal(link.url)}
                  >
                    {link.label} <ExternalLink size={12} aria-hidden="true" />
                  </button>
                ))}
              </div>
              {searchVariants.length ? (
                <details className="search-variants">
                  <summary>{t.searchFallback}</summary>
                  <div className="search-variant-row">
                    {searchVariants.map((link) => (
                      <button
                        key={link.label}
                        type="button"
                        className="source-link"
                        onClick={() => onExternal(link.url)}
                      >
                        {link.label} <ExternalLink size={10} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>

            <details className="watch-section watch-official-free">
              <summary className="watch-section-title">
                {t.watchOfficialFreeTitle}
              </summary>
              <p className="watch-note">{t.watchOfficialFreeNote}</p>
              <div className="watch-grid">
                {officialFreeWatchLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    className="source-link"
                    onClick={() => onExternal(link.url)}
                  >
                    {link.label} <ExternalLink size={12} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </details>

            <div className="watch-section watch-paid">
              <p className="watch-section-title">{t.watchPaidTitle}</p>
              <p className="watch-note">{t.watchNote}</p>
              <div className="watch-grid">
                {paidWatchLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    className="source-link"
                    onClick={() => onExternal(link.url)}
                  >
                    {link.label} <ExternalLink size={12} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-links">
            <p className="detail-section-label">{t.detailLinks}</p>
            <div className="link-row">
              <button
                type="button"
                className="source-link"
                onClick={() => onExternal(anime.siteUrl || `https://anilist.co/anime/${anime.anilistId}`)}
              >
                {t.linkAniList} <ExternalLink size={12} aria-hidden="true" />
              </button>
              {anime.bangumiId ? (
                <button
                  type="button"
                  className="source-link"
                  onClick={() => onExternal(`https://bgm.tv/subject/${anime.bangumiId}`)}
                >
                  {t.linkBangumi} <ExternalLink size={12} aria-hidden="true" />
                </button>
              ) : null}
              {anime.bilibiliId ? (
                <button
                  type="button"
                  className="source-link"
                  onClick={() =>
                    onExternal(`https://www.bilibili.com/bangumi/play/ss${anime.bilibiliId}`)
                  }
                >
                  {t.linkBilibili} <ExternalLink size={12} aria-hidden="true" />
                </button>
              ) : null}
              {anime.doubanId ? (
                <button
                  type="button"
                  className="source-link"
                  onClick={() => onExternal(`https://movie.douban.com/subject/${anime.doubanId}/`)}
                >
                  {t.linkDouban} <ExternalLink size={12} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
