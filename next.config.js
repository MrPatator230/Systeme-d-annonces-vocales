/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    serverActions: true,
  },
  // Configure webpack for ffmpeg-static
  webpack: (config, { isServer }) => {
    // Add ffmpeg-static to externals
    if (isServer) {
      config.externals.push('ffmpeg-static')
    }
    return config
  },
  // Configure headers for audio file access
  async headers() {
    return [
      {
        source: '/audio/:path*',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
