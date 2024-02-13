/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'thearak-next-ecommerce.s3.amazonaws.com',
            port: '',
            pathname: '/account123/**',
          },
        ],
      },
};

export default nextConfig;
