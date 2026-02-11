/** @type {import('next').NextConfig} */
const nextConfig = {
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
