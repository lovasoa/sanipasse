import type { CommonCertificateInfo } from './common_certificate_info';
import { findCertificateError, validityInterval } from './tac_verif_rules';

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

export abstract class RuleSet {
	public abstract findCertificateError(c: CommonCertificateInfo, date: Date): string | undefined;
	public findCertificateErrorNow(c: CommonCertificateInfo): string | undefined {
		return this.findCertificateError(c, new Date());
	}
	public checkCertificate(c: CommonCertificateInfo) {
		const date = new Date();
		const error = this.findCertificateError(c, date);
		if (error != null) throw new Error(error);
	}
}
class TousAntiCovidRules extends RuleSet {
	constructor(public vaccinePass?: boolean) {
		super();
	}
	findCertificateError(c: CommonCertificateInfo, date: Date): string | undefined {
		return findCertificateError(c, date, this.vaccinePass);
	}
}

export const PASS_VALIDITY_RULES = {
	tousAntiCovidDefaultRules: new TousAntiCovidRules(),
	tousAntiCovidVaccineRules: new TousAntiCovidRules(true),
	tousAntiCovidHealthRules: new TousAntiCovidRules(false)
} as const;

export type ValidityRuleName = keyof typeof PASS_VALIDITY_RULES;
