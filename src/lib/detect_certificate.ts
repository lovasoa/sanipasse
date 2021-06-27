import type { Certificate2ddoc } from './2ddoc';
import { parse as parse_2ddoc } from './2ddoc';
import { DGC, DGC_PREFIX, parse as parse_dgc } from './digital_green_certificate';
import type { DBEvent } from './event';

/**
 * Detects the type of a certificate and parses it
 */
export async function parse_any(doc: string): Promise<CommonCertificateInfo> {
	const parsed = doc.startsWith(DGC_PREFIX)
		? parse_dgc(doc)
		: parse_2ddoc(doc);
	return getCertificateInfo(await parsed)
}

export interface CommonVaccineInfo {
	type: 'vaccination';
	vaccination_date: Date;
	prophylactic_agent: string;
	doses_received: number;
	doses_expected: number;
}

export interface CommonTestInfo {
	type: 'test';
	test_date: Date;
	is_negative: boolean;
}

export interface AllCommonInfo {
	first_name: string;
	last_name: string;
	date_of_birth: Date;
	code: string;
	source:
	| { format: 'dgc'; cert: DGC }
	| { format: '2ddoc'; cert: Certificate2ddoc };
}

export type CommonCertificateInfo = AllCommonInfo & (CommonVaccineInfo | CommonTestInfo);

function getCertificateInfo(
	cert: Certificate2ddoc | DGC
): CommonCertificateInfo {
	if ('vaccinated_first_name' in cert) {
		return {
			type: 'vaccination',
			vaccination_date: cert.last_dose_date,
			prophylactic_agent: cert.prophylactic_agent,
			doses_received: cert.doses_received,
			doses_expected: cert.doses_expected,
			first_name: cert.vaccinated_first_name,
			last_name: cert.vaccinated_last_name,
			date_of_birth: cert.vaccinated_birth_date,
			code: cert.code,
			source: { format: '2ddoc', cert }
		};
	} else if ('tested_first_name' in cert) {
		return {
			type: 'test',
			test_date: cert.analysis_datetime,
			is_negative: cert.analysis_result === 'N',
			first_name: cert.tested_first_name,
			last_name: cert.tested_last_name,
			date_of_birth: cert.tested_birth_date,
			code: cert.code,
			source: { format: '2ddoc', cert }
		};
	} else if ('hcert' in cert) {
		const hcert = cert.hcert;
		const common = {
			first_name: hcert.nam.gnt || hcert.nam.gn || '-',
			last_name: hcert.nam.fnt,
			date_of_birth: new Date(hcert.dob),
			code: cert.code,
			source: { format: 'dgc', cert }
		} as const;
		if (hcert.v && hcert.v.length) {
			return {
				type: 'vaccination',
				vaccination_date: new Date(hcert.v[0].dt),
				prophylactic_agent: hcert.v[0].vp,
				doses_received: hcert.v[0].dn,
				doses_expected: hcert.v[0].sd,
				...common,
			}
		}
		if (hcert.t && hcert.t.length) {
			return {
				type: 'test',
				test_date: new Date(hcert.t[0].sc),
				// 260415000=not detected: http://purl.bioontology.org/ontology/SNOMEDCT/260415000
				is_negative: hcert.t[0].tr === '260415000',
				...common,
			}
		}
		if (hcert.r && hcert.r.length) {
			return {
				type: 'test',
				test_date: new Date(hcert.r[0].fr), // date of positive test
				is_negative: false,
				...common,
			}
		}
	}
	throw new Error('Unsupported or empty certificate: ' + JSON.stringify(cert));
}

export function findCertificateError(c: CommonCertificateInfo, event?: DBEvent): string | undefined {
	const MAX_NEGATIVE_TEST_AGE_HOURS = 72;
	const MIN_POSITIVE_TEST_AGE_DAYS = 15;
	const MAX_POSITIVE_TEST_AGE_DAYS = 6 * 30;
	if (c.type === "vaccination") {
		if (c.doses_received < c.doses_expected)
			return `Vous n'avez reçu que ${c.doses_received} dose sur les ${c.doses_expected} que ce vaccin demande.`;
	} else { // test
		const target_date = event?.date || new Date();
		const test_age_hours = (+target_date - +c.test_date) / (3600 * 1000);
		const test_age_days = test_age_hours * 24;
		if (c.is_negative) {
			if (test_age_hours > MAX_NEGATIVE_TEST_AGE_HOURS)
				return (
					`Ce test a ${test_age_hours.toLocaleString('fr', { maximumFractionDigits: 0 })} heures.` +
					` Un test de moins de ${MAX_NEGATIVE_TEST_AGE_HOURS} heures est demandé.`
				);
		} else { //positive test
			if (test_age_days < MIN_POSITIVE_TEST_AGE_DAYS || test_age_days > MAX_POSITIVE_TEST_AGE_DAYS)
				return (
					`Ce test a ${test_age_days.toLocaleString('fr', { maximumFractionDigits: 0 })} jours.` +
					` Un test de plus de ${MIN_POSITIVE_TEST_AGE_DAYS} jours et de moins de ${MAX_POSITIVE_TEST_AGE_DAYS / 30} mois est demandé.`
				);
		}
	}
}