import { precacheAndRoute } from 'workbox-precaching';
import { build, timestamp } from '$service-worker';

precacheAndRoute(build.map(url => ({
    url,
    revision: new Date(timestamp).toISOString()
})));