'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Anime, Language } from '@/lib/types';
import { getAnimeTitle, getTagLabel, messages } from '@/lib/i18n';
import { getLocalizedSummary } from '@/lib/catalog';
import { formatScore } from '@/lib/format';

interface PreviewCardProps {
  anime: Anime;
  lang: Language;
}

export function PreviewCard({ anime, lang }: PreviewCardProps) {
  const t = messages[lang];
  const rating = anime.ratings.anilist ?? anime.ratings.douban ?? anime.ratings.bilibili;
  const summary = getLocalizedSummary(anime, lang);
  const title = getAnimeTitle(anime, lang);

  return (
    <aside className="preview" aria-hidden="true">
      <div className="preview-cover">
        {anime.cover ? (
          <Image
            src={anime.cover}
            alt=""
            width={156}
            height={218}
            sizes="156px"
            className="preview-cover-image"
          />
        ) : (
          <span className="preview-cover-fallback">{anime.zh.slice(0, 1)}</span>
        )}
      </div>

      <div className="preview-body">
        <p className="preview-title">{title}</p>
        {anime.en && anime.en !== title ? (
          <p className="preview-native">{anime.en}</p>
        ) : null}
        <p className="preview-sub">
          {anime.year} · {anime.format}
          {anime.episodes ? ` · ${t.detailEpisodes(anime.episodes)}` : ''}
        </p>

        <div className="preview-row">
          {typeof rating === 'number' ? (
            <span className="preview-rating">
              <Star size={12} fill="currentColor" aria-hidden="true" />
              {formatScore(rating)}
            </span>
          ) : null}
          <span className="preview-tags">
            {anime.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{getTagLabel(tag, lang)}</span>
            ))}
          </span>
        </div>

        {summary ? <p className="preview-summary">{summary.slice(0, 300)}</p> : null}
        <span className="preview-hint">{t.openDetails} ↗</span>
      </div>
    </aside>
  );
}
