/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ggcqiljlrwdyojzlacnv.supabase.co',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
