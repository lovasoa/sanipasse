import type { EndpointOutput } from '@sveltejs/kit';
import { Person, Event } from '$lib/database';
import type { AsJson } from '$lib/database';
import { getKey } from '$lib/invitees';
import type { DBEvent } from '$lib/event';
import { findCertificateError, parse_any } from '$lib/detect_certificate';
import type { CommonCertificateInfo } from '$lib/common_certificate_info';

export async function post({ rawBody }: { rawBody: Uint8Array | string }): Promise<EndpointOutput> {
	const code = rawBody instanceof Uint8Array ? new TextDecoder().decode(rawBody) : rawBody;
	try {
		const parsed: AsJson<CommonCertificateInfo> = await parse_any(code);
		return { body: parsed };
	} catch (e) {
		return { status: 403, body: { error: `${e}` } };
	}
}

export async function put({
	params: { public_code },
	body: { code }
}: {
	params: { public_code: string };
	body: { code: string };
}): Promise<EndpointOutput> {
	const event_promise = (await Event).findOne({ where: { public_code } });
	const parsed_promise = parse_any(code); // Will resolve as an error if the signature is invalid
	const [event, parsed] = await Promise.all([event_promise, parsed_promise]);
	if (!event) return { status: 404, body: 'event not found' };
	const error = findCertificateError(parsed, event.toJSON() as DBEvent);
	if (error) return { status: 401, body: error };
	const key = getKey(parsed);
	(await Person).upsert({
		key,
		eventPublicCode: public_code,
		validated: true
	});
	return { status: 201, body: { validated: true } };
}
