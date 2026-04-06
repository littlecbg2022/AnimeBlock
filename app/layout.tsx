// 📁 app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

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
    // 💡 加上 suppressHydrationWarning，无视浏览器插件的干扰
    <html lang="zh" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}