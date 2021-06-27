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
import { X509Certificate } from '@peculiar/x509';
import Ajv from 'ajv/dist/2020.js'; // .js extension seems required to build successfully :(
import { decode as decodeb45 } from 'base45-ts';
import { Buffer } from 'buffer';
import { SignatureMismatchError, verify } from 'cosette/build/sign.js';
import * as cbor from 'cbor-web';
import { inflate } from 'pako';
import DCCSchema from '../assets/DCC.combined-schema.1.3.0.json';
import DCCCerts from '../assets/dccCerts.json';
import type { HCert } from './digital_green_certificate_types';

interface UnsafeDGC {
	hcert: HCert;
	kid: string;
	issuer: string | null;
	issuedAt: number | null;
	expiresAt: number | null;
}

/**
 * Per specification, a DSC is a certificate that contains
 * a public key used to sign DGCs.
 */
interface DSC {
	serialNumber: string;
	subject: string;
	// This is the CSCA. Per specification, a CSCA is a root
	// certificate authority of a member state.
	issuer: string;
	notBefore: string;
	notAfter: string;
	signatureAlgorithm: string;
	fingerprint: string;
	signature: string;
	publicKeyAlgorithm: string;
	publicKeyFingerprint: string;
	publicKeyPem: string;
}

export const DGC_ERROR_ISSUED_IN_FUTURE = 'DGC_ISSUED_IN_FUTURE';
export const DGC_ERROR_EXPIRED = 'DGC_EXPIRED';
export const DGC_ERROR_UNKNOWN_KID = 'DGC_UNKNOWN_KID';
export const DGC_ERROR_INVALID_CERTIFICATE = 'DGC_INVALID_CERTIFICATE';
export const DGC_ERROR_INVALID_SIGNATURE = 'DGC_INVALID_SIGNATURE';
export type DGC_ERROR =
	| typeof DGC_ERROR_ISSUED_IN_FUTURE
	| typeof DGC_ERROR_EXPIRED
	| typeof DGC_ERROR_UNKNOWN_KID
	| typeof DGC_ERROR_INVALID_CERTIFICATE
	| typeof DGC_ERROR_INVALID_SIGNATURE;

export interface DGC extends UnsafeDGC {
	isValid: boolean;
	errors: DGC_ERROR[];
	certificate: DSC | null;
	code: string;
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

	// Validate the payload against the JSON schema.
	const hcert = cborData.get(CWT_CLAIMS.HCERT)?.get(1) || {};
	const ajv = new Ajv();
	// Enhance the validator with their custom properties:
	const dateValidator = (s: string) => !isNaN(Date.parse(s));
	ajv.addFormat('date', dateValidator);
	ajv.addFormat('date-time', dateValidator);
	ajv.addKeyword('valueset-uri'); // We won't validate that.
	const hcertValid = ajv.validate(DCCSchema, hcert);
	if (!hcertValid) {
		const validationErrors = ajv.errors?.map((err) => err.message).join('\n');
		throw Error(`DGC validation failed:\n${validationErrors}.`);
	}

	return {
		hcert,
		kid,
		issuer: cborData.get(CWT_CLAIMS.ISSUER) || null,
		issuedAt: cborData.get(CWT_CLAIMS.ISSUED_AT) || null,
		expiresAt: cborData.get(CWT_CLAIMS.EXPIRATION) || null
	};
}

async function exportPublicKeyToPEM(pk: CryptoKey): Promise<string> {
	const spki = await crypto.subtle.exportKey('spki', pk);

	let pem = Buffer.from(spki).toString('base64');
	// Non-null assertion should be safe here because PEM are never empty.
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	pem = pem.match(/.{1,64}/g)!.join('\n');
	pem = `-----BEGIN PUBLIC KEY-----\n${pem}\n-----END PUBLIC KEY-----`;

	return pem;
}

/**
 * Verifies the CWT claims of the DGC.
 */
async function verifyDGCClaims(dgc: DGC): Promise<void> {
	const now = Math.floor(Date.now() / 1000);

	if (dgc.issuedAt !== null && now < dgc.issuedAt) {
		dgc.errors.push(DGC_ERROR_ISSUED_IN_FUTURE);
	}

	if (dgc.expiresAt !== null && dgc.expiresAt < now) {
		dgc.errors.push(DGC_ERROR_EXPIRED);
	}
}

/**
 * Find the DSC that matches this DSC KID.
 */
async function findDGCPublicKey(dgc: DGC): Promise<CryptoKey | undefined> {
	// Find the KID in known DSCs
	if (!(dgc.kid in DCCCerts)) {
		// Unknown KID
		dgc.errors.push(DGC_ERROR_UNKNOWN_KID);
		return undefined;
	}

	const pem = DCCCerts[dgc.kid as keyof typeof DCCCerts];
	const x509cert = new X509Certificate(pem);
	const pk = await x509cert.publicKey.export();

	// Export the certificate data.
	dgc.certificate = {
		serialNumber: x509cert.serialNumber,
		subject: x509cert.subject,
		issuer: x509cert.issuer,
		notBefore: x509cert.notBefore.toISOString(),
		notAfter: x509cert.notAfter.toISOString(),
		signatureAlgorithm: x509cert.signatureAlgorithm.name,
		signature: Buffer.from(x509cert.signature).toString('base64'),
		fingerprint: Buffer.from(await x509cert.getThumbprint()).toString('hex'),
		publicKeyAlgorithm: x509cert.publicKey.algorithm.name,
		publicKeyFingerprint: Buffer.from(await x509cert.publicKey.getThumbprint()).toString('hex'),
		publicKeyPem: await exportPublicKeyToPEM(pk)
	};

	// Verifiy that the certificat is still valid.
	if (!x509cert.verify()) {
		dgc.errors.push(DGC_ERROR_INVALID_CERTIFICATE);
	}

	return pk;
}

/**
 * Verify the DGC signature.
 */
async function verifyDGCSignature(
	dgc: DGC,
	rawCoseData: Uint8Array,
	key: CryptoKey
): Promise<void> {
	try {
		await verify(rawCoseData, { key });
	} catch (err) {
		if (err instanceof SignatureMismatchError) {
			dgc.errors.push(DGC_ERROR_INVALID_SIGNATURE);
		}
		throw err;
	}
}

/**
 * Verify that the DGC is authentic:
 *   - Check that the certificate is still valid
 *   - Check the COSE signature
 *   - Check the CWT claims
 */
async function verifyDGC(
	unsafeDGC: UnsafeDGC,
	rawCoseData: Uint8Array,
	code: string
): Promise<DGC> {
	const dgc: DGC = {
		...unsafeDGC,
		isValid: false,
		errors: [],
		certificate: null,
		code
	};

	await verifyDGCClaims(dgc);

	const pk = await findDGCPublicKey(dgc);
	if (!pk) {
		return dgc;
	}

	await verifyDGCSignature(dgc, rawCoseData, pk);

	dgc.isValid = dgc.errors.length === 0;
	return dgc;
}

export async function parse(doc: string): Promise<DGC> {
	try {
		const rawCoseData = await extractCoseFromQRCode(doc);

		// We need to parse COSE data without verifying signature first:
		//   - to get the KID that was used
		//   - to allow inspection of the data on invalid signature as
		// 	   cosette doesn't seem to permit that yet.
		const dgc = await unsafeDGCFromCoseData(rawCoseData);

		return verifyDGC(dgc, rawCoseData, doc);
	} catch (err) {
		// FIXME: For debugging purposes ATM. Remove that try/catch block at some point.
		console.error('Error while decoding QR Code:', err);

		throw err;
	}
}
