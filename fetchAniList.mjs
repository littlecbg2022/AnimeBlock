// 📁 generateData.mjs
import fs from 'fs';

// ⚠️ TMDB 的 Token (用于请求中文翻译和简介)
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzI3NjdiNjc4ZWVkZDYyNWNjYjBkZDUyYzdmMzQ5ZCIsIm5iZiI6MTc3Mzk5OTI3MC45ODUsInN1YiI6IjY5YmQxNGE2ODQ5NzQ3MDIxNGVhMzg3YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gqdzr3Ixd2AwVGl4ZEb6aRM426uK--C9OINKJ47993E';

const START_YEAR = 2006;
const END_YEAR = 2025;
const ANIME_PER_YEAR = 50;

// 🚫 赛博封印名单 (只要命中关键词，彻底封杀交互)
const BANNED_KEYWORDS = ["Boku no Hero Academia", "My Hero Academia", "我的英雄学院"];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 工具函数：用 TMDB 搜索中文名和简介 ---
async function fetchTMDBLocalization(queryName, year) {
  // 使用 TMDB 的搜索接口，指定中文返回
  const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(queryName)}&first_air_date_year=${year}&language=zh-CN`;
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN}` }
    });
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // 返回匹配到的第一个结果的中文名和简介
      return {
        zhName: data.results[0].name,
        summary: data.results[0].overview
      };
    }
  } catch (e) {
    console.error(`TMDB 搜索失败: ${queryName}`, e);
  }
  return null; // 没搜到就返回 null
}

// --- 核心流程：抓取 AniList 并融合 TMDB ---
async function fetchYearAnimeFused(year) {
  console.log(`\n⏳ 正在抓取 ${year} 年权威榜单 (AniList)...`);
  
  const query = `
    query ($year: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(seasonYear: $year, type: ANIME, sort: POPULARITY_DESC, format_in: [TV, TV_SHORT]) {
          id
          title { romaji english native }
          coverImage { extraLarge }
          genres
          tags { name rank }
          averageScore
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { year: year, perPage: ANIME_PER_YEAR } })
    });
    
    const data = await res.json();
    const mediaList = data.data.Page.media;

    let processedAnimes = [];

    for (let i = 0; i < mediaList.length; i++) {
      const anime = mediaList[i];
      const jaName = anime.title.native || anime.title.romaji;
      const enName = anime.title.english || anime.title.romaji;
      const searchName = anime.title.romaji; // 用罗马音去 TMDB 搜索命中率最高

      process.stdout.write(`\r🔍 正在向 TMDB 请求翻译: ${searchName.substring(0, 20)}... [${i+1}/${mediaList.length}]`);

      // 💡 融合 TMDB 数据
      const tmdbData = await fetchTMDBLocalization(searchName, year);
      await sleep(100); // 礼貌延迟，保护 TMDB 接口

      // 如果 TMDB 搜到了中文名就用，搜不到就拿原名兜底
      const finalZhName = tmdbData?.zhName || jaName;
      const finalSummary = tmdbData?.summary || '暂无中文剧情简介。';

      // 🚫 赛博封印判定
      const isBanned = BANNED_KEYWORDS.some(keyword => 
        enName.includes(keyword) || searchName.includes(keyword) || finalZhName.includes(keyword)
      );

      // 提取核心英文标签
      const topTags = anime.tags.filter(tag => tag.rank >= 60).map(tag => tag.name).slice(0, 4);
      const combinedTags = [...new Set([...anime.genres, ...topTags])];

      processedAnimes.push({
        id: anime.id.toString(),
        zh: finalZhName,
        en: enName,
        ja: jaName,
        cover: anime.coverImage.extraLarge || '',
        tags: combinedTags, // 完美的英文硬核标签 (如: "Isekai", "Psychological")
        summary: finalSummary,
        rating: anime.averageScore ? anime.averageScore / 10 : 0,
        isBanned: isBanned
      });
    }

    return processedAnimes;
  } catch (error) {
    console.error(`❌ ${year} 年数据处理崩溃:`, error);
    return [];
  }
}

async function main() {
  const allData = [];

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const list = await fetchYearAnimeFused(year);
    allData.push({ year, list });
  }

  const tsContent = `// 🤖 本文件由数据融合引擎生成 (AniList 元数据 + TMDB 本地化)
export type Language = 'zh' | 'en' | 'ja';

export interface Anime {
  id: string;
  zh: string;
  en: string;
  ja: string;
  cover: string;
  tags: string[];      // 英文硬核 ACG 标签
  summary: string;     // 中文 TMDB 剧情简介
  rating: number;      // AniList 权威十分制评分
  isBanned: boolean;   // 🚫 赛博封印标识
}

export interface YearGroup {
  year: number;
  list: Anime[];
}

export const animeData: YearGroup[] = ${JSON.stringify(allData, null, 2)};
export const totalAnimeCount = animeData.reduce((acc, curr) => acc + curr.list.length, 0);
`;

  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  fs.writeFileSync('./data/animeList_2.ts', tsContent, 'utf-8');
  
  console.log(`\n🎉 完美融合！AniList 的灵魂 + TMDB 的翻译，神级数据库构建完毕！`);
}

main();