// lib/api.ts
const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TOKEN}`
  }
};

// 获取近期热门的日本动漫（且必须是中文数据）
export async function getTrendingAnime() {
  // with_genres=16 是动画，with_original_language=ja 是日本
  const res = await fetch(
    `${BASE_URL}/discover/tv?language=zh-CN&sort_by=popularity.desc&with_genres=16&with_original_language=ja&page=1`,
    options
  );
  const data = await res.json();
  return data.results;
}

export function getImageUrl(path: string, size = 'w500') {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}