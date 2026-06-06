import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Avoid picking a parent folder lockfile (e.g. user home) as the tracing root on Windows.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
