// 📁 refineWithBangumi.mjs
import fs from 'fs';
// 请确保能读取到你现有的数据，如果没法直接 import，可以先存成 json 读取
import { animeData } from './data/animeList_fixed.ts'; // 换成你上一步输出的文件路径

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function refineWithBgm() {
  const fixedData = [];

  for (const group of animeData) {
    const fixedList = [];
    console.log(`\n🚀 正在启动 Bangumi 引擎精修 ${group.year} 年数据...`);

    for (const anime of group.list) {
      // 判定条件：
      // 1. 中文名和日文名一样（完全没翻译）
      // 2. 简介为空或缺省
      // 3. 英文名里带有 Season, Part, 2nd, 3rd 等字眼，但中文名里没有（说明丢了季数）
      const missingTranslation = (anime.zh === anime.ja);
      const missingSummary = (!anime.summary || anime.summary.includes('暂无'));
      const missingSeason = (/(Season|Part|2nd|3rd|4th|II|III)/i.test(anime.en)) && !/(第|篇|季)/.test(anime.zh);

      if (missingTranslation || missingSummary || missingSeason) {
        process.stdout.write(`\r🔍 正在呼叫 Bangumi 修复: ${anime.ja.substring(0, 20)}... `);
        
        // 使用日文原名或英文名在 Bangumi 搜索 (type=2 代表动画)
        const keyword = anime.ja || anime.en;
        const url = `https://api.bgm.tv/search/subject/${encodeURIComponent(keyword)}?type=2&responseGroup=medium&max_results=3`;
        
        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 AnimeDNA/2.0' }
          });
          const data = await res.json();

          if (data.list && data.list.length > 0) {
            // 匹配最接近的一个结果
            const bestMatch = data.list[0];
            
            // 提取带有完美后缀的中文名 (name_cn) 和简介 (summary)
            if (bestMatch.name_cn) {
              anime.zh = bestMatch.name_cn;
            }
            if (bestMatch.summary) {
              anime.summary = bestMatch.summary.replace(/\r\n/g, '\n'); // 清理换行符
            }
            console.log(`✅ 修复成功 -> ${anime.zh}`);
          } else {
            console.log(`⚠️ Bangumi 未命中`);
          }
        } catch (e) {
          console.log(`❌ 接口请求失败`);
        }
        await sleep(1000); // Bangumi 接口比较脆弱，必须留足 1 秒间隔，否则会被封 IP
      }
      fixedList.push(anime);
    }
    fixedData.push({ year: group.year, list: fixedList });
  }

  // 重新写回文件
  const tsContent = `export const animeData = ${JSON.stringify(fixedData, null, 2)};`;
  fs.writeFileSync('./data/animeList_ultimate.ts', tsContent, 'utf-8');
  console.log('\n🎉 终极修复完成！所有的“第X季”和中文简介应该都完美回归了，请查看 data/animeList_ultimate.ts');
}

refineWithBgm();