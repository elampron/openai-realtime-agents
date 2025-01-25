/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  experimental: {
    // Enable server actions
    serverActions: true
  }
}

export default config
