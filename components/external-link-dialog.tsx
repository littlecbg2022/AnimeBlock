'use client';

import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { Language } from '@/lib/types';
import { messages } from '@/lib/i18n';
import { useDialog } from '@/lib/use-dialog';

interface ExternalLinkDialogProps {
  url: string | null;
  lang: Language;
  onClose: () => void;
  onConfirm: () => void;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ExternalLinkDialog({ url, lang, onClose, onConfirm }: ExternalLinkDialogProps) {
  const t = messages[lang];
  const ref = useDialog(Boolean(url), onClose);

  return (
    <dialog
      ref={ref}
      className="modal external-dialog"
      aria-labelledby="external-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-panel">
        <div className="external-icon" aria-hidden="true">
          <AlertTriangle size={26} />
        </div>
        <h2 id="external-title">{t.securityTitle}</h2>
        <p className="external-intro">{t.securityIntro}</p>
        {url ? (
          <p className="external-target">
            <span>{t.securityTarget}</span>
            <code>{getHostname(url)}</code>
          </p>
        ) : null}
        <p className="external-body">{t.securityBody}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {t.continue} <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </dialog>
  );
}
