import type { RequestHandler } from '@sveltejs/kit';
import { Event, Person } from '$lib/database';
import type { AsJson } from '$lib/database';
import type { DBEvent } from '$lib/event';

export const get: RequestHandler = async ({ params: { private_code } }) => {
	const found = await (await Event).findOne({
		where: { private_code },
		include: { model: await Person, attributes: ['key', 'validated', 'invited'] }
	});
	if (!found) return { status: 404, body: { error: `event ${private_code} does not exist` } };
	const body = found.toJSON<AsJson<DBEvent>>();
	return { body };
};
