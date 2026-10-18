'use client';

import { useEffect } from 'react';

const CONSOLE_ART =
  '▄▀█ █▄░█ █ █▀▄▀█ █▀▀ █▄▄ █░░ █▀█ █▀▀ █▄▀\n' +
  '█▀█ █░▀█ █ █░▀░█ ██▄ █░█ █▄▄ █▄█ █▄▄ █░█';

let consoleBooted = false;

export function MicroInteractions() {
  useEffect(() => {
    if (!consoleBooted) {
      consoleBooted = true;
      console.log(
        `%c${CONSOLE_ART}`,
        'font:11px/1.25 monospace;color:#2f9e6e;letter-spacing:.02em',
      );
      console.log(
        '%c> loading user preferences...\n> validating otaku DNA... OK.\n> archive terminal ready.',
        'font:11px/1.65 monospace;color:#95a49c',
      );
      console.log(
        '%c你发现了隐藏区域。看来你不仅是个二次元，还是个懂代码的极客。',
        'font:12px/1.7 "Segoe UI","Microsoft YaHei",sans-serif;color:#3d4c45',
      );
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const rippleLayer = document.createElement('div');
    rippleLayer.className = 'click-ripple-layer';
    rippleLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(rippleLayer);

    const onPointerDown = (event: PointerEvent) => {
      if (reduced || event.button !== 0) return;
      const target = event.target as Element | null;
      if (
        !target ||
        target.closest('button, a, input, textarea, select, label, [role="button"], dialog')
      ) {
        return;
      }
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      rippleLayer.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 760);
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });

    let active: HTMLElement | null = null;
    let raf = 0;
    let lastEvent: PointerEvent | null = null;

    const resetMagnetic = () => {
      if (!active) return;
      active.classList.remove('is-magnetic');
      active.style.removeProperty('--mag-x');
      active.style.removeProperty('--mag-y');
      active.style.removeProperty('--mag-r');
      active = null;
    };

    const updateMagnetic = () => {
      raf = 0;
      if (!lastEvent) {
        resetMagnetic();
        return;
      }
      const target = (lastEvent.target as Element | null)?.closest(
        '.cell-wrap, .radar-strip-list button',
      ) as HTMLElement | null;
      if (!target) {
        resetMagnetic();
        return;
      }
      if (active !== target) {
        resetMagnetic();
        active = target;
        active.classList.add('is-magnetic');
      }
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = (lastEvent.clientX - rect.left) / rect.width - 0.5;
      const dy = (lastEvent.clientY - rect.top) / rect.height - 0.5;
      active.style.setProperty('--mag-x', `${(dx * 3.2).toFixed(2)}px`);
      active.style.setProperty('--mag-y', `${(dy * 2.6).toFixed(2)}px`);
      active.style.setProperty('--mag-r', `${(dx * 0.65).toFixed(2)}deg`);
    };

    const onPointerMove = (event: PointerEvent) => {
      lastEvent = event;
      if (!raf) raf = window.requestAnimationFrame(updateMagnetic);
    };

    const onLeave = () => {
      lastEvent = null;
      resetMagnetic();
    };

    if (finePointer && !reduced) {
      document.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
    }

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      resetMagnetic();
      rippleLayer.remove();
    };
  }, []);

  return null;
}
