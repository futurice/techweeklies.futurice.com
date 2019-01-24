/*
 * This file is responsible for postprocessing the html + assets output after Eleventy. Metalsmith is used because it can carry files through a pipeline, and it normalises the directory/file search.
 *
 * Here's what we do at the moment:
 *  - Read all the files from _site
 *  - Postprocess *.html and the linked index.css such that the css selectors and rules used are inlined. This helps the first page load significantly. Then, ake the css script async via link rel="preload" and use LoadCSS as a fallback.
 *
 * In the future, we might:
 *  - Hash and rewrite references to css and js files, for long-term caching
 *  - Minify HTML
 */

const fs = require('fs');
const path = require('path');
const metalsmith = require('metalsmith');
const { default: criticalCss } = require('metalsmith-inline-critical-css');

// TODO: Could take this from CLI args
const INPUT_DIR = '_site/';
const OUTPUT_DIR = '_site/';

// CSS filename as it is referenced before hashing
const UNHASHED_CSS_FILENAME = '/css/index.css';
const HASH_MANIFEST_PATH = '_intermediate/hash-manifest.json';

function main() {
  // Read the hash manifest
  const hashManifest = JSON.parse(
    fs.readFileSync(path.resolve(HASH_MANIFEST_PATH))
  );

  const hashedCssFilename = hashManifest[UNHASHED_CSS_FILENAME];
  if (!hashedCssFilename) {
    console.log(
      'Could not resolve hashed CSS name. Are you running in production? Did the build run out of order?'
    );
  }

  // Run metalsmith pipeline
  metalsmith(process.cwd())
    .source(INPUT_DIR) // source directory
    .destination(OUTPUT_DIR) // destination directory
    .clean(false) // clean destination before
    .build(function(err) {
      if (err) {
        console.log('Error running the postprocessing pipeline: ' + err);
        throw err;
      }
      console.log('Done!');
    });
}

main();

//
// UTIL

/** Metalsmith plugin wrapper that runs the plugin only in production */
function productionOnly(plugin) {
  return (files, metalsmith, done) =>
    process.env.NODE_ENV === 'production'
      ? plugin(files, metalsmith, done)
      : done();
}
