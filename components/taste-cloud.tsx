'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { messages } from '@/lib/i18n';
import { buildTasteTags, type TagMood } from '@/lib/taste';
import type { Language } from '@/lib/types';

interface TasteCloudProps {
  watched: Set<string>;
  lang: Language;
  activeTag: string | null;
  open: boolean;
  onToggle: () => void;
  onTag: (tag: string) => void;
}

type LegendKey =
  | 'tasteLegendHeal'
  | 'tasteLegendDark'
  | 'tasteLegendAction'
  | 'tasteLegendWorld'
  | 'tasteLegendCharacter'
  | 'tasteLegendCraft';

const LEGEND: Array<{ mood: TagMood; key: LegendKey }> = [
  { mood: 'heal', key: 'tasteLegendHeal' },
  { mood: 'dark', key: 'tasteLegendDark' },
  { mood: 'action', key: 'tasteLegendAction' },
  { mood: 'world', key: 'tasteLegendWorld' },
  { mood: 'character', key: 'tasteLegendCharacter' },
  { mood: 'craft', key: 'tasteLegendCraft' },
];

export function TasteCloud({ watched, lang, activeTag, open, onToggle, onTag }: TasteCloudProps) {
  const t = messages[lang];
  const tags = useMemo(() => buildTasteTags(watched, lang), [watched, lang]);
  const maxWeight = tags[0]?.weight || 1;

  return (
    <section className={`taste-cloud ${open ? 'is-open' : ''}`} aria-labelledby="taste-title">
      <header className="taste-cloud-head">
        <div>
          <p className="eyebrow">{t.tasteKicker}</p>
          <h2 id="taste-title">{t.tasteTitle}</h2>
        </div>
        <div className="taste-cloud-meta">
          <span>{t.tasteBasedOn(watched.size)}</span>
          <button
            type="button"
            className="taste-toggle"
            aria-expanded={open}
            aria-controls="taste-body"
            aria-label={t.tasteToggle}
            onClick={onToggle}
          >
            <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="taste-cloud-body" id="taste-body">
          {tags.length ? (
            <>
              <div className="taste-tags">
                {tags.map((tag) => {
                  const size = 11 + Math.sqrt(tag.weight / maxWeight) * 19;
                  const heavy = tag.weight / maxWeight > 0.55;
                  return (
                    <button
                      key={tag.tag}
                      type="button"
                      className={`taste-tag taste-tag--${tag.mood} ${
                        activeTag === tag.tag ? 'is-active' : ''
                      }`}
                      style={{ fontSize: `${size}px`, fontWeight: heavy ? 700 : 600 }}
                      data-count={t.tasteWatchedCount(tag.count)}
                      title={t.tasteWatchedCount(tag.count)}
                      aria-pressed={activeTag === tag.tag}
                      aria-label={`#${tag.label} · ${t.tasteWatchedCount(tag.count)}`}
                      onClick={() => onTag(tag.tag)}
                    >
                      <span className="taste-hash" aria-hidden="true">
                        #
                      </span>
                      {tag.label}
                    </button>
                  );
                })}
              </div>
              <div className="taste-legend" aria-hidden="true">
                {LEGEND.map((item) => (
                  <span key={item.mood}>
                    <i className={`taste-mood-dot taste-mood-dot--${item.mood}`} />
                    {t[item.key]}
                  </span>
                ))}
              </div>
              <p className="taste-cloud-hint">{t.tasteHint}</p>
            </>
          ) : (
            <p className="taste-empty">{t.tasteEmpty}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
