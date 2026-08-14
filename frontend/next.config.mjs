/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // assetPrefix makes browser request CSS/JS as /dept/_next/static/...
  // which Apache correctly routes through Passenger to our Node.js app
  assetPrefix: isProd ? '/dept' : '',
  compiler: {
    removeConsole: isProd ? { exclude: ['error'] } : false,
  },
  async headers() {
    const apiDomain = isProd ? '' : ' http://localhost:5000';
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:${apiDomain}; font-src 'self' data: https:; connect-src 'self' https:${apiDomain}; frame-src 'self' https://www.youtube.com https://youtube.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';`,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const destination = isProd
      ? 'https://www.periyaruniversity.ac.in/api/:path*'
      : 'http://localhost:5000/api/:path*';
    return [
      {
        source: '/api/:path*',
        destination: destination,
      },
    ];
  },
};

export default nextConfig;
