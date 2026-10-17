import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANIMEBLOCK — 补番档案',
  description: '2006—2026，每年 50 部动画的个人补番矩阵、进度记录与可解释推荐。',
  applicationName: 'ANIMEBLOCK',
  keywords: ['ANIMEBLOCK', 'anime', '补番', '动画', '番剧', '追番', '推荐'],
  authors: [{ name: 'LittleCabbage2022' }],
  openGraph: {
    title: 'ANIMEBLOCK — 补番档案',
    description: '2006—2026，每年 50 部动画的个人补番矩阵与可解释推荐。',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'ANIMEBLOCK',
  },
  twitter: {
    card: 'summary',
    title: 'ANIMEBLOCK — 补番档案',
    description: '2006—2026，每年 50 部动画的个人补番矩阵与可解释推荐。',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f8f3',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
