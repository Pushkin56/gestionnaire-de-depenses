
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental block removed as it was empty after moving allowedDevOrigins
  allowedDevOrigins: [
    'https://6000-firebase-studio-1749368536748.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev',
  ],
};

export default nextConfig;
