/**
 * Digital Green Certificate is a standard that was defined by the EU in an attempt
 * to standardize vaccination, tests and recovery proofs across member states.
 * All the specifications are available here: https://ec.europa.eu/health/ehealth/covid-19_en
 *
 * This GitHub repo provides an overview of how it works: https://github.com/ehn-dcc-development/hcert-spec
 *
 * In a nutshell, data is encoded in the following way: QRCode(ZLIB(COSE_signed(CBOR(payload))))
 * (the ZLIB step is optional)
 *
 * The payload schema can be found here: https://github.com/ehn-digital-green-development/ehn-dgc-schema/
 */
import { decode as decodeb45 } from 'base45-ts';
import { Buffer } from 'buffer';
import { inflate } from 'pako';
import * as cbor from 'cbor-web';
import type { HCert } from './digital_green_certificate_types';

interface UnsafeDGC {
	hcert: HCert;
	kid: string;
	issuer: string | null;
	issuedAt: number | null;
	expiresAt: number | null;
}

interface DGC extends UnsafeDGC {
	isSignatureValid: boolean;
	certificate: string;
}

const COSE_HEADERS = Object.freeze({
	KID: 4
});

// As per https://ec.europa.eu/health/sites/default/files/ehealth/docs/digital-green-certificates_v3_en.pdf
// Section 2.6.3
const CWT_CLAIMS = Object.freeze({
	ISSUER: 1,
	EXPIRATION: 4,
	ISSUED_AT: 6,
	HCERT: -260
});

export const DGC_PREFIX = 'HC1:';

async function extractCoseFromQRCode(qrCode: string): Promise<Uint8Array> {
	// Strip prefix
	if (!qrCode.startsWith(DGC_PREFIX)) {
		throw new Error('HCERT must start with HC1:');
	}
	qrCode = qrCode.replace(DGC_PREFIX, '');

	// Base45
	let coseData = decodeb45(qrCode);

	// ZLIB
	try {
		coseData = inflate(coseData);
	} catch (err) {
		// Probably not ZLIBed, that's OK
	}

	return coseData;
}

/**
 * Parse the COSE data without any signature check.
 */
async function unsafeDGCFromCoseData(rawCoseData: Uint8Array): Promise<UnsafeDGC> {
	// COSE is just some CBOR-serialized data.
	const coseData = await cbor.decodeFirst(rawCoseData);
	const coseValue = coseData?.value;
	if (!coseValue || !Array.isArray(coseValue) || coseValue.length !== 4) {
		throw Error('Unexpected COSE data. DGC is probably invalid.');
	}
	const [phdrsData, _uhdrs, cosePayload, _signers] = coseValue;

	// Extract the KID and the payload
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const phdrs: Map<number, any> = await cbor.decodeFirst(phdrsData);
	const rawKid = phdrs.get(COSE_HEADERS.KID);
	if (!rawKid) {
		throw Error('Cannot find a KID in COSE Data. DGC is probably invalid.');
	}
	const kid = Buffer.from(rawKid).toString('base64');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const cborData: Map<number, any> = await cbor.decodeFirst(cosePayload);

	// TODO validate HCERT against the JSON schema.

	return {
		hcert: cborData.get(CWT_CLAIMS.HCERT),
		kid,
		issuer: cborData.get(CWT_CLAIMS.ISSUER) || null,
		issuedAt: cborData.get(CWT_CLAIMS.ISSUED_AT) || null,
		expiresAt: cborData.get(CWT_CLAIMS.ISSUED_AT) || null
	};
}

/**
 * Check the DGC Signature.
 */
async function checkDGCSignature(dgc: UnsafeDGC, _rawCoseData: Uint8Array): Promise<DGC> {
	// TODO
	return {
		...dgc,
		isSignatureValid: false,
		certificate: ''
	};
}

export async function parse(doc: string): Promise<DGC> {
	try {
		const rawCoseData = await extractCoseFromQRCode(doc);

		// We need to parse COSE data without verifying signature first:
		//   - to get the KID that was used
		//   - to allow inspection of the data on invalid signature as
		// 	   cosette doesn't seem to permit that yet.
		const dgc = await unsafeDGCFromCoseData(rawCoseData);

		return checkDGCSignature(dgc, rawCoseData);
	} catch (err) {
		// FIXME: For debugging purposes ATM. Remove that try/catch block at some point.
		console.error('Error while decoding QR Code:', err);

		throw err;
	}
}
