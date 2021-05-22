import { check_signature } from '$lib/check_signature';
import type { DBEvent } from './event';
import type { Names } from './invitees';

const ALPHA = {
	regex: 'A-Z\\-\\./ ',
	parse: (s: string) => s
};
const ALPHANUM = {
	regex: '0-9A-Z\\-\\./ ',
	parse: (s: string) => s
};
const NUM = {
	regex: '0-9',
	parse: (s: string) => parseInt(s)
};
const DATE = {
	regex: '0-9',
	parse: (s: string) => {
		const day = s.substr(0, 2);
		const month = s.substr(2, 2);
		const year = s.substr(4, 4);
		const hours = s.substr(8, 2) || '12';
		const minutes = s.substr(10, 2) || '00';
		return new Date(`${year}/${month}/${day} ${hours}:${minutes}`);
	}
};

type PossibleFieldType = Date | string | number;

interface Field<T extends PossibleFieldType> {
	readonly code: string;
	readonly name: string;
	readonly minlen: number;
	readonly maxlen: number;
	readonly type: { readonly regex: string; parse: (x: string) => T };
}

function fieldRegex<T extends PossibleFieldType>(f: Field<T>): string {
	const chars = f.type.regex;
	const terminator = f.minlen != f.maxlen ? '[\\x1D\\x1E]' : '';
	return `${f.code}(?<${f.name}>[${chars}]{${f.minlen},${f.maxlen}})${terminator}`;
}

const TEST_FIELDS = [
	{ code: 'F0', name: 'tested_first_name', minlen: 0, maxlen: 60, type: ALPHA },
	{ code: 'F1', name: 'tested_last_name', minlen: 0, maxlen: 38, type: ALPHA },
	{ code: 'F2', name: 'tested_birth_date', minlen: 8, maxlen: 8, type: DATE },
	{ code: 'F3', name: 'sex', minlen: 1, maxlen: 1, type: ALPHA },
	{ code: 'F4', name: 'analysis_code', minlen: 3, maxlen: 7, type: ALPHANUM },
	{ code: 'F5', name: 'analysis_result', minlen: 1, maxlen: 1, type: ALPHA },
	{ code: 'F6', name: 'analysis_datetime', minlen: 12, maxlen: 12, type: DATE }
] as const;

const VACCINE_FIELDS = [
	{ code: 'L0', name: 'vaccinated_last_name', minlen: 0, maxlen: 80, type: ALPHA },
	{ code: 'L1', name: 'vaccinated_first_name', minlen: 0, maxlen: 80, type: ALPHA },
	{ code: 'L2', name: 'vaccinated_birth_date', minlen: 8, maxlen: 8, type: DATE },
	{ code: 'L3', name: 'disease', minlen: 0, maxlen: 30, type: ALPHANUM },
	{ code: 'L4', name: 'prophylactic_agent', minlen: 5, maxlen: 15, type: ALPHANUM },
	{ code: 'L5', name: 'vaccine', minlen: 5, maxlen: 30, type: ALPHANUM },
	{ code: 'L6', name: 'vaccine_maker', minlen: 5, maxlen: 30, type: ALPHANUM },
	{ code: 'L7', name: 'doses_received', minlen: 1, maxlen: 1, type: NUM },
	{ code: 'L8', name: 'doses_expected', minlen: 1, maxlen: 1, type: NUM },
	{ code: 'L9', name: 'last_dose_date', minlen: 8, maxlen: 8, type: DATE },
	{ code: 'LA', name: 'cycle_state', minlen: 2, maxlen: 2, type: ALPHA }
] as const;

type FIELDS_TYPES = typeof TEST_FIELDS | typeof VACCINE_FIELDS;
type OBJECT_WITH_FIELDS<FIELDS extends FIELDS_TYPES> = {
	[T in FIELDS[number]as T['name']]: ReturnType<T['type']['parse']>;
};

export type TestCertificate = OBJECT_WITH_FIELDS<typeof TEST_FIELDS>;
export type VaccineCertificate = OBJECT_WITH_FIELDS<typeof VACCINE_FIELDS>;
interface HeaderData {
	code: string,
	creation_date?: Date,
	signature_date?: Date,
}
export type Certificate = (VaccineCertificate | TestCertificate) & HeaderData;


function parse_2ddoc_date(date_str: string): Date | undefined {
	/**
	 * From the specification:
	 * Date d’émission du document indiquée par le nombre de jours en hexadécimal
	 * depuis le 1er janvier 2000.
	 * Par exemple, 0294 le 31 décembre 2011,
	 * il se sera écoulé 4382 jours, soit en 1F42 hexadécimal 111E.
	 * Si le document n’est pas daté, alors la valeur sera codée FFFF.
	 */
	if (!date_str || date_str === 'FFFF') return undefined;
	const days = parseInt(date_str, 16);
	const ms = days * 24 * 60 * 60 * 1000;
	const jan_2001 = new Date("2000-01-01");
	return new Date(+jan_2001 + ms);
}

function extract_data<F extends FIELDS_TYPES>(
	code: string,
	fields: F,
	o: Record<string, string>
): OBJECT_WITH_FIELDS<F> & HeaderData {
	const document_data: OBJECT_WITH_FIELDS<F> = Object.fromEntries(
		fields.map((f: Field<PossibleFieldType>) => {
			if (!(f.name in o)) throw new Error(`Missing data for field ${f.name}`);
			return [f.name, f.type.parse(o[f.name])];
		})
	);
	const header: HeaderData = {
		code,
		creation_date: parse_2ddoc_date(o.creation_date),
		signature_date: parse_2ddoc_date(o.signature_date),
	};
	return { ...header, ...document_data };
}

// See the specification at
// https://ants.gouv.fr/content/download/516/5665/version/11/file/Specifications-techniques-des-codes-a-barres_2D-Doc_v3.1.3.pdf

const TEST_REGEX = TEST_FIELDS.map((x) => fieldRegex<PossibleFieldType>(x)).join('');
const VACCINE_REGEX = VACCINE_FIELDS.map((x) => fieldRegex<PossibleFieldType>(x)).join('');

const HEADER_REGEX =
	'[A-Z\\d]{4}' +
	'(?<certificate_authority_id>[A-Z\\d]{4})' +
	'(?<public_key_id>[A-Z\\d]{4})' +
	'(?<creation_date>[A-Z\\d]{4})' +
	'(?<signature_date>[A-Z\\d]{4})' +
	'(?<certificate_type>B2|L1)' +
	'[A-Z\\d]{4}';

const SIGNATURE_REGEX =
	'\\x1F{1}' + // This character is separating the message from its signature.
	'(?<signature>[A-Z\\d\\=]+)'; // 14 - This is the message signature.

const TOTAL_REGEX = new RegExp(
	`^(?<data>${HEADER_REGEX}(?:${VACCINE_REGEX}|${TEST_REGEX}))${SIGNATURE_REGEX}$`
);

function extractLink(doc: string): string {
	doc = doc.trim();
	if (doc.startsWith('http')) {
		return new URL(doc).searchParams.get('v') || '';
	}
	return doc;
}

export function findCertificateError(c: Certificate, event?: DBEvent): string | undefined {
	const MAX_TEST_AGE_HOURS = 72;
	if ('vaccinated_first_name' in c) {
		if (c.doses_received < c.doses_expected)
			return `Vous n'avez reçu que ${c.doses_received} dose sur les ${c.doses_expected} que ce vaccin demande.`;
	} else {
		const target_date = event?.date || new Date();
		if (c.analysis_result !== 'N') return `Ce test n'est pas négatif !`;
		const test_age = (+target_date - +c.analysis_datetime) / (3600 * 1000);
		if (test_age > MAX_TEST_AGE_HOURS)
			return (
				`Ce test a ${test_age.toLocaleString('fr', { maximumFractionDigits: 0 })} heures.` +
				` Un test de moins de ${MAX_TEST_AGE_HOURS} heures est demandé.`
			);
	}
}

export async function parse(doc: string): Promise<Certificate> {
	doc = extractLink(doc);
	const groups = doc.match(TOTAL_REGEX)?.groups;
	if (!groups) throw new Error('Format de certificat invalide');
	const fields = groups.certificate_type === 'B2' ? TEST_FIELDS : VACCINE_FIELDS;
	const { data, public_key_id, signature } = groups;
	await check_signature(data, public_key_id, signature);
	return extract_data(doc, fields, groups);
}

export function getNamesAndBirtdate(c: Certificate): Names & { birth_date: Date } {
	if ('vaccinated_first_name' in c) {
		return {
			first_name: c.vaccinated_first_name,
			last_name: c.vaccinated_last_name,
			birth_date: c.vaccinated_birth_date
		};
	} else {
		return {
			first_name: c.tested_first_name,
			last_name: c.tested_last_name,
			birth_date: c.tested_birth_date
		};
	}
}
