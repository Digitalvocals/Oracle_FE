/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  async redirects() {
    return [
      {
        source: '/reddit',
        destination: '/?utm_source=reddit&utm_medium=landing&utm_campaign=reddit_referral',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
