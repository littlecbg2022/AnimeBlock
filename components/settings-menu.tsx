'use client';

import { useRef, useState } from 'react';
import { Download, FileJson, Trash2, Upload, X } from 'lucide-react';
import type { Language } from '@/lib/types';
import { messages } from '@/lib/i18n';
import { useDialog } from '@/lib/use-dialog';

interface SettingsMenuProps {
  open: boolean;
  lang: Language;
  ids: string[];
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void | Promise<void>;
  onClear: () => void;
}

export function SettingsMenu({
  open,
  lang,
  ids,
  onClose,
  onExport,
  onImport,
  onClear,
}: SettingsMenuProps) {
  const t = messages[lang];
  const ref = useDialog(open, onClose);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <dialog
      ref={ref}
      className="modal settings-dialog"
      aria-labelledby="settings-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={() => setConfirmReset(false)}
    >
      <div className="modal-panel">
        <button type="button" className="sheet-close" onClick={onClose} aria-label={t.close}>
          <X size={18} aria-hidden="true" />
        </button>

        <header className="modal-head">
          <p className="eyebrow">{t.settingsKicker}</p>
          <h2 id="settings-title">{t.settingsTitle}</h2>
          <p className="dim">
            {ids.length} {t.titles} · {t.settingsVersion}
          </p>
        </header>

        <div className="settings-body">
          <section className="settings-row">
            <div>
              <h3>
                <Download size={14} aria-hidden="true" /> {t.settingsExport}
              </h3>
              <p>{t.settingsExportHint}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onExport}>
              {t.settingsExport}
            </button>
          </section>

          <section className="settings-row">
            <div>
              <h3>
                <Upload size={14} aria-hidden="true" /> {t.settingsImport}
              </h3>
              <p>{t.settingsImportHint}</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => inputRef.current?.click()}
            >
              {t.settingsImport}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onImport(file);
                event.target.value = '';
              }}
            />
          </section>

          <section className="settings-row settings-row--danger">
            <div>
              <h3>
                <Trash2 size={14} aria-hidden="true" /> {t.settingsReset}
              </h3>
              <p>{t.settingsResetHint}</p>
            </div>
            <button
              type="button"
              className={`btn btn-sm ${confirmReset ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => {
                if (confirmReset) {
                  onClear();
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                }
              }}
            >
              {confirmReset ? t.settingsResetConfirm : t.settingsReset}
            </button>
          </section>

          <section className="settings-sources">
            <h3>
              <FileJson size={14} aria-hidden="true" /> {t.settingsSources}
            </h3>
            <div className="link-row">
              <a href="https://anilist.co" target="_blank" rel="noreferrer noopener">
                AniList
              </a>
              <a
                href="https://github.com/bangumi-data/bangumi-data"
                target="_blank"
                rel="noreferrer noopener"
              >
                bangumi-data
              </a>
              <a href="https://www.bilibili.com/anime/" target="_blank" rel="noreferrer noopener">
                Bilibili
              </a>
              <a href="https://movie.douban.com/" target="_blank" rel="noreferrer noopener">
                豆瓣
              </a>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  );
}
