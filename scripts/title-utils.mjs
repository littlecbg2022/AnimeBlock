const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

const TITLE_OVERRIDES = new Map([
  ['162983', '不死少女的杀人闹剧'],
  ['106918', '君主·埃尔梅罗二世事件簿 魔眼收集列车 Grace note'],
  ['97769', '结城友奈是勇者 勇者之章'],
  ['19363', '银之匙 第二季'],
  ['6377', '忏·再见绝望先生'],
  ['3228', '俗·再见绝望先生'],
  ['124395', '宇崎学妹想要玩！ 第二季'],
  ['109261', '五等分的新娘 第二季'],
  ['120209', '转生恶役只好拔除破灭旗标X'],
  ['112124', '期待在地下城邂逅有错吗 第三季'],
  ['101167', '期待在地下城邂逅有错吗 第二季'],
  ['21180', '路人女主的养成方法 第二季'],
  ['20996', '银魂 第三季'],
  ['20801', '元气少女缘结神 第二季'],
  ['20448', '妄想学生会 第二季'],
  ['12403', '摇曳百合 第二季'],
  ['146065', '无职转生 第二季 ～到了异世界就拿出真本事～'],
  ['178789', '无职转生 第三季 ～到了异世界就拿出真本事～'],
  ['104462', '某科学的超电磁炮T'],
  ['16049', '某科学的超电磁炮S'],
  ['6213', '某科学的超电磁炮'],
  ['21776', '小林家的龙女仆'],
  ['98659', '欢迎来到实力至上主义的教室'],
  ['97994', '属性咖啡厅'],
  ['98506', '此花亭奇谭'],
  ['20770', '晨曦公主'],
  ['11887', '恋爱随意链接'],
  ['17895', '金色时光'],
  ['14397', '花牌情缘 第二季'],
  ['10800', '花牌情缘'],
  ['12365', '食梦者。3'],
  ['10030', '食梦者。2'],
  ['7674', '食梦者'],
  ['14513', '魔笛MAGI'],
  ['18115', '魔笛MAGI 第二季'],
  ['21710', '夏目友人帐 第五季'],
  ['97983', '夏目友人帐 第六季'],
  ['5300', '夏目友人帐 第二季'],
  ['21631', '乌冬面之国的金色毛球'],
  ['21715', '灼热乒乓妹'],
  ['20912', '吹响吧！上低音号'],
  ['877', 'NANA'],
  ['969', '翼·年代记 第二季'],
  ['6030', 'NEEDLESS'],
  ['3594', '提亚拉之泪'],
  ['4981', '再造人卡辛'],
  ['2985', '魔人侦探食脑奈罗'],
  ['2369', '出租魔法使'],
  ['98820', 'Just Because!'],
  ['14467', 'K'],
  ['10163', '[C]'],
]);


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
    const override = TITLE_OVERRIDES.get(String(item.id));
    item.zh = override || String(item.zh || '').replace(/[-－—–]+$/u, '').trim();
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
