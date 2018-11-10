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

const metalsmith = require("metalsmith");
const criticalCss = require("./critical-css-plugin");

// TODO: Could take this from CLI args
const INPUT_DIR = "_site/";
const OUTPUT_DIR = "_site/";

function main() {
  metalsmith(process.cwd())
    .source(INPUT_DIR) // source directory
    .destination(OUTPUT_DIR) // destination directory
    .clean(false) // clean destination before
    .use(
      criticalCss({
        pattern: "**/*.html",
        // The CSS file whose selectors will be matched against the html
        cssFile: "./_site/css/index.css",
        // The path under which the css is included in the template
        cssPublicPath: "/css/index.css"
      })
    )
    .build(function(err) {
      if (err) {
        console.log("Error running the postprocessing pipeline: " + err);
        throw err;
      }
      console.log("Done!");
    });
}

main();

//
// UTIL

/** Metalsmith plugin wrapper that runs the plugin only in production */
function productionOnly(plugin) {
  return (files, metalsmith, done) =>
    process.env.NODE_ENV === "production"
      ? plugin(files, metalsmith, done)
      : done();
}
