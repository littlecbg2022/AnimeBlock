// 📁 refineData.mjs
import fs from 'fs';
// 注意：你需要先把你之前的 ts 文件内容转成 json，或者直接读取生成的 data/animeList.ts 
// 这里为了方便，建议先手动把你 TS 文件里的数据部分复制出来存为 animeData.json，或者用正则提取
import { animeData } from './data/animeList_2.ts'; // 确保你的环境支持直接 import ts 的编译产物

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzI3NjdiNjc4ZWVkZDYyNWNjYjBkZDUyYzdmMzQ5ZCIsIm5iZiI6MTc3Mzk5OTI3MC45ODUsInN1YiI6IjY5YmQxNGE2ODQ5NzQ3MDIxNGVhMzg3YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gqdzr3Ixd2AwVGl4ZEb6aRM426uK--C9OINKJ47993E';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fixMissingInfo() {
  const fixedData = [];

  for (const group of animeData) {
    const fixedList = [];
    console.log(`\n🛠️ 正在检查 ${group.year} 年的数据...`);

    for (const anime of group.list) {
      // 判定标准：中文名和日文名一样，或者简介是默认的空值
      const isMissingZh = (anime.zh === anime.ja);
      const isMissingSummary = (anime.summary === '暂无中文剧情简介。' || !anime.summary);

      if (isMissingZh || isMissingSummary) {
        console.log(`🔍 尝试修复: ${anime.en}`);
        
        // 尝试用英文名搜索，通常 TMDB 对英文名的命中率是最高的
        const searchUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(anime.en)}&first_air_date_year=${group.year}&language=zh-CN`;
        
        try {
          const res = await fetch(searchUrl, {
            headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN}` }
          });
          const data = await res.json();

          if (data.results && data.results.length > 0) {
            const bestMatch = data.results[0];
            anime.zh = bestMatch.name || anime.zh;
            anime.summary = bestMatch.overview || anime.summary;
            console.log(`✅ 已修复: ${anime.zh}`);
          } else {
            // 如果带年份搜不到，尝试去掉年份限制（有些番剧年份录入有误）
            const searchUrlNoYear = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(anime.en)}&language=zh-CN`;
            const res2 = await fetch(searchUrlNoYear, {
              headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN}` }
            });
            const data2 = await res2.json();
            if (data2.results && data2.results.length > 0) {
              anime.zh = data2.results[0].name || anime.zh;
              anime.summary = data2.results[0].overview || anime.summary;
              console.log(`✅ 已修复 (不带年份): ${anime.zh}`);
            }
          }
        } catch (e) {
          console.error(`修复失败: ${anime.en}`, e);
        }
        await sleep(200); // 礼貌频率
      }
      fixedList.push(anime);
    }
    fixedData.push({ year: group.year, list: fixedList });
  }

  // 重新写回文件
  const tsContent = `export const animeData = ${JSON.stringify(fixedData, null, 2)};`;
  fs.writeFileSync('./data/animeList_fixed.ts', tsContent, 'utf-8');
  console.log('\n🎉 修复完成！请查看 data/animeList_fixed.ts');
}

fixMissingInfo();