import type { CommonCertificateInfo } from './common_certificate_info';
import type { DBEvent } from './event';
import { validityInterval } from './tac_verif_rules';

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
	const validity = validityInterval(c);
	if ('invalid' in validity) return validity.invalid;
	const { start, end } = validity;
	const target_date = event?.date || new Date();
	const err_msg = `La validité de ce certificat de ${c.type}`;
	if (start > target_date) return `${err_msg} commence le ${start.toLocaleDateString('fr')}.`;
	if (end < target_date) return `${err_msg} se termine le ${end.toLocaleDateString('fr')}.`;
}
