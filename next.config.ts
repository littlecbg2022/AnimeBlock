import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const isCustomDomain = process.env.GITHUB_PAGES_CUSTOM_DOMAIN === 'true';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages && !isCustomDomain ? '/AnimeBlock' : '',
  trailingSlash: isGitHubPages ? true : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.177.1', 'localhost'],
  images: {
    unoptimized: isGitHubPages,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
