'use client';

import { ArrowRight, Radar } from 'lucide-react';
import type { Language } from '@/lib/types';
import type { Recommendation } from '@/lib/recommendations';
import { getAnimeTitle, messages } from '@/lib/i18n';

interface RadarStripProps {
  recommendations: Recommendation[];
  watchedCount: number;
  lang: Language;
  onOpen: (recommendation: Recommendation) => void;
  onViewAll: () => void;
}

export function RadarStrip({
  recommendations,
  watchedCount,
  lang,
  onOpen,
  onViewAll,
}: RadarStripProps) {
  const t = messages[lang];
  const visible = recommendations.slice(0, 3);
  const missing = Math.max(0, 3 - watchedCount);

  return (
    <section className="radar-strip" aria-label={t.radarTitle}>
      <div className="radar-strip-head">
        <span className="eyebrow">
          <Radar size={13} aria-hidden="true" /> {t.radarTitle}
        </span>
        {watchedCount > 0 ? (
          <span className="radar-strip-meta">{t.radarBasedOn(watchedCount)}</span>
        ) : null}
      </div>

      {visible.length ? (
        <div className="radar-strip-body">
          <ol className="radar-strip-list">
            {visible.map((item, index) => (
              <li key={item.anime.id}>
                <button type="button" onClick={() => onOpen(item)}>
                  <span className="radar-strip-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="radar-strip-title">{getAnimeTitle(item.anime, lang)}</span>
                  <span className="radar-strip-score">{Math.round(item.score)}</span>
                </button>
              </li>
            ))}
          </ol>

          <button type="button" className="radar-strip-more" onClick={onViewAll}>
            {t.radarViewAll} <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="radar-strip-empty">
          <p>{missing ? t.radarNeedMore(missing) : t.radarEmpty}</p>
          <span>{t.radarEmptyHint}</span>
        </div>
      )}
    </section>
  );
}
