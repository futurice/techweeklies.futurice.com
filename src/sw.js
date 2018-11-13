importScripts('/js/workbox/workbox-v4.0.0-beta.0/workbox-sw.js');

/* Needed to use the local workbox version
 * @see https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox#.setConfig
 */
workbox.setConfig({ modulePathPrefix: '/js/workbox/workbox-v4.0.0-beta.0' });

// navigationPreload helps reduce the effect of SW bootup time
// when handling navigation routes.
// @see https://developers.google.com/web/tools/workbox/modules/workbox-navigation-preload
workbox.navigationPreload.enable();

// Set up for workbox-build
// Respond from cache for the critical assets/resources
workbox.precaching.precacheAndRoute([]);

// Use a network-only strategy for all other requests
// We might change this in the future, but for now let's not cache
// anything.
workbox.routing.setDefaultHandler(workbox.strategies.networkOnly());

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
workbox.routing.setCatchHandler(({ event }) => {
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
  switch (event.request.destination) {
    case 'document':
      return caches.match('/offline.html');
      break;

    default:
      // If we don't have a fallback, just return an error response.
      return Response.error();
  }
});
