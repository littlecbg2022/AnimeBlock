'use client';

import { Dices, EyeOff, Radar, Search, Settings2, X } from 'lucide-react';
import type { RefObject } from 'react';
import type { Language } from '@/lib/types';
import { languageLabels, messages } from '@/lib/i18n';
import { formatInt, padCount } from '@/lib/format';

interface SiteHeaderProps {
  lang: Language;
  onLang: (lang: Language) => void;
  query: string;
  onQuery: (query: string) => void;
  onlyUnwatched: boolean;
  onToggleUnwatched: () => void;
  watchedCount: number;
  total: number;
  progress: number;
  hasRecommendations: boolean;
  onRandom: () => void;
  onRadar: () => void;
  onSettings: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
}

export function SiteHeader({
  lang,
  onLang,
  query,
  onQuery,
  onlyUnwatched,
  onToggleUnwatched,
  watchedCount,
  total,
  progress,
  hasRecommendations,
  onRandom,
  onRadar,
  onSettings,
  searchRef,
}: SiteHeaderProps) {
  const t = messages[lang];

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#archive" aria-label="ANIMEBLOCK">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy">
            <strong>ANIMEBLOCK</strong>
            <small>{t.brandSub}</small>
          </span>
        </a>

        <div className="header-progress" aria-label={t.progressLabel}>
          <div className="header-progress-numbers">
            <strong>{padCount(watchedCount)}</strong>
            <span>/ {formatInt(total)}</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="search">
          <Search size={15} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            spellCheck={false}
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => onQuery('')}
              aria-label={t.searchClear}
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <kbd aria-hidden="true">/</kbd>
          )}
        </div>

        <div className="header-actions">
          <button
            type="button"
            className={`chip ${onlyUnwatched ? 'is-active' : ''}`}
            aria-pressed={onlyUnwatched}
            aria-label={t.filterUnwatched}
            onClick={onToggleUnwatched}
            title={t.filterUnwatched}
          >
            <EyeOff size={13} aria-hidden="true" />
            <span className="chip-label">{t.filterUnwatched}</span>
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onRandom}
            aria-label={t.random}
            title={t.random}
            data-tooltip={t.random}
          >
            <Dices size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="icon-btn radar-trigger"
            onClick={onRadar}
            aria-label={t.radar}
            title={t.radar}
            data-tooltip={t.radar}
          >
            <Radar size={16} aria-hidden="true" />
            {hasRecommendations ? <span className="status-dot" aria-hidden="true" /> : null}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onSettings}
            aria-label={t.settings}
            title={t.settings}
            data-tooltip={t.settings}
          >
            <Settings2 size={16} aria-hidden="true" />
          </button>

          <div className="lang-switch" role="group" aria-label={t.language}>
            {(['zh', 'en', 'ja'] as Language[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`lang-btn ${lang === value ? 'is-active' : ''}`}
                aria-pressed={lang === value}
                onClick={() => onLang(value)}
                title={languageLabels[value]}
              >
                {value === 'zh' ? '中' : value === 'en' ? 'EN' : '日'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
