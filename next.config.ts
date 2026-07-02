/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api-bcv-binance-tracker.vercel.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;