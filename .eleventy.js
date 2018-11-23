const path = require('path');
const fs = require('fs');
const { DateTime } = require('luxon');
const { groupBy, flatten, drop } = require('lodash');

// Plugins
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

// Custom tags etc.
const YoutubeThumbnail = require('./src/_includes/components/YoutubeThumbnail');
const Text = require('./src/_includes/components/Text');
const Heading = require('./src/_includes/components/Heading');
const Subheading = require('./src/_includes/components/Subheading');
const Link = require('./src/_includes/components/Link');
const MarkdownBlock = require('./src/_includes/components/MarkdownBlock');

// Globals
const INPUT_DIR = 'src';
const OUTPUT_DIR = '_site';
const HASH_MANIFEST_FILENAME = '_intermediate/hash-manifest.json';
const isProduction = process.env.NODE_ENV === 'production';

module.exports = function(eleventyConfig) {
  //
  // PLUGINS
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  //
  // LAYOUTS
  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

  //
  // FILTERS
  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'dd LLLL yyyy'
    );
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Get the nth element of a collection.
  eleventyConfig.addFilter('at', (array, n) => {
    return array[n];
  });

  // Skip/drop n elements from a list and return the rest.
  eleventyConfig.addFilter('drop', (array, n) => {
    return drop(array, n);
  });

  // Flatten a list one level.
  eleventyConfig.addFilter('flatten', array => {
    return flatten(array);
  });

  // Log the argument and return unchanged.
  eleventyConfig.addFilter('log', value => {
    console.log(value);
    return value;
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-LL-dd');
  });

  // Filter that resolves a hash from a known table
  // @see join-manifests for more information on how the manifest is formed
  eleventyConfig.addFilter('resolveHash', function(filename) {
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

  eleventyConfig.addFilter('youtubeVideoUrl', (videoId, clipTimeSeconds) => {
    return `https://youtube.com/watch?v=${videoId}${
      clipTimeSeconds ? `&t=${clipTimeSeconds}` : ''
    }`;
  });

  eleventyConfig.addFilter('youtubeEmbedUrl', (videoId, clipTimeSeconds) => {
    return `https://www.youtube.com/embed/${videoId}${
      clipTimeSeconds ? `&start=${clipTimeSeconds}` : ''
    }`;
  });

  //
  // COLLECTIONS

  // only content in the `posts/` directory
  eleventyConfig.addCollection('posts', function(collection) {
    const postsGlob = path.join(INPUT_DIR, 'posts/*');
    return collection.getFilteredByGlob(postsGlob).sort(function(a, b) {
      return a.date - b.date;
    });
  });

  // Group posts by date
  // NOTE: You have to inspect the date in the children atm;
  // returning an object {[date]: items} does not work yet.
  eleventyConfig.addCollection('postsByDate', function(collection) {
    const postsGlob = path.join(INPUT_DIR, 'posts/*');
    const sorted = collection.getFilteredByGlob(postsGlob).sort(function(a, b) {
      return a.date - b.date;
    });
    const grouped = groupBy(sorted, item =>
      DateTime.fromJSDate(item.date).startOf('day')
    );
    console.log({ grouped });

    return Object.values(grouped);
  });

  eleventyConfig.addCollection('tagList', require('./_11ty/getTagList'));

  // Copy these directories and files directly
  eleventyConfig.addPassthroughCopy('src/img');
  eleventyConfig.addPassthroughCopy('src/js/workbox');
  eleventyConfig.addPassthroughCopy('src/fonts');
  eleventyConfig.addPassthroughCopy('src/manifest.json');

  /* Markdown Plugins */
  let markdownIt = require('markdown-it');
  let markdownItAnchor = require('markdown-it-anchor');
  let options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  let opts = {
    permalink: true,
    permalinkClass: 'direct-link',
    permalinkSymbol: '#',
  };

  eleventyConfig.setLibrary(
    'md',
    markdownIt(options).use(markdownItAnchor, opts)
  );

  //
  // SHORTCODES
  eleventyConfig.addShortcode('YoutubeThumbnail', YoutubeThumbnail);
  eleventyConfig.addPairedShortcode('Text', Text);
  eleventyConfig.addPairedShortcode('Heading', Heading);
  eleventyConfig.addPairedShortcode('Subheading', Subheading);
  eleventyConfig.addPairedShortcode('MarkdownBlock', MarkdownBlock);
  eleventyConfig.addPairedShortcode('Link', Link);

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: INPUT_DIR,
      output: OUTPUT_DIR,
      // NOTE: These two paths are relative to dir.input
      // @see https://github.com/11ty/eleventy/issues/232
      includes: '_includes',
      data: '_data',
    },
  };
};
