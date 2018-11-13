/**
 * Add a youtube video's thumbnails as a responsive <img>.
 * Uses `srcset` for the alternatives.
 *
 * @see https://developers.google.com/youtube/v3/docs/thumbnails#properties
 */

const THUMBS = {
  default: {
    suffix: 'default',
    width: 120,
  },
  medium: {
    suffix: 'mqdefault',
    width: 320,
  },
  high: {
    suffix: 'hqdefault',
    width: 480,
  },
  standard: {
    suffix: 'sddefault',
    width: 640,
  },
  maxres: {
    suffix: 'maxresdefault',
    width: 1280,
  },
};

// TODO: Support webp with `picture`
module.exports = function(videoId, alt = '', cls = '', sizes = '100vw') {
  return `<img alt="${alt}" src="${makeSrc(videoId)}" srcset="${makeSrcset(
    videoId
  )}" sizes="${sizes}" class="${cls}">`;
};

function makeSrcset(videoId, format = 'jpg') {
  return Object.keys(THUMBS)
    .map(thumb => `${makeSrc(videoId, thumb, format)} ${THUMBS[thumb].width}w`)
    .join(', ');
}

function makeSrc(videoId, size = 'medium', format = 'jpg') {
  return `https://img.youtube.com/vi/${videoId}/${
    THUMBS[size].suffix
  }.${format}`;
}
