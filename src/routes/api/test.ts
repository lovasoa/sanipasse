import type { EndpointOutput } from '@sveltejs/kit';
import { Event } from '$lib/database';

export const get = async (): Promise<EndpointOutput> => {
	const e = await Event;
	return {
		status: 201, // created
		body: typeof e
	};
};
