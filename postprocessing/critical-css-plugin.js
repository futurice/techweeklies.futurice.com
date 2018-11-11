const path = require("path");
const fs = require("fs");
const multimatch = require("multimatch");
const invariant = require("invariant");
const Purgecss = require("purgecss");
const purgeHtml = require("purgecss-from-html");
const gzipSize = require("gzip-size");
const cheerio = require("cheerio");

// Set up debug
const debug = require("debug")("critical-css-plugin");

/**
 * Expose `plugin`.
 */
module.exports = plugin;

/**
 * Metalsmith plugin to inline critical css, and load the rest asynchronously.
 *
 * @arg cssPublicPath:
 *  The path under which the css is included in the template.
 *  Important for knowing which <link> tag to replace.
 *
 * @return {Function}
 */

function plugin({ pattern, cssFile, cssPublicPath } = {}) {
  invariant(!!pattern, "You must supply a pattern for the html files.");
  invariant(
    !!cssFile && !Array.isArray(cssFile),
    "You must supply a single css file to look for. Multiple files are not currently supported"
  );

  return function(files, metalsmith, done) {
    debug("WILL: Read CSS file", cssFile);
    const cssFilePath = path.resolve(cssFile);
    const cssContent = fs.readFileSync(cssFilePath, { encoding: "utf-8" });
    debug("OK: Read CSS file");

    // Read the LoadCSS file once
    debug("WILL: Read LoadCSS file");
    const loadCssPreloadContent = fs.readFileSync(
      path.resolve("node_modules/fg-loadcss/dist/cssrelpreload.min.js")
    );
    debug("OK: Read LoadCSS file");

    // Loop over all the files, applying the transform if matching
    Object.keys(files)
      .filter(file => {
        const matches = multimatch(file, pattern).length > 0;

        if (matches) {
          debug(`MATCH: ${file}`);
        } else {
          debug(`NO MATCH: ${file}`);
        }

        return matches;
      })
      .forEach(function(file) {
        debug(`WILL: Run for ${file}`);

        // utf-8 decode read file contents
        debug("WILL: Read html file contents");
        let fileContent = files[file].contents;
        if (!!fileContent && fileContent instanceof Buffer) {
          fileContent = fileContent.toString("utf-8");
        }
        debug("OK: Read html file contents");

        debug("WILL: get used CSS");
        const usedCss = getUsedCss({
          htmlContent: fileContent,
          cssContent: cssContent
        });
        debug("OK: get used CSS");

        // NOTE: The gzip size will be even smaller when inlined into the document,
        // because the classes are shared
        debug(`Used CSS gzip-size (standalone): ${gzipSize.sync(usedCss)} B`);

        debug("WILL: inject used CSS to file contents");
        const htmlWithInline = inlineCriticalCss({
          htmlContent: fileContent,
          cssPublicPath: cssPublicPath,
          criticalCssContent: usedCss,
          loadCssPreloadContent
        });
        debug("OK: inject used CSS to file contents");

        debug("WILL: write to file contents");
        files[file].contents = htmlWithInline;
        debug("OK: write to file contents");

        debug("OK: Critical CSS plugin run");
        done();
      });
  };
}

//
// HELPERS

//
// Return only the css from cssContent that is used in htmlContent
// Might have false negatives where JS interaction is concerned, but
// those should be minimal and in any case the full css should come
// in before that.
const getUsedCss = ({ htmlContent, cssContent }) => {
  const purgeCss = new Purgecss({
    content: [
      {
        raw: htmlContent,
        extension: "html"
      }
    ],
    css: [
      {
        raw: cssContent,
        extension: "css"
      }
    ],
    extractors: [
      {
        extractor: purgeHtml,
        extensions: ["html"]
      }
    ]
  });

  // The result of purgeCss.purge() is an array because of multiple files.
  // We only have one file, so we take the first one.
  const usedCss = purgeCss.purge()[0].css;
  return usedCss;
};

//
// Inline Critical CSS in HTML, by replacing <link rel="stylesheet">
// with a preload tag, adding the critical CSS as <style>, and using
// loadCSS as a polyfill
function inlineCriticalCss({
  htmlContent,
  cssPublicPath,
  criticalCssContent,
  loadCssPreloadContent
}) {
  // Set up new markup
  const style = `<style>${criticalCssContent}</style>`;

  // Manipulate markup
  const $ = cheerio.load(htmlContent);

  // Find the relevant link tag
  const $link = $('link[rel="stylesheet"]').filter(`[href="${cssPublicPath}"]`);

  // If no relevant link tags found, return the original content
  if ($link.length === 0) {
    debug("Found no link tags with cssPublicPath of " + cssPublicPath);
    return htmlContent;
  }

  // NOTE: .html() returns '' for some reason, so we use toString() instead...
  const linkStylesheet = $link.toString();

  const noscriptFallback = `<noscript>${linkStylesheet}</noscript>`;

  // Fallback for browsers that do not support link rel="preload"
  // @see https://github.com/filamentgroup/loadCSS
  const loadCssPreloadScript = `<script>${loadCssPreloadContent}</script>`;

  // link rel="stylesheet" -> <link rel="preload" href="path/to/mystylesheet.css" as="style" onload="this.rel='stylesheet'">
  $link
    .attr({
      rel: "preload",
      as: "style",
      // eslint-disable-next-line quotes
      onload: `this.onload=null;this.rel='stylesheet'`
    })
    .append(noscriptFallback)
    .append(loadCssPreloadScript)
    .append(style);

  const newHtml = $.html();
  return newHtml;
}
