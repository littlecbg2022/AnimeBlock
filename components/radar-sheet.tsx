'use client';

import { Radar, RefreshCw, X } from 'lucide-react';
import type { Language } from '@/lib/types';
import type { Recommendation } from '@/lib/recommendations';
import { getAnimeTitle, getTagLabel, joinLocalizedTags, messages } from '@/lib/i18n';
import { formatScore } from '@/lib/format';
import { useDialog } from '@/lib/use-dialog';

interface RadarSheetProps {
  open: boolean;
  recommendations: Recommendation[];
  watchedCount: number;
  lang: Language;
  onClose: () => void;
  onRefresh: () => void;
  onOpen: (recommendation: Recommendation) => void;
}

export function RadarSheet({
  open,
  recommendations,
  watchedCount,
  lang,
  onClose,
  onRefresh,
  onOpen,
}: RadarSheetProps) {
  const t = messages[lang];
  const ref = useDialog(open, onClose);
  const missing = Math.max(0, 3 - watchedCount);

  return (
    <dialog
      ref={ref}
      className="sheet radar-sheet"
      aria-labelledby="radar-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-panel">
        <button type="button" className="sheet-close" onClick={onClose} aria-label={t.close}>
          <X size={18} aria-hidden="true" />
        </button>

        <header className="radar-head">
          <p className="eyebrow">
            <Radar size={13} aria-hidden="true" /> {t.radarKicker}
          </p>
          <div className="radar-title-row">
            <h2 id="radar-title">{t.radarTitle}</h2>
            {recommendations.length ? (
              <button type="button" className="radar-refresh" onClick={onRefresh}>
                <RefreshCw size={13} aria-hidden="true" />
                {t.radarRefresh}
              </button>
            ) : null}
          </div>
          <p>{t.radarBasedOn(watchedCount)}</p>
        </header>

        {recommendations.length ? (
          <ol className="radar-list">
            {recommendations.map((item, index) => (
              <li key={item.anime.id}>
                <button
                  type="button"
                  className="radar-item"
                  onClick={() => {
                    onClose();
                    onOpen(item);
                  }}
                >
                  <span className="radar-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="radar-item-body">
                    <span className="radar-item-top">
                      <strong>{getAnimeTitle(item.anime, lang)}</strong>
                      <em>
                        {t.radarScore} {Math.round(item.score)}
                      </em>
                    </span>
                    <span className="radar-reason">
                      {item.because
                        ? t.radarBecause(
                            getAnimeTitle(item.because.anime, lang),
                            joinLocalizedTags(item.because.tags, lang),
                            formatScore(item.anime.ratings.anilist),
                          )
                        : t.radarReason(
                            joinLocalizedTags(item.matchedTags.slice(0, 2), lang),
                            formatScore(item.anime.ratings.anilist),
                          )}
                    </span>
                    <span className="radar-tags">
                      {item.matchedTags.map((tag) => (
                        <span key={tag}>{getTagLabel(tag, lang)}</span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="radar-empty">
            <p>{missing ? t.radarNeedMore(missing) : t.radarEmpty}</p>
            <small>{t.radarEmptyHint}</small>
          </div>
        )}
      </div>
    </dialog>
  );
}
