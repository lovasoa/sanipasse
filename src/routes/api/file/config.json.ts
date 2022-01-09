import type { RequestHandler } from '@sveltejs/kit';
import { MAX_FILESIZE } from '$lib/global_config';

export const get: RequestHandler = async ({ params: { key } }) => {
	return {
		body: { MAX_FILESIZE }
	};
};
