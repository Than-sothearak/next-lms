/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Set your desired limit (e.g., 10mb, 50mb, 1000 bytes)
    },
  },
  images: {
    domains: ["thearak-next-lms.s3.amazonaws.com"],
  },
  reactStrictMode: false,
};

export default nextConfig;
