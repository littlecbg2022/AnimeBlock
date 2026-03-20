// 📁 generateData.mjs
import fs from 'fs';

// ⚠️ 把这里换成你第一步申请的 TMDB Read Access Token
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzI3NjdiNjc4ZWVkZDYyNWNjYjBkZDUyYzdmMzQ5ZCIsIm5iZiI6MTc3Mzk5OTI3MC45ODUsInN1YiI6IjY5YmQxNGE2ODQ5NzQ3MDIxNGVhMzg3YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gqdzr3Ixd2AwVGl4ZEb6aRM426uK--C9OINKJ47993E';

const START_YEAR = 2006;
const END_YEAR = 2025;
const ANIME_PER_YEAR = 50; // 每年抓取前 50 部最火的

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchYearAnime(year) {
  console.log(`⏳ 正在抓取 ${year} 年的年度霸权番剧...`);
  let animes = [];
  
  // 抓取前 3 页数据（每页 20 条，共 60 条）
  for (let page = 1; page <= 3; page++) {
    // 💡 关键改动：sort_by=vote_count.desc (按历史总打分人数降序，最能代表真实普及度)
    // 并且加了 vote_count.gte=10 (过滤掉毫无名气的杂鱼番)
    const url = `https://api.themoviedb.org/3/discover/tv?language=zh-CN&sort_by=vote_count.desc&first_air_date.gte=${year}-01-01&first_air_date.lte=${year}-12-31&with_genres=16&with_original_language=ja&vote_count.gte=10&page=${page}`;
    
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      
      if (data.results) {
        animes.push(...data.results);
      }
      await sleep(100); // 礼貌延迟
    } catch (err) {
      console.error(`抓取 ${year} 失败:`, err);
    }
  }

  // 💡 关键改动 2：为了确保万无一失，我们在本地再次根据 vote_count 严格降序排列
  animes.sort((a, b) => b.vote_count - a.vote_count);

  // 截取前 50 部，格式化为你网站需要的数据格式
  return animes.slice(0, ANIME_PER_YEAR).map((anime, index) => {
    // 处理有些番剧没有中文名的问题
    const zhName = anime.name || anime.original_name;
    const jaName = anime.original_name || zhName;
    
    return {
      id: `${year}-${index + 1}`,
      zh: zhName,
      en: jaName, // TMDB Discover不直接给英文名，这里先用原名填充，保证页面不报错
      ja: jaName
    };
  });
}

async function main() {
  const allData = [];

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const list = await fetchYearAnime(year);
    allData.push({ year, list });
  }

  console.log('✅ 所有黄金数据抓取完毕，正在生成 TypeScript 文件...');

  const tsContent = `// 🤖 本文件由脚本自动生成 (基于 TMDB 历史打分人数降序排列)
export type Language = 'zh' | 'en' | 'ja';

export interface Anime {
  id: string;
  zh: string;
  en: string;
  ja: string;
}

export interface YearGroup {
  year: number;
  list: Anime[];
}

export const animeData: YearGroup[] = ${JSON.stringify(allData, null, 2)};

export const totalAnimeCount = animeData.reduce((acc, curr) => acc + curr.list.length, 0);
`;

  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  fs.writeFileSync('./data/animeList.ts', tsContent, 'utf-8');
  
  console.log(`🎉 完美！已成功生成 data/animeList.ts，每年严格按热度排名的 ${ANIME_PER_YEAR} 部番剧已就绪！`);
}

main();