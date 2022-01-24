import type { RequestHandler } from '@sveltejs/kit';
import { Person, Event } from '$lib/database';
import type { AsJson } from '$lib/database';
import { getKey } from '$lib/invitees';
import type { DBEvent } from '$lib/event';
import { PASS_VALIDITY_RULES, parse_any } from '$lib/detect_certificate';
import type { CommonCertificateInfo } from '$lib/common_certificate_info';

export const post: RequestHandler = async ({ request }) => {
	const code = await request.text();
	try {
		const parsed: AsJson<CommonCertificateInfo> = await parse_any(code);
		return { body: parsed };
	} catch (e) {
		return { status: 403, body: { error: `${e}` } };
	}
};

export const put: RequestHandler = async ({ params: { public_code }, request }) => {
	const { code } = await request.json();
	const event_promise = (await Event).findOne({ where: { public_code } });
	const parsed_promise = parse_any(code); // Will resolve as an error if the signature is invalid
	const [event, parsed] = await Promise.all([event_promise, parsed_promise]);
	if (!event) return { status: 404, body: 'event not found' };
	const error = PASS_VALIDITY_RULES.tousAntiCovidDefaultRules.findCertificateError(
		parsed,
		event.getDataValue('date')
	);
	if (error) return { status: 401, body: error };
	const key = getKey(parsed);
	(await Person).upsert({
		key,
		eventPublicCode: public_code,
		validated: true
	});
	return { status: 201, body: { validated: true } };
};
