import type { EndpointOutput } from '@sveltejs/kit';
import { Event, Person } from '$lib/database';
import type { AsJson } from '$lib/database';
import type { DBEvent } from '$lib/event';

export async function get({
	params: { private_code }
}: {
	params: { private_code: string };
}): Promise<EndpointOutput> {
	const found = await (await Event).findOne({
		where: { private_code },
		include: { model: await Person, attributes: ['key', 'validated', 'invited'] }
	});
	if (!found) return { status: 404, body: { error: `event ${private_code} does not exist` } };
	const body = found.toJSON<AsJson<DBEvent>>();
	return { body };
}
