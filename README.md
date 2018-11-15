# techweeklies.futurice.com

A new version of the Tech Weeklies website.

https://techweekliesdemo.netlify.com

Built with the [Eleventy](https://github.com/11ty/eleventy) static site generator, and a good sprinkling of Javascript.

## Getting Started

### Setup

```
git clone https://github.com/futurice/techweekliesdemo.git
cd techweekliesdemo
pnpm install
```

(At the moment, we use [pnpm](https://pnpm.js.org/))

### Development

The development pipeline sets up watchers for relevant files, and starts the build with eleventy.

```
npm run dev
```

### Production Build

```
npm run build
```

The production build is similar to development, but the pipeline is one-off and sequential.

We also do a few more things in production:
- Register a Service Worker
- Minify assets
- Set up long-term hashing of JS and CSS
- Postprocess the HTML to inline Critical CSS

### Production-Parity Run

```
npm run prod
```

This builds according to production and spins up a local server with similar properties to production.
It is not 100% similar due to production being under a CDN, but important things such as hashing, inlining, Service Worker and compression are there.

### Debugging

You can append a `DEBUG` environment variable to get an output of Eleventy's internals. It works both in dev and build.

```
DEBUG=* npm run dev
```

## Components, Styles

A basic styleguide is available under `/styleguide`.
The page and the source can give you an impression of how components (Text, Link) and atoms (spacing, colours) are used in this system.


## Implementation Notes

:construction: There's more to say in this section, working on it :) :construction:


### Static Site

The "site" per se lives under `src`.
Eleventy follows the directory structure, and provides metadata as well as collections to the templates.
The templating language is Nunjucks, but Eleventy supports other templates as well.

* `src/about/index.md` shows how to add a content page.
* `src/posts/` has the blog posts but really they can live in any directory. They need only the `post` tag to be added to this collection.
* Add the `nav` tag to add a template to the top level site navigation. For example, this is in use on `index.njk` and `src/about/index.md`.
* Content can be any template format (blog posts needn’t be markdown, for example). Configure your supported templates in `.eleventy.js` -> `templateFormats`.
* The blog post feed template is in `src/feed/feed.njk`. This is also a good example of using a global data files in that it uses `src/_data/metadata.json`.
* This example uses three layouts:
  * `src/_includes/layouts/base.njk`: the top level HTML structure
  * `src/_includes/layouts/home.njk`: the home page template (wrapped into `base.njk`)
  * `src/_includes/layouts/post.njk`: the blog post template (wrapped into `base.njk`)
* `src/_includes/postlist.njk` is a Nunjucks include and is a reusable component used to display a list of all the posts. `src/index.njk` has an example of how to use it.
* JS is handled by Rollup
* CSS is handled by a PostCSS pipeline

### CSS

WIP

CSS is handled by a PostCSS pipeline

### JS

WIP

JS is handled by Rollup

### Service Worker

WIP

### Analytics

WIP

### Postprocessing

WIP
