/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.pinimg.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
    ],
  },
};

module.exports = nextConfig;
