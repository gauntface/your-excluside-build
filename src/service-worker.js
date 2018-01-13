importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-alpha.5/workbox-sw.js');

// The final service worker will have this array added by the
// `gulp serviceWorker` task.
workbox.precaching.precacheAndRoute([])
