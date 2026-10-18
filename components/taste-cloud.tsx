'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { messages } from '@/lib/i18n';
import { buildTasteProfile, type TagMood, type TastePersona, type TasteTag } from '@/lib/taste';
import type { Language } from '@/lib/types';

interface HeroTasteCloudProps {
  watched: Set<string>;
  lang: Language;
}

interface CloudWord {
  key: string;
  label: string;
  persona: boolean;
  size: number;
  mood: TagMood;
  rotate: boolean;
}

interface PositionedWord extends CloudWord {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  rotated: boolean;
}

const FONT_FAMILY =
  '"Segoe UI", "Inter", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';

function layoutCloud(words: CloudWord[], width: number, height: number): PositionedWord[] {
  if (typeof document === 'undefined' || width < 80 || height < 80) return [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const placed: Array<{ x: number; y: number; w: number; h: number }> = [];
  const result: PositionedWord[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const gap = 4;

  for (const word of words) {
    let found = false;
    for (let attempt = 0; attempt < 3 && !found; attempt += 1) {
      const fontSize = Math.max(8, word.size - attempt * 1.3);
      const fontWeight = word.persona ? 650 : 600;
      ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
      const textWidth = Math.ceil(ctx.measureText(word.label).width);
      const textHeight = Math.ceil(fontSize * 1.16);
      const rotated = word.rotate && !word.persona;
      const padX = word.persona ? 22 : 9;
      const padY = word.persona ? 12 : 7;
      const boxWidth = (rotated ? textHeight : textWidth) + padX;
      const boxHeight = (rotated ? textWidth : textHeight) + padY;

      if (boxWidth > width - 10 || boxHeight > height - 10) continue;

      for (let step = 0; step < 1900; step += 1) {
        const progress = step / 1900;
        const radius = Math.sqrt(progress) * Math.min(width, height) * 0.93;
        const angle = step * 0.38;
        const x = cx + Math.cos(angle) * radius * (width / height) * 0.62 - boxWidth / 2;
        const y = cy + Math.sin(angle) * radius * 0.82 - boxHeight / 2;

        if (x < 2 || y < 2 || x + boxWidth > width - 2 || y + boxHeight > height - 2) {
          continue;
        }

        const collision = placed.some(
          (box) =>
            !(
              x + boxWidth + gap < box.x ||
              x > box.x + box.w + gap ||
              y + boxHeight + gap < box.y ||
              y > box.y + box.h + gap
            ),
        );
        if (collision) continue;

        placed.push({ x, y, w: boxWidth, h: boxHeight });
        result.push({ ...word, x, y, w: boxWidth, h: boxHeight, fontSize, rotated });
        found = true;
        break;
      }
    }
  }

  return result;
}

function makeTagWord(tag: TasteTag, maxWeight: number, index: number): CloudWord {
  return {
    key: `tag-${tag.tag}`,
    label: tag.label,
    persona: false,
    size: 9.5 + Math.sqrt(tag.weight / maxWeight) * 10.5,
    mood: tag.mood,
    rotate: index % 6 === 2 && tag.label.length <= 6,
  };
}

function makePersonaWord(persona: TastePersona, compact: boolean): CloudWord {
  return {
    key: `persona-${persona.key}`,
    label: persona.label,
    persona: true,
    size: compact ? 24 : 30,
    mood: 'craft',
    rotate: false,
  };
}

export function HeroTasteCloud({ watched, lang }: HeroTasteCloudProps) {
  const t = messages[lang];
  const fieldRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 560, height: 210 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = fieldRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBox({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    const frame = window.requestAnimationFrame(() => {
      measure();
      setReady(true);
    });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const profile = useMemo(() => buildTasteProfile(watched, lang), [watched, lang]);
  const persona = profile.personas[0] ?? null;

  const words = useMemo(() => {
    const compact = box.width < 470;
    const target = box.width < 470 ? 28 : box.width < 560 ? 32 : 35;
    const tagCount = persona ? target - 1 : target;
    const maxWeight = profile.tags[0]?.weight || 1;
    const tagWords = profile.tags
      .slice(0, tagCount)
      .map((tag, index) => makeTagWord(tag, maxWeight, index));
    return persona
      ? [makePersonaWord(persona, compact), ...tagWords]
      : tagWords;
  }, [profile, persona, box.width]);

  const positioned = useMemo(
    () => (ready ? layoutCloud(words, box.width, box.height) : []),
    [ready, words, box.width, box.height],
  );

  return (
    <section className="hero-cloud" aria-label={t.tasteCloudLabel}>
      <p className="hero-cloud-kicker">{t.tasteCloudLabel}</p>
      <div className="hero-cloud-field" ref={fieldRef}>
        <span className="hero-cloud-glow" aria-hidden="true" />
        {positioned.map((word) => (
          <span
            key={word.key}
            className={`cloud-word ${word.persona ? 'cloud-word--persona' : `cloud-word--${word.mood}`} ${
              word.rotated ? 'is-vertical' : ''
            }`}
            style={{
              left: word.rotated ? `${word.x + word.w / 2}px` : `${word.x}px`,
              top: word.rotated ? `${word.y + word.h / 2}px` : `${word.y}px`,
              fontSize: `${word.fontSize}px`,
              transform: word.rotated ? 'translate(-50%, -50%) rotate(90deg)' : undefined,
            }}
          >
            {word.persona ? (
              <span className="cloud-spark" aria-hidden="true">
                ✦
              </span>
            ) : (
              <span className="cloud-hash" aria-hidden="true">
                #
              </span>
            )}
            {word.label}
          </span>
        ))}
        {!positioned.length ? <p className="hero-cloud-empty">{t.tasteEmpty}</p> : null}
      </div>
    </section>
  );
}
