/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Pin the workspace root: an unrelated lockfile sits in the parent directory.
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
}

export default nextConfig