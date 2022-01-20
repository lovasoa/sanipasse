import type { Handle } from '@sveltejs/kit';
import { performance } from 'perf_hooks';

export const handle: Handle = async ({ event, resolve }) => {
	const { request, url } = event;
	const id = (Math.random() * 100) | 0;
	const start = performance.now();
	const referer = request.headers.get('referer');
	const referer_text = referer ? `(from: ${referer})` : '';
	console.log(`${request.method} ${url.pathname} ${referer_text} [${id}]`);
	const response = await resolve(event);
	const ms = (performance.now() - start).toFixed(1);
	console.log(`${url.pathname}: ${response.status} (${ms} ms) [${id}]`);
	return response;
};
