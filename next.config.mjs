/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Set your desired limit (e.g., 10mb, 50mb, 1000 bytes)
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "thearak-next-lms.s3.amazonaws.com" },
    ],
  },
  reactStrictMode: false,
   allowedDevOrigins: ['192.168.100.4', '192.168.168.62', 'skilled-jacqulyn-flamier.ngrok-free.dev'],
};

export default nextConfig;
