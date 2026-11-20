/** @type {import('next').NextConfig} */

// Baseline security headers for every route.
// A Content-Security-Policy is intentionally NOT set here: it needs to be
// tuned to the payment, Google and video embeds this site uses, and a wrong
// policy would break checkout. Add it in Report-Only mode first.
const securityHeaders = [
  // Stop browsers guessing content types (MIME sniffing).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent other sites from embedding this site in a frame (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Do not leak full URLs (order ids, tokens in query strings) to other sites.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Turn off powerful browser features this site does not use.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Force HTTPS for a year (ignored by browsers when served over plain HTTP).
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
]

const nextConfig = {
  reactStrictMode: true,
  // Do not advertise the framework in the X-Powered-By response header.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "yourcdn.com",
      },
      {
        protocol: "https",
        hostname: "youtube.com",
      },
    ],
  },
}

module.exports = nextConfig
