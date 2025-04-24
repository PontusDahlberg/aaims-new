// filepath: c:\Users\PontusDahlberg\aaims-new\next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Audio file handling
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
            fallback: 'file-loader',
            publicPath: '/_next/static/sounds/',
            outputPath: `${config.isServer ? '../' : ''}static/sounds/`,
            name: '[name]-[hash].[ext]',
          },
        },
      ],
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
