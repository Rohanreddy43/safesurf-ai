/** @type {import('next').NextConfig} */
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8000'
).replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  /**
   * Server-side proxy for the FastAPI backend.
   *
   * The browser calls the same-origin `/api/v1/*` path (see lib/api.ts) and Next
   * forwards it to BACKEND_URL. That means a deployed build never has to bake a
   * `localhost` API URL into the client bundle, and requests sidestep CORS.
   * Set BACKEND_URL on your host (e.g. Render) to the public API URL.
   */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
