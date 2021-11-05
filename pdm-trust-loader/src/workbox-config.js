module.exports = {
  globDirectory: "./",
  globPatterns: ["**/*.{html,js,css,ttf,eot,svg,woff,woff2,jpg,png,mjs,webmanifest}"],
  globIgnores: ["node_modules/**/*.*", "assets/ionic-core/svg/*.svg", "assets/ionic-core/ionicons/svg/*.svg", "*.json-template"],
  swDest: "./swPwa.js",
  cleanupOutdatedCaches: true,
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // allow 5MB file size in order to include swBoot
};
