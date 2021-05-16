import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ request, render }) => {
    const id = (Math.random() * 100) | 0;
    const start = performance.now();
    console.log(`${request.method} ${request.path} [${id}]`);
    const response = await render(request);
    const ms = (performance.now() - start).toFixed(1);
    const kb = ((response.body?.length || 0) / 1000).toFixed(2);
    console.log(`${request.path}: ${response.status} (${kb} kb, ${ms} ms) [${id}]`);
    return response;
}