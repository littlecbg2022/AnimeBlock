'use client';

import { ArrowUpRight } from 'lucide-react';
import { memo } from 'react';
import type { Anime, Language } from '@/lib/types';
import { getAnimeTitle, messages } from '@/lib/i18n';

interface AnimeCellProps {
  anime: Anime;
  lang: Language;
  isWatched: boolean;
  onToggle: (id: string) => void;
  onPreview: (anime: Anime) => void;
  onPreviewEnd: () => void;
  onOpen: (anime: Anime) => void;
}

function AnimeCellComponent({
  anime,
  lang,
  isWatched,
  onToggle,
  onPreview,
  onPreviewEnd,
  onOpen,
}: AnimeCellProps) {
  const t = messages[lang];
  const title = getAnimeTitle(anime, lang);

  if (anime.isBanned) {
    return (
      <div className="cell cell--sealed" aria-disabled="true" title={t.sealedNote}>
        <span className="cell-sealed-text">{t.sealed}</span>
        <span className="cell-sealed-line" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`cell-wrap ${isWatched ? 'is-watched' : ''}`}
      onMouseEnter={() => onPreview(anime)}
      onMouseLeave={onPreviewEnd}
    >
      <button
        type="button"
        className="cell"
        aria-pressed={isWatched}
        aria-label={`${title} · ${isWatched ? t.marked : t.legendUnwatched}`}
        onClick={() => onToggle(anime.id)}
        onFocus={() => onPreview(anime)}
        onBlur={onPreviewEnd}
      >
        <span className="cell-title">{title}</span>
        <span className="cell-corner" aria-hidden="true" />
      </button>

      <button
        type="button"
        className="cell-info"
        aria-label={`${t.openDetails}: ${title}`}
        onClick={(event) => {
          event.stopPropagation();
          onOpen(anime);
        }}
        onFocus={() => onPreview(anime)}
        onBlur={onPreviewEnd}
      >
        <ArrowUpRight size={13} aria-hidden="true" />
      </button>
    </div>
  );
}

export const AnimeCell = memo(
  AnimeCellComponent,
  (previous, next) =>
    previous.anime.id === next.anime.id &&
    previous.isWatched === next.isWatched &&
    previous.lang === next.lang,
);
