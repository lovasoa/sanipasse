import type { EndpointOutput } from '@sveltejs/kit';
import { BorneConfig, DBConfig } from '$lib/database';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';

export async function get({
	params: { key }
}: {
	params: { key: string };
}): Promise<EndpointOutput> {
	const found = await (await BorneConfig).findOne({
		where: { key }
	});
	if (!found) return { status: 404, body: { error: `config "${key}" does not exist` } };
	const body = JSON.parse(found.get('config') as string);
	return { body };
}

export async function put({
	body,
	params: { key }
}: {
	body: DBConfig;
	params: { key: string };
}): Promise<EndpointOutput> {
	const rawBody = JSON.stringify(body);
	if (rawBody.length > 500_000)
		return { status: 400, body: { error: 'Config too large. The configuration must be <500kb' } };
	if (!key || key.length < 12) return { status: 400, body: { error: 'key is too short' } };
	const [_configObj, created] = await (await BorneConfig).upsert({ key, config: rawBody });
	return {
		status: 201,
		body: { created }
	};
}
