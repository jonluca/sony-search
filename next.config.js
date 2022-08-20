/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  productionBrowserSourceMaps: true,
};

const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  nextConfig.experimental = {
    ...nextConfig.experimental,
    legacyBrowsers: false,
    browsersListForSwc: true,
  };
}

module.exports = nextConfig;
