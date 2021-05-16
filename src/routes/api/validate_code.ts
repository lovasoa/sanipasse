import type { RequestHandler } from '@sveltejs/kit';
import { parse } from '$lib/2ddoc';

export const post: RequestHandler = async ({ rawBody }) => {
	const code = rawBody instanceof Uint8Array ? new TextDecoder().decode(rawBody) : rawBody;
	try {
		const parsed = await parse(code);
		return { body: parsed };
	} catch (e) {
		return { status: 403, body: { error: `${e}` } };
	}
	return {
		body: code
	};
};
