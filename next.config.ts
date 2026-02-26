import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        os: false,
        crypto: false,
        "node:child_process": false,
        "node:fs/promises": false,
        "node:path": false,
        "node:os": false,
        "node:crypto": false,
      };
    }
    return config;
  },
  serverExternalPackages: ['node-llama-cpp', '@lancedb/lancedb', 'onnxruntime-node'],
  turbopack: {
    root: __dirname,
    resolveAlias: {
      'node-llama-cpp': './src/lib/sdk/empty.ts',
      '@lancedb/lancedb': './src/lib/sdk/empty.ts',
      'onnxruntime-node': './src/lib/sdk/empty.ts',
      'node:fs/promises': './src/lib/sdk/empty.ts',
      'node:child_process': './src/lib/sdk/empty.ts',
      'node:os': './src/lib/sdk/empty.ts',
      'node:path': './src/lib/sdk/empty.ts',
      'node:crypto': './src/lib/sdk/empty.ts',
    }
  },
  experimental: {
    // Other experimental features if needed
  },
};

export default nextConfig;
