const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

function toChineseNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return String(value);
  if (number <= 10) return CHINESE_NUMBERS[number];
  if (number < 20) return `十${CHINESE_NUMBERS[number - 10]}`;
  return String(number);
}

function parseChineseNumber(value) {
  if (/^\d+$/.test(value)) return Number(value);
  const index = CHINESE_NUMBERS.indexOf(value);
  return index > 0 ? index : null;
}

function titleMarkers(title) {
  const text = String(title || '');
  const season =
    text.match(/\bseason\s*(\d+)\b/i)?.[1] ||
    text.match(/\b(\d+)(?:st|nd|rd|th)\s+season\b/i)?.[1] ||
    text.match(/\bS(\d+)\b/i)?.[1] ||
    text.match(/第\s*([一二三四五六七八九十\d]+)\s*季/)?.[1];
  const part =
    text.match(/\bpart[.\s]*(\d+)\b/i)?.[1] ||
    text.match(/\bcour\s*(\d+)\b/i)?.[1] ||
    text.match(/第\s*([一二三四五六七八九十\d]+)\s*(?:部分|クール)/)?.[1];
  return {
    season: season ? parseChineseNumber(season) : null,
    part: part ? parseChineseNumber(part) : null,
  };
}

function suffixFor(item) {
  const english = titleMarkers(item.en);
  const japanese = titleMarkers(item.ja);
  const season = english.season || japanese.season;
  const part = english.part || japanese.part;
  const parts = [];
  if (season) parts.push(`第${toChineseNumber(season)}季`);
  if (part) parts.push(`第${toChineseNumber(part)}部分`);
  return parts.join(' ');
}

function alignChineseSeason(item) {
  const zh = String(item.zh || '');
  const markers = titleMarkers(item.en);
  const japanese = titleMarkers(item.ja);
  const season = markers.season || japanese.season;
  if (!season) return zh;
  const match = zh.match(/第\s*([一二三四五六七八九十\d]+)\s*季/);
  if (!match) return zh;
  const current = parseChineseNumber(match[1]);
  if (current === season) return zh;
  return zh.replace(/第\s*[一二三四五六七八九十\d]+\s*季/, `第${toChineseNumber(season)}季`);
}

export function fixChineseTitles(groups) {
  const all = groups.flatMap((group) => group.items);

  for (const item of all) {
    item.zh = alignChineseSeason(item);
  }

  const byTitle = new Map();
  for (const item of all) {
    const key = String(item.zh || '').trim();
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key).push(item);
  }

  for (const items of byTitle.values()) {
    if (items.length < 2) continue;
    const ordered = [...items].sort(
      (a, b) => Number(a.year) - Number(b.year) || Number(a.id) - Number(b.id),
    );
    const base = ordered.find((item) => !suffixFor(item));
    for (const item of ordered) {
      if (item === base) continue;
      const suffix = suffixFor(item);
      const addition = suffix || `（${item.year}）`;
      if (!String(item.zh).includes(suffix || `（${item.year}）`)) {
        item.zh = `${item.zh} ${addition}`;
      }
    }
  }

  return groups;
}
