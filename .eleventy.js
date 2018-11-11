const path = require("path");
const fs = require("fs");
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const OUTPUT_DIR = "_site";
const HASH_MANIFEST_FILENAME = "_intermediate/hash-manifest.json";
const isProduction = process.env.NODE_ENV === "production";

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("readableDate", (dateObj, zone) => {
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      "dd LLLL yyyy"
    );
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-LL-dd");
  });

  // only content in the `posts/` directory
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getFilteredByGlob("./posts/*").sort(function(a, b) {
      return a.date - b.date;
    });
  });

  // Filter that resolves a hash from a known table
  // @see join-manifests for more information on how the manifest is formed
  eleventyConfig.addFilter("resolveHash", function(filename) {
    // Presumably, dev has no hashes, so do not attempt to resolve
    if (!isProduction) {
      return filename;
    }

    // A file at a known location that maps filenames to hashed filenames
    const hashManifest = JSON.parse(
      fs.readFileSync(path.resolve(HASH_MANIFEST_FILENAME))
    );

    const hashedFilename = hashManifest[filename];
    if (!hashedFilename) {
      throw Error(
        `File with basename: ${basename} not found in hash manifest. Perhaps one of the tools built out of order? Check the manifests under the intermediate/ folder.`
      );
    }

    return hashedFilename;
  });

  eleventyConfig.addCollection("tagList", require("./_11ty/getTagList"));

  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("fonts");

  // TODO: Eventually, run through hashing
  // eleventyConfig.addPassthroughCopy("css");
  // eleventyConfig.addPassthroughCopy("js");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  };

  eleventyConfig.setLibrary(
    "md",
    markdownIt(options).use(markdownItAnchor, opts)
  );

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: OUTPUT_DIR
    }
  };
};
