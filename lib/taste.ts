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

export interface TastePersona {
  key: string;
  label: string;
  tag: string;
  count: number;
  score: number;
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

interface PersonaDef {
  key: string;
  tags: string[];
  label: Record<Language, string>;
}

const PERSONAS: PersonaDef[] = [
  {
    key: 'isekai',
    tags: ['Isekai', 'Reincarnation'],
    label: {
      zh: '资深异世界厕纸品鉴师',
      en: 'Isekai connoisseur, paper-grade',
      ja: '異世界なろう紙質鑑定士',
    },
  },
  {
    key: 'angst',
    tags: ['Tragedy', 'Psychological', 'Grief', 'Dystopian'],
    label: {
      zh: '致郁系防御点满的人',
      en: 'Tragedy-armored optimist',
      ja: '鬱展開防御力カンスト勢',
    },
  },
  {
    key: 'healing',
    tags: ['Iyashikei', 'Slice of Life', 'Cute Girls Doing Cute Things'],
    label: {
      zh: '日常废萌充电站',
      en: 'Slice-of-life charging station',
      ja: '日常・萌え充電スタンド',
    },
  },
  {
    key: 'mecha',
    tags: ['Mecha', 'Real Robot', 'Super Robot'],
    label: {
      zh: '机战参数党',
      en: 'Mecha spec-sheet partisan',
      ja: 'ロボット設定厨',
    },
  },
  {
    key: 'ensemble',
    tags: ['Ensemble Cast', 'Found Family'],
    label: {
      zh: '群像观察员',
      en: 'Ensemble-cast observer',
      ja: '群像劇ウォッチャー',
    },
  },
  {
    key: 'romance',
    tags: ['Romance', 'Love Triangle'],
    label: {
      zh: '恋爱脑但嘴硬',
      en: 'Romance-brain, in denial',
      ja: '恋愛脳のツンデレ',
    },
  },
  {
    key: 'source',
    tags: ['Adaptation', 'Manga', 'Light Novel'],
    label: {
      zh: '原作党潜伏中',
      en: 'Source-material sleeper agent',
      ja: '原作勢の潜伏者',
    },
  },
  {
    key: 'cgdct',
    tags: ['Cute Girls Doing Cute Things', 'Iyashikei'],
    label: {
      zh: '废萌结界常住居民',
      en: 'CGDCT bubble resident',
      ja: '空気系結界の住人',
    },
  },
  {
    key: 'action',
    tags: ['Action', 'Super Power', 'Battle'],
    label: {
      zh: '三分钟热血循环',
      en: 'Three-minute hype loop',
      ja: '3分熱血ループ',
    },
  },
  {
    key: 'cyber',
    tags: ['Cyberpunk', 'Sci-Fi', 'Artificial Intelligence'],
    label: {
      zh: '赛博精神逃犯',
      en: 'Cyber-escaped fugitive',
      ja: '電脳世界の逃亡者',
    },
  },
  {
    key: 'mystery',
    tags: ['Mystery', 'Detective', 'Thriller'],
    label: {
      zh: '推理病栋常驻',
      en: 'Mystery ward resident',
      ja: '推理病棟の常駐者',
    },
  },
  {
    key: 'horror',
    tags: ['Horror', 'Gore', 'Body Horror'],
    label: {
      zh: '深夜恐怖片耐受者',
      en: 'Midnight horror enjoyer',
      ja: '深夜ホラー耐性者',
    },
  },
  {
    key: 'sports',
    tags: ['Sports', 'Tournament'],
    label: {
      zh: '运动番计分员',
      en: 'Sports anime scorekeeper',
      ja: 'スポーツ番の記録係',
    },
  },
  {
    key: 'music',
    tags: ['Music', 'Band', 'Idol'],
    label: {
      zh: '动画歌单考古学家',
      en: 'Anime OST archaeologist',
      ja: 'アニソン考古学者',
    },
  },
  {
    key: 'school',
    tags: ['School', 'School Club', 'Coming of Age'],
    label: {
      zh: '青春校园不动产',
      en: 'School-life real estate',
      ja: '青春学園の住人',
    },
  },
  {
    key: 'historical',
    tags: ['Historical', 'Samurai', 'Military'],
    label: {
      zh: '历史课代表',
      en: 'History class representative',
      ja: '歴史クラス委員',
    },
  },
  {
    key: 'crime',
    tags: ['Crime', 'Police', 'Espionage'],
    label: {
      zh: '犯罪心理侧写员',
      en: 'Crime profiler',
      ja: '犯罪プロファイラー',
    },
  },
  {
    key: 'scifi',
    tags: ['Sci-Fi', 'Space', 'Robots', 'Artificial Intelligence'],
    label: {
      zh: '科幻设定考据党',
      en: 'Sci-fi lore pedant',
      ja: 'SF設定考証勢',
    },
  },
  {
    key: 'fantasy',
    tags: ['Mythology', 'Gods', 'Demons', 'Vampire'],
    label: {
      zh: '神话考据癖',
      en: 'Mythology lore keeper',
      ja: '神話考証マニア',
    },
  },
  {
    key: 'world',
    tags: ['Urban Fantasy', 'Steampunk', 'Post-Apocalyptic', 'Dystopian'],
    label: {
      zh: '世界观设定党',
      en: 'Worldbuilding partisan',
      ja: '世界観設定派',
    },
  },
  {
    key: 'harem',
    tags: ['Harem', 'Reverse Harem', 'Love Triangle'],
    label: {
      zh: '后宫编制办主任',
      en: 'Harem HR director',
      ja: 'ハーレム人事部長',
    },
  },
  {
    key: 'tsundere',
    tags: ['Tsundere', 'Gyaru', 'Kuudere', 'Yandere'],
    label: {
      zh: '傲娇翻译官',
      en: 'Tsundere interpreter',
      ja: 'ツンデレ通訳',
    },
  },
  {
    key: 'villainess',
    tags: ['Villainess', 'Reincarnation'],
    label: {
      zh: '恶役千金观察员',
      en: 'Villainess watcher',
      ja: '悪役令嬢ウォッチャー',
    },
  },
  {
    key: 'time',
    tags: ['Time Travel', 'Time Manipulation'],
    label: {
      zh: '时间线修理工',
      en: 'Timeline mechanic',
      ja: 'タイムライン修理工',
    },
  },
  {
    key: 'cgi',
    tags: ['CGI', 'Full CGI'],
    label: {
      zh: 'CG 质检员',
      en: 'CG quality control',
      ja: 'CG検品係',
    },
  },
  {
    key: 'food',
    tags: ['Cooking', 'Food'],
    label: {
      zh: '深夜食堂常客',
      en: 'Late-night diner regular',
      ja: '深夜食堂の常連',
    },
  },
  {
    key: 'family',
    tags: ['Family', 'Parenthood', 'Found Family'],
    label: {
      zh: '家庭伦理观察员',
      en: 'Found-family observer',
      ja: '家族観察員',
    },
  },
];

const GENERIC_PERSONA: PersonaDef = {
  key: 'generic',
  tags: [],
  label: {
    zh: '深夜补番惯犯',
    en: 'Late-night binge recidivist',
    ja: '深夜視聴の常習犯',
  },
};

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

function collectCounts(watched: Set<string>) {
  const counts = new Map<string, number>();
  for (const anime of allAnime) {
    if (!watched.has(anime.id) || anime.isBanned) continue;
    const tags = new Set([...anime.tags, ...anime.genres]);
    for (const tag of tags) {
      if (HIDDEN_TAGS.has(tag)) continue;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return counts;
}

function makePersona(def: PersonaDef, counts: Map<string, number>, watched: number, lang: Language): TastePersona {
  const rank = def.tags
    .map((tag) => ({ tag, count: counts.get(tag) || 0 }))
    .sort((a, b) => b.count - a.count);
  const count = rank.reduce((sum, item) => sum + item.count, 0);
  return {
    key: def.key,
    label: def.label[lang],
    tag: rank.find((item) => item.count > 0)?.tag || '',
    count,
    score: count / Math.max(1, watched),
  };
}

export function buildTasteProfile(
  watched: Set<string>,
  lang: Language,
  tagLimit = 60,
): { tags: TasteTag[]; personas: TastePersona[] } {
  if (!watched.size) return { tags: [], personas: [] };

  const counts = collectCounts(watched);
  const tags = [...counts.entries()]
    .filter(([tag]) => CURATED_TAGS.has(tag))
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
    .slice(0, tagLimit);

  const usedTags = new Set<string>();
  const personas = PERSONAS.map((def) => makePersona(def, counts, watched.size, lang))
    .filter((persona) => persona.count > 0 && persona.tag)
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .filter((persona) => {
      if (usedTags.has(persona.tag)) return false;
      usedTags.add(persona.tag);
      return true;
    })
    .slice(0, 1);

  if (personas.length < 1) {
    personas.push(makePersona(GENERIC_PERSONA, counts, watched.size, lang));
  }

  return { tags, personas: personas.slice(0, 1) };
}

export function buildTasteTags(watched: Set<string>, lang: Language, limit = 44): TasteTag[] {
  return buildTasteProfile(watched, lang, limit).tags;
}
