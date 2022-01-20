import { Event } from '$lib/database';
import type { DBEvent, EventData } from '$lib/event';
import type { RequestHandler } from '@sveltejs/kit';

export const put: RequestHandler = async ({ request }) => {
	const body: EventData = await request.json();
	const date = new Date(body.date);
	if (isNaN(+date)) throw new Error('invalid date');
	const created = await (await Event).create({
		name: `${body.name || ''}`,
		date
	});
	return {
		status: 201, // created
		body: created.toJSON<any>()
	};
};
