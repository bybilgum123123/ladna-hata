import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @param {string} phase @returns {import('next').NextConfig} */
const nextConfig = (phase) => ({
  agentRules: false,
  // Preview assets must survive production builds made while the preview is open.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-preview' : '.next',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
});

export default nextConfig;
