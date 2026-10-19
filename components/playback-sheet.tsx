'use client';

import { useEffect, useRef, useState } from 'react';
import { Link2, PlayCircle, Upload, X } from 'lucide-react';
import type { Anime, Language } from '@/lib/types';
import { messages } from '@/lib/i18n';
import { useDialog } from '@/lib/use-dialog';
import {
  clearPlaybackPosition,
  clearPlaybackSource,
  loadPlaybackPosition,
  loadPlaybackSource,
  parsePlaybackUrl,
  savePlaybackPosition,
  savePlaybackSource,
  type PlaybackSource,
} from '@/lib/playback';

interface PlaybackSheetProps {
  anime: Anime | null;
  lang: Language;
  onClose: () => void;
}

export function PlaybackSheet({ anime, lang, onClose }: PlaybackSheetProps) {
  const t = messages[lang];
  const ref = useDialog(Boolean(anime), onClose);
  const [savedSource, setSavedSource] = useState<PlaybackSource | null>(() =>
    anime ? loadPlaybackSource(anime.id) : null,
  );
  const [localSource, setLocalSource] = useState<PlaybackSource | null>(null);
  const [editing, setEditing] = useState(() => {
    if (!anime) return false;
    return !loadPlaybackSource(anime.id);
  });
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileUrlRef = useRef<string | null>(null);
  const lastSaveRef = useRef(0);

  const activeSource = localSource || savedSource;

  useEffect(
    () => () => {
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    },
    [],
  );

  function selectFile(file: File | undefined) {
    if (!file) return;
    const isVideo =
      file.type.startsWith('video/') || /\.(mp4|webm|ogv|m4v|mov)$/i.test(file.name);
    if (!isVideo) {
      setError(t.playUnsupported);
      return;
    }
    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    const url = URL.createObjectURL(file);
    fileUrlRef.current = url;
    setLocalSource({
      kind: 'video',
      provider: 'local',
      url,
      label: file.name,
      addedAt: Date.now(),
    });
    setEditing(false);
    setError(null);
    setResumed(false);
  }

  function addUrl() {
    const result = parsePlaybackUrl(draft);
    if (result.error || !result.source) {
      setError(result.error === 'invalid' ? t.playInvalid : t.playUnsupported);
      return;
    }
    if (!anime) return;
    savePlaybackSource(anime.id, result.source);
    setSavedSource(result.source);
    setLocalSource(null);
    setEditing(false);
    setDraft('');
    setError(null);
    setResumed(false);
  }

  function clearSource() {
    if (anime) {
      clearPlaybackSource(anime.id);
      clearPlaybackPosition(anime.id);
    }
    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }
    setSavedSource(null);
    setLocalSource(null);
    setEditing(true);
    setDraft('');
    setError(null);
    setResumed(false);
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video || !anime) return;
    const position = loadPlaybackPosition(anime.id);
    if (position > 3 && position < video.duration - 5) {
      video.currentTime = position;
      setResumed(true);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !anime) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 5000) return;
    lastSaveRef.current = now;
    savePlaybackPosition(anime.id, video.currentTime);
  }

  function handlePause() {
    const video = videoRef.current;
    if (video && anime) savePlaybackPosition(anime.id, video.currentTime);
  }

  function handleEnded() {
    if (anime) clearPlaybackPosition(anime.id);
    setResumed(false);
  }

  return (
    <dialog
      ref={ref}
      className="modal player-dialog"
      aria-labelledby="player-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {anime ? (
        <div className="modal-panel player-panel">
          <button type="button" className="sheet-close" onClick={onClose} aria-label={t.close}>
            <X size={18} aria-hidden="true" />
          </button>

          <header className="modal-head player-head">
            <p className="eyebrow">{t.playKicker}</p>
            <h2 id="player-title">{t.playTitle}</h2>
            <p className="dim">
              {anime.zh} / {anime.year}
            </p>
          </header>

          {activeSource ? (
            <>
              <div className="player-stage">
                {activeSource.kind === 'video' ? (
                  <video
                    key={activeSource.url}
                    ref={videoRef}
                    src={activeSource.url}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onPause={handlePause}
                    onEnded={handleEnded}
                  />
                ) : (
                  <iframe
                    key={activeSource.url}
                    src={activeSource.url}
                    title={`${anime.zh} · ${activeSource.label}`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                )}
              </div>
              <p className="player-meta">
                <span>{activeSource.label}</span>
                {activeSource.provider === 'local' ? <span>{t.playLocalOnly}</span> : null}
                {activeSource.provider !== 'local' && activeSource.kind === 'embed' ? (
                  <span>{t.playEmbedNote}</span>
                ) : null}
                {resumed ? <span className="player-resumed">{t.playResume}</span> : null}
              </p>
              <div className="player-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing((value) => !value)}
                >
                  {t.playChange}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearSource}>
                  {t.playClear}
                </button>
                {activeSource.originalUrl ? (
                  <a
                    className="btn btn-ghost btn-sm"
                    href={activeSource.originalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {t.playOpenSource}
                  </a>
                ) : null}
              </div>
            </>
          ) : (
            <p className="player-empty">{t.playNoSource}</p>
          )}

          {editing || !activeSource ? (
            <div className="player-form">
              <p className="player-intro">{t.playIntro}</p>
              <div className="player-field player-file-row">
                <div>
                  <span className="player-field-label">{t.playLocal}</span>
                  <p className="player-hint">{t.playLocalHint}</p>
                </div>
                <label className="btn btn-ghost btn-sm player-file-label">
                  <Upload size={13} aria-hidden="true" />
                  {t.playLocal}
                  <input
                    type="file"
                    accept="video/*"
                    className="visually-hidden"
                    onChange={(event) => selectFile(event.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="player-field">
                <label className="player-field-label" htmlFor="player-url">
                  <Link2 size={13} aria-hidden="true" /> {t.playUrl}
                </label>
                <div className="player-url-row">
                  <input
                    id="player-url"
                    type="url"
                    inputMode="url"
                    className="player-input"
                    value={draft}
                    placeholder={t.playUrlPlaceholder}
                    spellCheck={false}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') addUrl();
                    }}
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={addUrl}>
                    <PlayCircle size={13} aria-hidden="true" />
                    {t.playAdd}
                  </button>
                </div>
              </div>

              {error ? <p className="player-error">{error}</p> : null}
            </div>
          ) : null}

          <p className="player-legal">{t.playLegal}</p>
        </div>
      ) : null}
    </dialog>
  );
}
