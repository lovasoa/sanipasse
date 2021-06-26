import type { Certificate2ddoc } from './2ddoc';
import { parse as parse_2ddoc } from './2ddoc';
import { DGC_PREFIX, parse as parse_dgc } from './digital_green_certificate';
import type { DigitalGreenCertificate } from './digital_green_certificate_types';

/**
 * Detects the type of a certificate and parses it
 */
export async function parse_any(doc: string): Promise<Certificate2ddoc> {
	if (doc.startsWith(DGC_PREFIX)) {
		await parse_dgc(doc);
		throw Error('HCert unsupported for now.');
	} else {
		return parse_2ddoc(doc);
	}
}

export interface CommonCertificateInfo {
	type: 'vaccination' | 'test' | 'recovery';
	first_name: string;
	last_name: string;
	date_of_birth: Date;
	source:
		| { format: 'dgc'; cert: DigitalGreenCertificate }
		| { format: '2ddoc'; cert: Certificate2ddoc };
}

export function getCertificateInfo(
	cert: Certificate2ddoc | DigitalGreenCertificate
): CommonCertificateInfo {
	if ('vaccinated_first_name' in cert) {
		return {
			type: 'vaccination',
			first_name: cert.vaccinated_first_name,
			last_name: cert.vaccinated_last_name,
			date_of_birth: cert.vaccinated_birth_date,
			source: { format: '2ddoc', cert }
		};
	} else if ('tested_first_name' in cert) {
		return {
			type: 'test',
			first_name: cert.tested_first_name,
			last_name: cert.tested_last_name,
			date_of_birth: cert.tested_birth_date,
			source: { format: '2ddoc', cert }
		};
	} else if ('dob' in cert) {
		return {
			type: (cert.t && 'test') || (cert.v && 'vaccination') || 'recovery',
			first_name: cert.nam.gnt || cert.nam.gn || '-',
			last_name: cert.nam.fnt,
			date_of_birth: new Date(cert.dob),
			source: { format: 'dgc', cert }
		};
	}
	throw new Error('Unsupported certificate');
}
