import "vite/dynamic-import-polyfill"
import type { CommonCertificateInfo } from './common_certificate_info';
import type { DBEvent } from './event';

export const DGC_PREFIX = 'HC1:';

function extractCodeFromLink(doc: string): string {
	doc = doc.trim();
	let url: URL | undefined;
	try {
		url = new URL(doc);
	} catch (e) {
		/** ignore non-URL docs*/
	}
	if (url && url.host === 'bonjour.tousanticovid.gouv.fr') {
		// The first  TousAntiCovid QR codes used "/app/wallet?v=..."
		const v = url.searchParams.get('v');
		if (v) return v;
		// The latest TousAntiCovid links use "/app/wallet2d#..." and "/app/walletdcc#..."
		else return decodeURIComponent(url.hash.slice(1));
	}
	return doc;
}

export function isDGC(code: string): boolean {
	return code.startsWith(DGC_PREFIX);
}

/**
 * Detects the type of a certificate and parses it
 */
export async function parse_any(doc_or_link: string): Promise<CommonCertificateInfo> {
	const doc = extractCodeFromLink(doc_or_link);
	const { parse } = await import(isDGC(doc) ? './digital_green_certificate' : './2ddoc');
	return await parse(doc);
}

export function findCertificateError(
	c: CommonCertificateInfo,
	event?: DBEvent
): string | undefined {
	const MAX_NEGATIVE_TEST_AGE_HOURS = 72;
	const MIN_POSITIVE_TEST_AGE_DAYS = 15;
	const MAX_POSITIVE_TEST_AGE_DAYS = 6 * 30;
	if (c.type === 'vaccination') {
		if (c.doses_received < c.doses_expected)
			return `Vous n'avez reçu que ${c.doses_received} dose sur les ${c.doses_expected} que ce vaccin demande.`;
	} else {
		// test
		const target_date = event?.date || new Date();
		const test_age_hours = (+target_date - +c.test_date) / (3600 * 1000);
		const test_age_days = test_age_hours * 24;
		if (c.is_negative) {
			if (test_age_hours > MAX_NEGATIVE_TEST_AGE_HOURS)
				return (
					`Ce test a ${test_age_hours.toLocaleString('fr', { maximumFractionDigits: 0 })} heures.` +
					` Un test de moins de ${MAX_NEGATIVE_TEST_AGE_HOURS} heures est demandé.`
				);
		} else {
			//positive test
			if (test_age_days < MIN_POSITIVE_TEST_AGE_DAYS || test_age_days > MAX_POSITIVE_TEST_AGE_DAYS)
				return (
					`Ce test a ${test_age_days.toLocaleString('fr', { maximumFractionDigits: 0 })} jours.` +
					` Un test de plus de ${MIN_POSITIVE_TEST_AGE_DAYS} jours et de moins de ${
						MAX_POSITIVE_TEST_AGE_DAYS / 30
					} mois est demandé.`
				);
		}
	}
}
