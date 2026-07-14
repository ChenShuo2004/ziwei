/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  outputFileTracingRoot: __dirname,
  transpilePackages: ['lunar-javascript'],
};

module.exports = nextConfig;
