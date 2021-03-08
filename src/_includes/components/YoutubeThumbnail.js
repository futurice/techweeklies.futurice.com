/**
 * Add a youtube video's thumbnails as a responsive <img>.
 * Uses `srcset` for the alternatives.
 *
 * @see https://developers.google.com/youtube/v3/docs/thumbnails#properties
 */

const THUMBS = {
  high: {
    suffix: 'hqdefault',
    width: 480,
  },
};

const FORMATS = {
  jpg: {
    endpoint: 'vi',
  },
  webp: {
    endpoint: 'vi_webp',
  },
};

module.exports = function({
  videoId,
  alt = '',
  className = '',
  sizes = '100vw',
}) {
  return `
  <picture>
    <source srcset="${makeSrcset(videoId, 'webp')}" type="image/webp">
    <source srcset="${makeSrcset(videoId, 'jpg')}" type="image/jpeg">

    <img alt="${alt}" src="${makeSrc(
    videoId,
    'high',
    'jpg'
  )}" sizes="${sizes}" class="${className}">
  </picture>`;
};

function makeSrcset(videoId, format = 'jpg') {
  return Object.keys(THUMBS)
    .map(thumb => `${makeSrc(videoId, thumb, format)} ${THUMBS[thumb].width}w`)
    .join(', ');
}

function makeSrc(videoId, size, format) {
  return `https://img.youtube.com/${FORMATS[format].endpoint}/${videoId}/${
    THUMBS[size].suffix
  }.${format}`;
}
