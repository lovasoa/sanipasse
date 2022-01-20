import type { RequestHandler } from '@sveltejs/kit';
import { Event } from '$lib/database';

export const get: RequestHandler = async ({ params: { public_code } }) => {
	const found = await (await Event).findOne({
		where: { public_code },
		attributes: ['name', 'date']
	});
	if (!found) return { status: 404, body: { error: `event ${public_code} does not exist` } };
	const body = found.toJSON<{ name: string; date: Date }>();
	return { body };
};
