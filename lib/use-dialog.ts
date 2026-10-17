'use client';

import { useEffect, useRef } from 'react';

let lockCount = 0;

function lockBody(): void {
  lockCount += 1;
  if (lockCount === 1) document.body.style.overflow = 'hidden';
}

function unlockBody(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = '';
}

/**
 * Wire a native <dialog> to an `open` prop. Native dialogs give us a focus
 * trap, Escape handling and the top layer for free.
 */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const mountedRef = useRef(true);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      unlockBody();
      if (mountedRef.current) closeRef.current();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      lockBody();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (dialog?.open) dialog.close();
    };
  }, []);

  return ref;
}
