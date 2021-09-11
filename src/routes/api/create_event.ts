import type { EndpointOutput } from '@sveltejs/kit';
import { Event } from '$lib/database';
import type { EventData } from '$lib/event';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';

export const put = async ({ body }: { body: EventData }): Promise<EndpointOutput> => {
	const date = new Date(body.date);
	if (isNaN(+date)) throw new Error('invalid date');
	const created = await (await Event).create({
		name: `${body.name || ''}`,
		date
	});
	return {
		status: 201, // created
		body: created.toJSON() as JSONValue
	};
};
