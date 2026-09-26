import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Android physical device & emulator to connect
  allowedDevOrigins: ['localhost', '10.0.2.2', '172.23.178.14', '172.22.51.236', '172.22.49.26', '172.22.51.167', '172.23.183.65', '172.22.48.255', '172.22.49.75', '172.23.217.123'],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
