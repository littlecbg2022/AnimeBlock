// 📁 app/page.tsx
'use client';

import { useState, useEffect, useMemo, FC } from 'react';
import Image from 'next/image'; 
import { animeData } from '@/data/animeList_ultimate'; 
import { Sparkles, Loader2, ChevronDown, ChevronUp, X, Star, ExternalLink, AlertTriangle, Eye } from 'lucide-react';

/* =========================================
   类型声明与常量
========================================= */
export type Language = 'zh' | 'en' | 'ja';
export interface Anime { id: string; zh: string; en: string; ja: string; cover: string; tags: string[]; summary: string; rating: number; isBanned: boolean; }
const totalAnimeCount = animeData.reduce((acc: number, curr: any) => acc + curr.list.length, 0);

/* =========================================
   🛠️ 本地化 AI 推荐引擎 (Jaccard Similarity + 去重)
========================================= */
function calculateRecommendations(watchedIds: Set<string>, allData: typeof animeData): string[] {
  if (watchedIds.size === 0) return [];
  const allAnimeFlat = allData.flatMap(g => g.list);
  const watchedAnimeList = allAnimeFlat.filter(a => watchedIds.has(a.id) && !a.isBanned);
  if (watchedAnimeList.length === 0) return [];

  const userTagFreq: Record<string, number> = {};
  watchedAnimeList.forEach(anime => {
    anime.tags.forEach(tag => { userTagFreq[tag] = (userTagFreq[tag] || 0) + 1; });
  });

  const userFavoriteTags = new Set(Object.entries(userTagFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(entry => entry[0]));

  const candidates = allAnimeFlat
    .filter(a => !watchedIds.has(a.id) && !a.isBanned)
    .map(anime => {
      const animeTags = new Set(anime.tags);
      const intersection = new Set([...userFavoriteTags].filter(t => animeTags.has(t)));
      const union = new Set([...userFavoriteTags, ...animeTags]);
      const score = union.size === 0 ? 0 : intersection.size / union.size;
      return { zh: anime.zh, score };
    });

  // 💡 修复：利用 Set 进行中文名去重，保证推荐结果不重样
  const uniqueTitles = new Set<string>();
  const finalRecommendations: string[] = [];

  // 按照得分降序排序后，依次塞入去重数组，直到满 5 个为止
  for (const c of candidates.sort((a, b) => b.score - a.score)) {
    if (!uniqueTitles.has(c.zh)) {
      uniqueTitles.add(c.zh);
      finalRecommendations.push(c.zh);
    }
    if (finalRecommendations.length === 5) break;
  }

  return finalRecommendations;
}

/* =========================================
   🧱 核心基础格子组件 (使用纯净 CSS 类名)
========================================= */
const AnimeCell: FC<{ 
  anime: Anime; 
  lang: Language; 
  isWatched: boolean; 
  onToggleWatched: () => void; 
  onOpenDetail: () => void;     
}> = ({ anime, lang, isWatched, onToggleWatched, onOpenDetail }) => {
  
  if (anime.isBanned) {
    return (
      <div className="anime-cell banned-cell group">
        <span className="banned-text text-center">[ DATA<br/>EXPUNGED ]</span>
      </div>
    );
  }

  return (
    <div 
      className={`anime-cell group ${isWatched ? "cell-selected" : "cell-unselected"}`} 
      onClick={onToggleWatched}
    >
      <span className="cell-text">{anime[lang]}</span>

      <div className="anime-hover-card transition-all">
        {anime.cover && (
          <div className="absolute inset-0 z-0 w-full h-full hover-card-image">
            <Image src={anime.cover} alt={anime.zh} fill sizes="150px" className="object-cover" priority={false} />
          </div>
        )}

        {/* 💡 使用纯净的 CSS 类，按钮绝对会在右上角 */}
        <button className="cell-decrypt-btn" onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}>
          <Eye size={12} />
        </button>

        <div className="hover-card-text-overlay">
          <span className="hover-card-title">{anime[lang]}</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================
   💡 帅气版详情视窗 (移除了左下得分，右侧新增动态五星进度条)
========================================= */
const DetailWindow: FC<{ anime: Anime | null; lang: Language; onClose: () => void; onWatch: () => void; }> = ({ anime, lang, onClose, onWatch }) => {
  if (!anime) return null;

  // 🆕 核心计算逻辑：将 10 分制映射到 5 个物理星星的填充百分比
  // 得分 8.4 = 4个满星星(100%) + 1个填充20%的星星。
  const render5StarProgressBar = (rating: number) => {
    const starUnits = [];
    for (let i = 1; i <= 5; i++) {
      // 当前星星的得分阈值上限 (2, 4, 6, 8, 10)
      const threshold = i * 2; 
      const lowerLimit = threshold - 2;
      let fillWidthPercent = 0;

      if (rating >= threshold) {
        fillWidthPercent = 100; // 得分超过上限，满填充
      } else if (rating > lowerLimit && rating < threshold) {
        // 得分落在当前星星范围内，计算局部填充比
        fillWidthPercent = ((rating - lowerLimit) / 2) * 100;
      } else {
        fillWidthPercent = 0; // 得分未达范围，不填充
      }

      starUnits.push(
        <div key={i} className="star-unit">
          {/* 背景灰色星星 */}
          <Star size={24} fill="currentColor" />
          {/* 绝对定位的黄色填充星星，通过 width 控制进度 */}
          <div className="star-fill" style={{ width: `${fillWidthPercent}%` }}>
            <Star size={24} fill="currentColor" />
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1">
        <h4 className="modal-info-header">权威观众得分</h4>
        <div className="flex gap-1.5 pt-0.5">
          {starUnits}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-backdrop-clean" onClick={onClose}>
      
      <div className="detail-modal-box" onClick={(e) => e.stopPropagation()}>
        
        <button className="modal-close-btn" onClick={onClose}>
          <X size={22} />
        </button>

        {/* 左侧：大海报区 (宽度 40%，移除了左下的评分) */}
        <div className="relative w-[40%] h-full shrink-0 bg-slate-900">
          {anime.cover && (
            <Image 
              src={anime.cover} alt={anime.zh} fill 
              className="object-cover object-center" 
              sizes="(max-width: 768px) 40vw, 400px" 
            />
          )}
          {/* 底部渐变改为纯装饰性 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 右侧：帅气资料排版区 (宽度 60%) */}
        <div className="flex-1 w-[60%] p-8 md:p-10 flex flex-col overflow-y-auto no-scrollbar bg-white">
          
          <div className="pr-10"> 
            <h2 className="text-2xl md:text-3xl font-black leading-tight text-slate-900 tracking-tight">{anime.zh}</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2 font-mono">{anime.ja} | {anime.en}</p>
          </div>

          {/* 🆕 帅气的五星得分进度条板块 */}
          <div className="modal-rating-block pt-6">
            {render5StarProgressBar(anime.rating)}
            <div className="text-right rating-score-info">
              {/* 这里保留数字展示以便确认精准得分 */}
              <span className="text-3xl font-black text-slate-950 tabular-nums">{anime.rating}</span>
              <span className="text-slate-400 font-medium text-xs block">Authority / 10</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-6">
            {anime.tags.map(tag => (
              <span key={tag} className="cyber-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-6 flex-1">
            <h4 className="modal-info-header">档案简介</h4>
            <p className="modal-summary-text">{anime.summary}</p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button 
              onClick={onWatch} 
              className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-cyan-500 text-white hover:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_5px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_5px_20px_rgba(6,182,212,0.5)] active:scale-95 text-sm md:text-base tracking-wide"
            >
              <ExternalLink size={18} /> 启动 OmoFun 协议
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

/* =========================================
   安全警告 Modal Component
========================================= */
const SecurityModal: FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const handleConfirm = () => { window.open('https://omofun01.xyz/', '_blank'); onClose(); };
  return (
    <div className="modal-backdrop z-[200]" onClick={onClose}>
      <div className="security-modal-content space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 text-amber-500 bg-amber-50 p-4 rounded-xl border border-amber-200">
          <AlertTriangle size={48} className="shrink-0" />
          <div><h3 className="text-lg font-bold text-amber-950">外链安全提醒</h3><p className="text-sm text-amber-800 mt-0.5">您即将离开本站，前往第三方资源网站。</p></div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed px-1">本站仅作为个人补番记录工具，不存储任何视频文件。目标网站（omofun）的内容、广告及安全性与本站无关，请注意保护个人隐私和网络安全。</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">取消</button>
          <button onClick={handleConfirm} className="flex-1 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-3 rounded-xl transition">继续前往</button>
        </div>
      </div>
    </div>
  );
};

/* =========================================
   📅 表格行组件
========================================= */
const YearRow = ({ group, lang, watchedIds, toggleWatched, onOpenDetail }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayList = isExpanded ? group.list : group.list.slice(0, 20);
  const hasMore = group.list.length > 20;

  return (
    <div className="table-flex-row">
      <div className="year-col-wrapper"><div className="year-cell">{group.year}</div></div>
      <div className="anime-grid-wrapper">
        {displayList.map((anime: Anime) => (
          <AnimeCell
            key={anime.id} anime={anime} lang={lang}
            isWatched={watchedIds.has(anime.id)}
            onToggleWatched={() => toggleWatched(anime.id)} // 传递打卡逻辑
            onOpenDetail={() => onOpenDetail(anime)} // 传递详情逻辑
          />
        ))}
      </div>
      {hasMore ? (
        <div className="action-col-wrapper" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
        </div>
      ) : <div className="action-col-empty" />}
    </div>
  );
};

/* =========================================
   🚀 主页面布局 (ANIME-BLOCK 2.0)
========================================= */
export default function AnimeTracker() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [selectedAnimeForDetail, setSelectedAnimeForDetail] = useState<Anime | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('watchedAnime');
    if (saved) setWatchedIds(new Set(JSON.parse(saved)));
    setMounted(true);
  }, []);

  const aiRecommendations = useMemo(() => {
    if (!mounted) return [];
    return calculateRecommendations(watchedIds, animeData);
  }, [watchedIds, mounted]);

  const toggleWatched = (id: string) => {
    const newWatched = new Set(watchedIds);
    if (newWatched.has(id)) newWatched.delete(id); else newWatched.add(id);
    setWatchedIds(newWatched);
    localStorage.setItem('watchedAnime', JSON.stringify(Array.from(newWatched)));
  };

  if (!mounted) return <div className="page-bg min-h-screen" />;
  const progressPercentage = (watchedIds.size / totalAnimeCount) * 100;
  const sortedAnimeData = [...animeData].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    // 当弹窗打开时，阻止背景滚动
    <div className={`page-bg min-h-screen pb-12 ${selectedAnimeForDetail ? 'overflow-hidden h-screen' : ''}`}>
      <div className="top-dashboard">
        <div className="text-center mb-10">
          <h1 className="main-title">ANIME<span className="accent-color">BLOCK</span></h1>
          <p className="sub-title">极简补番矩阵</p>
        </div>
        <div className="control-panel">
          <div className="lang-switch">
            {(['zh', 'en', 'ja'] as Language[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`lang-btn ${lang === l ? 'lang-btn-active' : ''}`}>{l === 'zh' ? '中文' : l === 'en' ? 'English' : '日本語'}</button>
            ))}
          </div>
          <div className="stats-card">
            <div className="stats-header">
              <span>完成度统计</span>
              <span className="stats-number"><span className="accent-color">{watchedIds.size}</span> / {totalAnimeCount}</span>
            </div>
            <div className="progress-track"><div className="progress-bar" style={{ width: `${progressPercentage}%` }} /></div>
          </div>
          <div className="radar-card relative">
            <div className="radar-header mb-1">
              <span className="radar-title"><Sparkles size={16} className="accent-color" /> 本地 AI 雷达</span>
              <span className="text-xs text-slate-400 font-mono">基于标签偏好</span>
            </div>
            {aiRecommendations.length > 0 ? (
              <div className="radar-result pt-1 space-y-px">
                {aiRecommendations.map((title, i) => (
                  <p key={title} className="radar-result-item line-clamp-1"><span className="text-cyan-600 font-bold mr-1.5">{i+1}.</span>{title}</p>
                ))}
              </div>
            ) : <div className="text-center text-sm text-slate-400 pt-3">请打卡几部番剧，<br/>雷达即可启动...</div>}
          </div>
        </div>
      </div>

      <div className="giant-matrix-table">
        {sortedAnimeData.map((group) => (
          <YearRow 
            key={group.year} group={group} lang={lang} watchedIds={watchedIds} 
            toggleWatched={toggleWatched} 
            onOpenDetail={(anime: Anime) => setSelectedAnimeForDetail(anime)} 
          />
        ))}
      </div>

      {/* 💡 替换后的新版居中弹窗 */}
      <DetailWindow 
        anime={selectedAnimeForDetail} lang={lang} 
        onClose={() => setSelectedAnimeForDetail(null)}
        onWatch={() => setIsSecurityModalOpen(true)}
      />

      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />

      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}