import { allAnime } from './catalog';
import { getTagLabel } from './i18n';
import type { Language } from './types';

export type TagMood = 'heal' | 'dark' | 'action' | 'world' | 'character' | 'craft';

export interface TasteTag {
  tag: string;
  label: string;
  count: number;
  weight: number;
  mood: TagMood;
}

const HIDDEN_TAGS = new Set(['Hentai', 'Explicit']);

const CURATED_TAGS = new Set([
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
  'Isekai',
  'Magic',
  'School',
  'Military',
  'Historical',
  'Space',
  'Demons',
  'Gods',
  'Vampire',
  'Mythology',
  'Time Travel',
  'Time Manipulation',
  'Post-Apocalyptic',
  'Dystopian',
  'Cyberpunk',
  'Steampunk',
  'Urban Fantasy',
  'Dungeon',
  'Aliens',
  'Robots',
  'Artificial Intelligence',
  'Virtual World',
  'Video Games',
  'Otaku Culture',
  'Idol',
  'Band',
  'School Club',
  'Work',
  'Family',
  'Parenthood',
  'Friendship',
  'Coming of Age',
  'Female Protagonist',
  'Male Protagonist',
  'Ensemble Cast',
  'Found Family',
  'LGBTQ+ Themes',
  'Harem',
  'Reverse Harem',
  'Love Triangle',
  'Tsundere',
  'Gyaru',
  'Kuudere',
  'Yandere',
  'Villainess',
  'Reincarnation',
  'Super Power',
  'Martial Arts',
  'Samurai',
  'Ninja',
  'Assassins',
  'Espionage',
  'Police',
  'Superhero',
  'Anti-Hero',
  'Detective',
  'War',
  'Crime',
  'Revenge',
  'Gore',
  'Survival',
  'Grief',
  'Tragedy',
  'Iyashikei',
  'Cute Girls Doing Cute Things',
  'CGI',
  'Full CGI',
  'Experimental',
  'Avant Garde',
  'Meta',
  'Parody',
  'Satire',
  'Episodic',
  'Anthology',
  'Surreal Comedy',
  'Gag Humor',
  'Adaptation',
  'Manga',
  'Light Novel',
  'Visual Novel',
  'Original Work',
  '4-Koma',
]);

const GENERIC_TAGS = new Set([
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Supernatural',
  'School',
  'Shounen',
  'Seinen',
  'Shoujo',
]);

const CAST_TAGS = new Set([
  'Ensemble Cast',
  'Female Protagonist',
  'Male Protagonist',
  'Primarily Adult Cast',
  'Primarily Female Cast',
  'Primarily Male Cast',
  'Primarily Teen Cast',
]);

const MOODS: Record<TagMood, Set<string>> = {
  heal: new Set([
    'Slice of Life',
    'Iyashikei',
    'Cute Girls Doing Cute Things',
    'Cooking',
    'Food',
    'Music',
    'Band',
    'Family',
    'Pets',
    'Countryside',
    'Episodic',
    'Coming of Age',
    'School',
    'School Club',
    'Childcare',
    'Parenthood',
    'Camping',
    'Hiking',
    'Idol',
  ]),
  dark: new Set([
    'Tragedy',
    'Psychological',
    'Horror',
    'Thriller',
    'Death',
    'War',
    'Crime',
    'Suicide',
    'Grief',
    'Abuse',
    'Dystopian',
    'Gore',
    'Torture',
    'Massacre',
    'Genocide',
    'Drugs',
    'Trauma',
    'PTSD',
    'Depression',
    'Revenge',
    'Body Horror',
    'Survival',
  ]),
  action: new Set([
    'Action',
    'Adventure',
    'Battle',
    'Super Power',
    'Martial Arts',
    'Mecha',
    'Sports',
    'Military',
    'Swordplay',
    'Guns',
    'Superhero',
    'Real Robot',
    'Super Robot',
    'Tournament',
    'Assassins',
    'Ninja',
    'Samurai',
    'Police',
    'Espionage',
  ]),
  world: new Set([
    'Fantasy',
    'Isekai',
    'Magic',
    'Sci-Fi',
    'Cyberpunk',
    'Space',
    'Supernatural',
    'Demons',
    'Gods',
    'Mythology',
    'Time Travel',
    'Time Manipulation',
    'Post-Apocalyptic',
    'Steampunk',
    'Dungeon',
    'Aliens',
    'Robots',
    'Artificial Intelligence',
    'Virtual World',
    'Historical',
    'Urban Fantasy',
    'Reincarnation',
    'Villainess',
  ]),
  character: new Set([
    'Romance',
    'Drama',
    'Comedy',
    'Female Protagonist',
    'Male Protagonist',
    'Ensemble Cast',
    'LGBTQ+ Themes',
    'Harem',
    'Reverse Harem',
    'Love Triangle',
    'Coming of Age',
    'School',
    'Delinquents',
    'Nakama',
    'Found Family',
    'Primarily Female Cast',
    'Primarily Male Cast',
    'Primarily Teen Cast',
    'Primarily Adult Cast',
    'Family',
    'Parenthood',
    'Friendship',
    'Work',
    'Idol',
    'Band',
    'Otaku Culture',
    'Ecchi',
    'Mature',
    'Tsundere',
    'Gyaru',
    'Kuudere',
    'Yandere',
  ]),
  craft: new Set([
    'CGI',
    'Full CGI',
    'Rotoscoping',
    'Stop Motion',
    'Anthology',
    'Experimental',
    'Avant Garde',
    'Parody',
    'Satire',
    'Meta',
    'Episodic',
    'Adaptation',
    'Original Work',
    'Manga',
    'Light Novel',
    'Visual Novel',
    'Game',
    '4-Koma',
    'Cinematography',
    'Animation',
  ]),
};

const MOOD_PATTERNS: Array<[TagMood, RegExp]> = [
  ['heal', /iyashikei|slice of life|cute girls|cooking|food|music|family|pets?|countryside|coming of age|school|childcare|parenthood|idol/i],
  ['dark', /tragedy|psycholog|horror|thriller|death|war|crime|suicide|grief|abuse|dystop|gore|torture|massacre|genocide|trauma|depress|revenge|survival/i],
  ['action', /action|adventure|battle|super power|martial|mecha|sport|military|sword|gun|superhero|robot|tournament|assassin|ninja|samurai|police|espionage/i],
  ['world', /fantasy|isekai|magic|sci-fi|cyberpunk|space|supernatural|demon|god|myth|time travel|time manipulation|post-apocal|steampunk|dungeon|alien|artificial intelligence|virtual world|historical|urban fantasy|reincarnation|villainess/i],
  ['character', /romance|drama|comedy|protagonist|ensemble|lgbt|harem|love|school|delinquent|family|friendship|work|idol|band|otaku|ecchi|mature|tsundere|gyaru|kuudere|yandere/i],
  ['craft', /cgi|rotoscop|stop motion|anthology|experimental|avant|parody|satire|meta|episodic|adaptation|original|manga|light novel|visual novel|game|4-koma|cinematography|animation/i],
];

export function getTagMood(tag: string): TagMood {
  for (const [mood, tags] of Object.entries(MOODS) as Array<[TagMood, Set<string>]>) {
    if (tags.has(tag)) return mood;
  }
  for (const [mood, pattern] of MOOD_PATTERNS) {
    if (pattern.test(tag)) return mood;
  }
  return 'craft';
}

function tagWeight(tag: string, count: number) {
  if (CAST_TAGS.has(tag)) return count * 0.4;
  if (GENERIC_TAGS.has(tag)) return count * 0.55;
  return count;
}

export function buildTasteTags(watched: Set<string>, lang: Language, limit = 44): TasteTag[] {
  if (!watched.size) return [];

  const counts = new Map<string, number>();
  for (const anime of allAnime) {
    if (!watched.has(anime.id) || anime.isBanned) continue;
    const tags = new Set([...anime.tags, ...anime.genres]);
    for (const tag of tags) {
      if (HIDDEN_TAGS.has(tag) || !CURATED_TAGS.has(tag)) continue;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({
      tag,
      label: getTagLabel(tag, lang),
      count,
      weight: tagWeight(tag, count),
      mood: getTagMood(tag),
    }))
    .sort(
      (a, b) =>
        b.weight - a.weight ||
        b.count - a.count ||
        a.label.localeCompare(b.label, lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh-Hans-CN' : 'en'),
    )
    .slice(0, limit);
}
