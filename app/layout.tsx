// 📁 app/layout.tsx
import type { Metadata } from 'next'
import './globals.css' // 👈 就是这一行！极其重要，缺少它就没有任何样式

export const metadata: Metadata = {
  title: 'Anime Block | 补番记录台',
  description: '极简的个人补番矩阵',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}