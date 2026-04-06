// 📁 next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 你的原有配置，保持不变
  allowedDevOrigins: ['192.168.177.1', 'localhost'],

  // 💡 2.0 新增：解锁 AniList 的图片域名，启用 Next.js 的高阶图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // 允许的 AniList 图像服务器
        pathname: '/**',           // 允许该域名下的所有路径
      },
    ],
  },
};

export default nextConfig;