import type { RequestHandler } from '@sveltejs/kit';
import { PASS_VALIDITY_RULES, parse_any } from '$lib/detect_certificate';
import { ApiKeys } from '$lib/database';

const ACCEPTED_KEYS = new Set((process.env['ACCEPTED_KEYS'] || '').split(','));

type Person = { first_name: string; last_name: string; date_of_birth: Date };

type PostResponse = Promise<{
	status: number;
	body: {
		error?: string;
		validated?: boolean;
		person?: Person;
	};
}>;

export const post: RequestHandler = async function ({ request }): PostResponse {
	const { code, key } = await request.json();
	if (!code || !key)
		return {
			status: 400,
			body: {
				error: `Expected JSON body parameters: {code: string, key: string }`
			}
		};

	if (!ACCEPTED_KEYS.has(key)) {
		console.log(`API key '${key}' not accepted`);
		return {
			status: 403,
			body: { error: `Invalid API key '${key}'. contact@ophir.dev to get an API key.` }
		};
	}

	save_request(key); // Do not await on the db operation, proceed immediately.

	let validated = false;
	let error: string | undefined;
	let person: Person | undefined = undefined;
	try {
		const parsed = await parse_any(code); // Will resolve as an error if the signature is invalid
		person = {
			first_name: parsed.first_name,
			last_name: parsed.last_name,
			date_of_birth: parsed.date_of_birth
		};
		error = PASS_VALIDITY_RULES.tousAntiCovidDefaultRules.findCertificateErrorNow(parsed);
	} catch (err) {
		error = (err as Error).message;
	}
	if (!error) validated = true;
	return { status: 200, body: { validated, error, person } };
};

async function save_request(api_key: string) {
	const used_at = new Date();
	const usage_record = { api_key, used_at };
	await (await ApiKeys).create(usage_record);
	console.log(`Recorded usage of API key '${api_key}'`);
}
