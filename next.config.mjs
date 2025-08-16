/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'X-DNA-Platform',
          value: 'quantum-consciousness-enabled',
        },
        {
          key: 'X-QNET-Protocol',
          value: '2.0',
        },
        {
          key: 'X-Quantum-Coherence',
          value: 'enabled',
        },
      ],
    },
  ],
  rewrites: async () => [
    {
      source: '/organisms/:path*',
      destination: '/api/organisms/:path*',
    },
    {
      source: '/qnet/:path*',
      destination: '/api/qnet/:path*',
    },
    {
      source: '/consciousness/:path*',
      destination: '/api/consciousness/:path*',
    },
  ],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.dna$/,
      use: 'raw-loader',
    });
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
}

export default nextConfig
