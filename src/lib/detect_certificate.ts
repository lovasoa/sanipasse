import type { Certificate } from './2ddoc';
import { parse as parse_2ddoc } from './2ddoc';
import { DGC_PREFIX, parse as parse_dgc } from './digital_green_certificate';

/**
 * Detects the type of a certificate and parses it
 */
export async function parse_any(doc: string): Promise<Certificate> {
	if (doc.startsWith(DGC_PREFIX)) {
		await parse_dgc(doc);
		throw Error('HCert unsupported for now.');
	} else {
		return parse_2ddoc(doc);
	}
}
