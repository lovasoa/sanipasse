import type { EndpointOutput } from '@sveltejs/kit';
import { Event } from '$lib/database';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';

export async function get({
	params: { public_code }
}: {
	params: { public_code: string };
}): Promise<EndpointOutput> {
	const found = await (await Event).findOne({
		where: { public_code },
		attributes: ['name', 'date']
	});
	if (!found) return { status: 404, body: { error: `event ${public_code} does not exist` } };
	const body = found.toJSON() as JSONValue;
	return { body };
}
