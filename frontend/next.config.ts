import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // '/competitions/*' is a leftover URL shape from before the site was
      // restructured to '/leagues/[id]' — old slugs (e.g. "pl") don't map
      // 1:1 to current league ids, so send them to the leagues index rather
      // than 404ing. Google still has some of these indexed (GSC: "Page
      // with redirect"), so this gives crawlers a real destination instead
      // of a dead end.
      {
        source: '/competitions/:slug*',
        destination: '/leagues',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
