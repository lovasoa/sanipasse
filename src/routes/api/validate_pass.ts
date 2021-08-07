import type { RequestHandler } from '@sveltejs/kit';
import { findCertificateError, parse_any } from '$lib/detect_certificate';

const ACCEPTED_KEYS = new Set((process.env['ACCEPTED_KEYS'] || '').split(','));

interface Input {
	code: string;
	key: string;
}

type Output = {
	validated?: boolean;
	error?: string;
};

interface Endpoint extends RequestHandler<any, Input, Output> {}

export const post: Endpoint = async ({ body: { code, key } }) => {
	if (!code || !key)
		return {
			status: 400,
			body: {
				error: `Expected JSON body parameters: {code: string, key: string }`
			}
		};
	if (!ACCEPTED_KEYS.has(key))
		return {
			status: 403,
			body: { error: `Invalid API key '${key}'. contact@ophir.dev to get an API key.` }
		};

	let validated = false;
	let error: string | undefined;
	try {
		const parsed = await parse_any(code); // Will resolve as an error if the signature is invalid
		error = findCertificateError(parsed);
	} catch (err) {
		error = err.message;
	}
	if (!error) validated = true;
	return { status: 200, body: { validated, error } };
};
