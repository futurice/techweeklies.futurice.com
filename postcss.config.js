const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");
const hash = require("postcss-hash");

// TODO: input, dir, no-map

module.exports = {
  plugins: [
    postcssImport(),
    autoprefixer(),
    cssnano({
      preset: "default"
    }),
    ifProduction(() =>
      hash({ manifest: "_intermediate/postcss-manifest.json" })
    )
  ]
};

function ifProduction(plugin) {
  return process.env.NODE_ENV === "production" ? plugin() : null;
}
