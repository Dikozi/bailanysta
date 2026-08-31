import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next генерирует AGENTS.md/CLAUDE.md в корне; в репозитории проекта они не нужны.
  agentRules: false,
};

export default nextConfig;
