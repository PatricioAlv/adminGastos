/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Excluir la carpeta functions del build
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
  // Excluir archivos de functions del transpiling
  transpilePackages: [],
  experimental: {
    serverComponentsExternalPackages: ['firebase-functions']
  }
}

module.exports = nextConfig
