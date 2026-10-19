export type PlaybackProvider =
  | 'local'
  | 'direct'
  | 'youtube'
  | 'bilibili'
  | 'vimeo'
  | 'dailymotion';

export interface PlaybackSource {
  kind: 'video' | 'embed';
  provider: PlaybackProvider;
  url: string;
  originalUrl?: string;
  label: string;
  addedAt: number;
}

export type PlaybackParseError = 'invalid' | 'unsupported';

const SOURCE_KEY = 'animeblock.playback.v1';
const POSITION_KEY = 'animeblock.playback.positions.v1';

function readObject<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeObject<T>(key: string, value: Record<string, T>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can be unavailable in private mode.
  }
}

export function loadPlaybackSource(id: string): PlaybackSource | null {
  const sources = readObject<PlaybackSource>(SOURCE_KEY);
  const source = sources[id];
  return source && typeof source.url === 'string' ? source : null;
}

export function savePlaybackSource(id: string, source: PlaybackSource) {
  const sources = readObject<PlaybackSource>(SOURCE_KEY);
  sources[id] = source;
  writeObject(SOURCE_KEY, sources);
}

export function clearPlaybackSource(id: string) {
  const sources = readObject<PlaybackSource>(SOURCE_KEY);
  delete sources[id];
  writeObject(SOURCE_KEY, sources);
}

export function loadPlaybackPosition(id: string): number {
  const positions = readObject<number>(POSITION_KEY);
  const value = Number(positions[id]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function savePlaybackPosition(id: string, seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 1) return;
  const positions = readObject<number>(POSITION_KEY);
  positions[id] = Math.round(seconds);
  writeObject(POSITION_KEY, positions);
}

export function clearPlaybackPosition(id: string) {
  const positions = readObject<number>(POSITION_KEY);
  delete positions[id];
  writeObject(POSITION_KEY, positions);
}

function directVideo(url: URL) {
  return /\.(mp4|webm|ogv|m4v)$/i.test(url.pathname);
}

export function parsePlaybackUrl(
  raw: string,
): { source?: PlaybackSource; error?: PlaybackParseError } {
  const value = raw.trim();
  if (!value) return { error: 'invalid' };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { error: 'invalid' };
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { error: 'invalid' };

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const now = Date.now();

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (id) {
      return {
        source: {
          kind: 'embed',
          provider: 'youtube',
          url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
          originalUrl: url.toString(),
          label: 'YouTube',
          addedAt: now,
        },
      };
    }
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id =
      url.searchParams.get('v') ||
      (['embed', 'shorts', 'live'].includes(parts[0] || '') ? parts[1] : '');
    if (id) {
      return {
        source: {
          kind: 'embed',
          provider: 'youtube',
          url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
          originalUrl: url.toString(),
          label: 'YouTube',
          addedAt: now,
        },
      };
    }
  }

  if (host === 'bilibili.com' || host === 'player.bilibili.com') {
    const bvid =
      url.searchParams.get('bvid') ||
      url.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/i)?.[1] ||
      url.pathname.match(/\/(BV[0-9A-Za-z]+)/i)?.[1];
    if (bvid) {
      return {
        source: {
          kind: 'embed',
          provider: 'bilibili',
          url: `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&autoplay=0&high_quality=1`,
          originalUrl: url.toString(),
          label: 'Bilibili',
          addedAt: now,
        },
      };
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.match(/(\d{5,})/)?.[1];
    if (id) {
      return {
        source: {
          kind: 'embed',
          provider: 'vimeo',
          url: `https://player.vimeo.com/video/${id}`,
          originalUrl: url.toString(),
          label: 'Vimeo',
          addedAt: now,
        },
      };
    }
  }

  if (host === 'dailymotion.com' || host === 'dai.ly') {
    const id =
      host === 'dai.ly'
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.pathname.match(/\/video\/([^/?#]+)/)?.[1];
    if (id) {
      return {
        source: {
          kind: 'embed',
          provider: 'dailymotion',
          url: `https://www.dailymotion.com/embed/video/${encodeURIComponent(id)}`,
          originalUrl: url.toString(),
          label: 'Dailymotion',
          addedAt: now,
        },
      };
    }
  }

  if (directVideo(url)) {
    return {
      source: {
        kind: 'video',
        provider: 'direct',
        url: url.toString(),
        originalUrl: url.toString(),
        label: 'Video URL',
        addedAt: now,
      },
    };
  }

  return { error: 'unsupported' };
}
