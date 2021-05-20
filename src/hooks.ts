import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ request, render }) => {
    const id = (Math.random() * 100) | 0;
    const start = performance.now();
    const referer = request.headers['referer'];
    const referer_text = referer ? `(from: ${referer})` : '';
    console.log(`${request.method} ${request.path} ${referer_text} [${id}]`);
    const response = await render(request);
    const ms = (performance.now() - start).toFixed(1);
    const kb = ((response.body?.length || 0) / 1000).toFixed(2);
    console.log(`${request.path}: ${response.status} (${kb} kb, ${ms} ms) [${id}]`);
    return response;
}