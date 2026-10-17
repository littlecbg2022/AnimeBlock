'use client';

import { memo, useState, type CSSProperties } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Anime, Language } from '@/lib/types';
import { messages } from '@/lib/i18n';
import { AnimeCell } from './anime-cell';

interface YearSectionProps {
  year: number;
  status: 'complete' | 'ongoing';
  items: Anime[];
  watched: Set<string>;
  watchedCount: number;
  playableCount: number;
  lang: Language;
  index: number;
  onToggle: (id: string) => void;
  onPreview: (anime: Anime) => void;
  onPreviewEnd: () => void;
  onOpen: (anime: Anime) => void;
}

function YearSectionComponent({
  year,
  status,
  items,
  watched,
  watchedCount,
  playableCount,
  lang,
  index,
  onToggle,
  onPreview,
  onPreviewEnd,
  onOpen,
}: YearSectionProps) {
  const t = messages[lang];
  const progress = playableCount ? Math.min(100, (watchedCount / playableCount) * 100) : 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={`year-section ${expanded ? 'is-expanded' : ''}`}
      id={`year-${year}`}
      data-year={year}
      aria-labelledby={`year-${year}-label`}
      style={{ '--i': index } as CSSProperties}
    >
      <header className="year-head">
        <div className="year-heading">
          <h2 className="year-number" id={`year-${year}-label`}>
            {year}
          </h2>
          <span className={`year-status ${status === 'ongoing' ? 'is-ongoing' : ''}`}>
            {status === 'ongoing' ? t.yearOngoing : t.yearComplete}
          </span>
        </div>

        <div className="year-meter" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <span className="year-count">{t.yearCount(watchedCount, playableCount)}</span>
      </header>

      <div className="year-grid">
        {items.map((anime) => (
          <AnimeCell
            key={anime.id}
            anime={anime}
            lang={lang}
            isWatched={watched.has(anime.id)}
            onToggle={onToggle}
            onPreview={onPreview}
            onPreviewEnd={onPreviewEnd}
            onOpen={onOpen}
          />
        ))}
      </div>

      {items.length > 12 ? (
        <button
          type="button"
          className="year-expand"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t.collapseYear : t.expandYear(items.length)}
          {expanded ? (
            <ChevronUp size={13} aria-hidden="true" />
          ) : (
            <ChevronDown size={13} aria-hidden="true" />
          )}
        </button>
      ) : null}
    </section>
  );
}

export const YearSection = memo(YearSectionComponent);
