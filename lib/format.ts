const intFormatter = new Intl.NumberFormat('en-US');

export function formatInt(value: number): string {
  return intFormatter.format(Math.max(0, Math.round(value)));
}

export function formatScore(value?: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '—';
}

export function padCount(value: number): string {
  return String(Math.max(0, Math.round(value))).padStart(3, '0');
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (part / total) * 100));
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
