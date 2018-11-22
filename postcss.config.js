const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const hash = require('postcss-hash');

// NOTE: These are passed in the CLI, but keeping here for posterity
// @see: package.json
const INPUT_FILES = 'src/css/*.css';
const OUTPUT_DIR = '_site/css/';

module.exports = {
  map: false,
  plugins: [
    postcssImport(),
    autoprefixer(),
    cssnano({
      preset: 'default',
    }),
    ifProduction(() =>
      hash({ manifest: '_intermediate/postcss-manifest.json' })
    ),
  ],
};

function ifProduction(plugin) {
  return process.env.NODE_ENV === 'production' ? plugin() : null;
}
