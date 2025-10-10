/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
  },
  // Для Docker деплоя
  output: 'standalone',
}

module.exports = nextConfig

