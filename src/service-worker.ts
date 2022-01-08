import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

// Used for filtering matches based on status code, header, or both
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
// Used to limit entries in cache, remove entries after a certain period of time
import { ExpirationPlugin } from 'workbox-expiration';

import { precacheAndRoute, precache } from 'workbox-precaching';
import { build, files, timestamp } from '$service-worker';

const revision = new Date(timestamp).toISOString();

const main_routes = [
	'/',
	'/import/video',
	'/import/file',
	'/fullscreen',
	'/apropos',
	'/borne',
	'/borne/config'
];
precache(main_routes.map((url) => ({ url, revision })));

// Cache page navigations (html) with a Network First strategy
registerRoute(
	// Check to see if the request is a navigation to a new page
	({ request }) =>
		request.mode === 'navigate' ||
		['document', 'image', 'video', 'audio'].includes(request.destination),
	// Use a Network First caching strategy
	new NetworkFirst({
		// Put all cached files in a cache named 'pages'
		cacheName: 'pages',
		networkTimeoutSeconds: 5,
		plugins: [
			// Ensure that only requests that result in a 200 status are cached
			new CacheableResponsePlugin({ statuses: [200] }),
			// Don't cache more than 150 items, and expire them after 2 months
			new ExpirationPlugin({
				maxEntries: 150,
				maxAgeSeconds: 60 * 60 * 24 * 31 * 2 // 2 months
			})
		]
	})
);

const all_assets = [...build, ...files].map((url) => ({ url, revision }));
precacheAndRoute(all_assets, { cleanURLs: false });
