// 📁 app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { animeData, totalAnimeCount, Language } from '@/data/animeList';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

/* =========================================
   🧱 动画格子组件
========================================= */
const AnimeCell = ({ name, isWatched, onClick }: { name: string; isWatched: boolean; onClick: () => void }) => {
  return (
    <div className={`anime-cell ${isWatched ? "cell-selected" : "cell-unselected"}`} onClick={onClick}>
      <span className="cell-text">{name}</span>
    </div>
  );
};

/* =========================================
   📅 表格行组件 (12列网格系统核心)
========================================= */
const YearRow = ({ group, lang, watchedIds, toggleWatched }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 核心逻辑：默认展示 20 个（2行），展开后展示全部
  const displayList = isExpanded ? group.list : group.list.slice(0, 20);
  const hasMore = group.list.length > 20;

  // 计算当前这一年占据了多少行 (每行 10 个番剧)
  const rowCount = Math.ceil(displayList.length / 10) || 1;

  return (
    <div className="table-grid-row">
      
      {/* 1. 第一列：年份 (占据第一格，但外壳跨越所有行，阻挡后续番剧掉入第一列) */}
      <div className="year-col-wrapper" style={{ gridRow: `1 / span ${rowCount}` }}>
        <div className="year-cell">
          {group.year}
        </div>
      </div>

      {/* 2. 中间十列：番剧格子 (利用 CSS Grid 的自动流，它们会自动在第2列到第11列之间排列) */}
      {displayList.map((anime: any) => (
        <AnimeCell
          key={anime.id}
          name={anime[lang]}
          isWatched={watchedIds.has(anime.id)}
          onClick={() => toggleWatched(anime.id)}
        />
      ))}

      {/* 3. 最后一列：下拉操作区 (跨越所有行) */}
      {hasMore ? (
        <div 
          className="action-col-wrapper" 
          style={{ gridRow: `1 / span ${rowCount}` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={36} /> : <ChevronDown size={36} />}
        </div>
      ) : (
        // 如果该年份少于20个，用空壳占位，保持阵列完整
        <div className="action-col-empty" style={{ gridRow: `1 / span ${rowCount}` }} />
      )}

    </div>
  );
};

/* =========================================
   🚀 主页面
========================================= */
export default function AnimeTracker() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('watchedAnime');
    if (saved) setWatchedIds(new Set(JSON.parse(saved)));
    setMounted(true);
  }, []);

  const toggleWatched = (id: string) => {
    const newWatched = new Set(watchedIds);
    if (newWatched.has(id)) newWatched.delete(id);
    else newWatched.add(id);
    setWatchedIds(newWatched);
    localStorage.setItem('watchedAnime', JSON.stringify(Array.from(newWatched)));
  };

  const handleRecommend = () => {
    if (watchedIds.size === 0) return alert("请先打卡几部番剧！");
    setIsRecommending(true);
    setRecommendation(null);
    setTimeout(() => {
      setIsRecommending(false);
      setRecommendation("根据品味，系统强烈推荐：《命运石之门》");
    }, 1500);
  };

  if (!mounted) return <div className="page-bg min-h-screen" />;

  const progressPercentage = (watchedIds.size / totalAnimeCount) * 100;
  
  // 年份倒序：最近的年份在最上面
  const sortedAnimeData = [...animeData].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <div className="page-bg min-h-screen pb-12">
      {/* 顶部仪表盘 */}
      <div className="top-dashboard">
        <div className="text-center mb-10">
          <h1 className="main-title">ANIME<span className="accent-color">BLOCK</span></h1>
          <p className="sub-title">补番格子</p>
        </div>

        <div className="control-panel">
          <div className="lang-switch">
            {(['zh', 'en', 'ja'] as Language[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`lang-btn ${lang === l ? 'lang-btn-active' : ''}`}>
                {l === 'zh' ? '中文' : l === 'en' ? 'English' : '日本語'}
              </button>
            ))}
          </div>

          <div className="stats-card">
            <div className="stats-header">
              <span>完成度统计</span>
              <span className="stats-number"><span className="accent-color">{watchedIds.size}</span> / {totalAnimeCount}</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="radar-card">
            {!recommendation ? (
              <div className="radar-header">
                <span className="radar-title"><Sparkles size={16} className="accent-color" /> 补番雷达</span>
                <button onClick={handleRecommend} disabled={isRecommending} className="radar-btn">
                  {isRecommending ? <Loader2 className="animate-spin" size={14} /> : '一键生成'}
                </button>
              </div>
            ) : (
              <div className="radar-result">{recommendation}</div>
            )}
          </div>
        </div>
      </div>

      {/* 巨型矩阵表格 */}
      <div className="giant-matrix-table">
        {sortedAnimeData.map((group) => (
          <YearRow 
            key={group.year} group={group} lang={lang} 
            watchedIds={watchedIds} toggleWatched={toggleWatched} 
          />
        ))}
      </div>
    </div>
  );
}