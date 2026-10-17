'use client';

import { memo, useCallback, useState } from 'react';
import type { CatalogYear, Language } from '@/lib/types';
import { getAnimeTitle, messages } from '@/lib/i18n';

interface OverviewPlateProps {
  years: CatalogYear[];
  watched: Set<string>;
  lang: Language;
  onJump: (year: number) => void;
}

interface PlateGridProps {
  years: CatalogYear[];
  watched: Set<string>;
  lang: Language;
  onHover: (year: number, title: string) => void;
  onJump: (year: number) => void;
}

const PlateGrid = memo(function PlateGrid({
  years,
  watched,
  lang,
  onHover,
  onJump,
}: PlateGridProps) {
  return (
    <div className="plate-rows" onMouseLeave={() => onHover(0, '')}>
      {years.map((group) => (
        <div className="plate-row" key={group.year}>
          <span className="plate-year" aria-hidden="true">
            {group.year}
          </span>
          <div className="plate-cells">
            {group.items.map((anime) => {
              const title = getAnimeTitle(anime, lang);
              const state = anime.isBanned
                ? 'is-sealed'
                : watched.has(anime.id)
                  ? 'is-watched'
                  : 'is-unwatched';
              return (
                <button
                  key={anime.id}
                  type="button"
                  className={`plate-cell ${state}`}
                  tabIndex={-1}
                  aria-label={`${group.year} · ${title}${anime.isBanned ? ' · sealed' : ''}`}
                  onMouseEnter={() => onHover(group.year, title)}
                  onClick={() => onJump(group.year)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

export function OverviewPlate({ years, watched, lang, onJump }: OverviewPlateProps) {
  const t = messages[lang];
  const [hover, setHover] = useState<{ year: number; title: string } | null>(null);
  const total = years.reduce((sum, group) => sum + group.items.length, 0);
  const handleHover = useCallback((year: number, title: string) => {
    setHover(title ? { year, title } : null);
  }, []);

  return (
    <section className="plate" aria-label={t.archiveMap}>
      <div className="plate-head">
        <span className="eyebrow">{t.archiveMap}</span>
        <span className="plate-count">
          {years.length} × 50 <span className="dim">/ {total}</span>
        </span>
      </div>

      <div className="plate-info">
        {hover && hover.title ? (
          <>
            <span className="plate-info-year">{hover.year}</span>
            <span className="plate-info-title">{hover.title}</span>
          </>
        ) : (
          <span className="dim">{t.archiveMapHint}</span>
        )}
      </div>

      <PlateGrid
        years={years}
        watched={watched}
        lang={lang}
        onHover={handleHover}
        onJump={onJump}
      />

      <div className="plate-legend">
        <span>
          <i className="legend-dot is-watched" aria-hidden="true" />
          {t.legendWatched}
        </span>
        <span>
          <i className="legend-dot is-unwatched" aria-hidden="true" />
          {t.legendUnwatched}
        </span>
        <span>
          <i className="legend-dot is-sealed" aria-hidden="true" />
          {t.legendSealed}
        </span>
      </div>
    </section>
  );
}
