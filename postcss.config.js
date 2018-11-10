const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");

// TODO: input, dir, no-map

module.exports = {
  plugins: [
    postcssImport(),
    autoprefixer(),
    cssnano({
      preset: "default"
    })
  ]
};
