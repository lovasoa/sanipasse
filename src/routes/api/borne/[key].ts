import type { EndpointOutput } from '@sveltejs/kit';
import { BorneConfig } from '$lib/database';
import type { DBConfig } from '$lib/database';
import { MAX_FILESIZE } from '$lib/global_config';

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
	if (rawBody.length > MAX_FILESIZE)
		return {
			status: 400,
			body: `Configuration trop volumineuse: ${(rawBody.length / 1e6).toFixed(
				1
			)} Mo au lieu d'un maximum autorisé de ${(MAX_FILESIZE / 1e6).toFixed(1)} Mo.`
		};
	if (!key || key.length < 12) return { status: 400, body: { error: 'key is too short' } };
	const [_configObj, created] = await (await BorneConfig).upsert({ key, config: rawBody });
	return {
		status: 201,
		body: { created }
	};
}
