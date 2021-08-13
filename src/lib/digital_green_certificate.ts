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
import Ajv from 'ajv/dist/2020.js'; // .js extension seems required to build successfully :(
import { decode as decodeb45 } from 'base45-ts';
import { fromByteArray as encodeb64, toByteArray as decodeb64 } from 'base64-js';
import { verify, webcrypto, cbor } from 'cosette/build/sign.js';
import type { Verifier } from 'cosette/build/sign.js';

import { inflate } from 'pako';
import DCCSchema from '../assets/DCC.combined-schema.1.3.0.json';
const DCCCertsPromise = import('../assets/Digital_Green_Certificate_Signing_Keys.json');
import type { HCert } from './digital_green_certificate_types';
import type { CommonCertificateInfo } from './common_certificate_info';
import { DGC_PREFIX } from './detect_certificate';

interface RawDGC {
	hcert: HCert;
	kid: string;
	issuer: string | null;
	issuedAt: number | null;
	expiresAt: number | null;
	certificate: DSC;
}

export interface DGC extends RawDGC {
	code: string;
}

/**
 * Per specification, a DSC is a certificate that contains
 * a public key used to sign DGCs.
 */
export interface DSC {
	serialNumber: string;
	subject: string;
	// This is the CSCA. Per specification, a CSCA is a root
	// certificate authority of a member state.
	issuer: string;
	notBefore: string;
	notAfter: string;
	signatureAlgorithm: string;
	fingerprint: string;
	publicKeyAlgorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams;
	publicKeyPem: string;
}

export class DgcError extends Error {
	hcert: HCert;
	constructor(hcert: HCert) {
		super(`Ce certificat est invalide: ${JSON.stringify(hcert, null, '\t')}`);
		this.hcert = hcert;
	}
}
export class DgcIssuedInFutureError extends DgcError {
	name = 'Date de signature dans le futur';
	issuedAt: Date;
	constructor(hcert: HCert, issuedAt: number) {
		super(hcert);
		this.issuedAt = new Date(issuedAt * 1000);
		this.message =
			`Ce certificat contient une date de signature fixée au ${this.issuedAt.toLocaleDateString()} ` +
			`mais la date actuelle est ${new Date().toLocaleDateString()}`;
	}
}
export class ExpiredDgcError extends DgcError {
	name = 'Signature expirée';
	expiresAt: Date;
	constructor(hcert: HCert, expiresAt: number) {
		super(hcert);
		this.expiresAt = new Date(expiresAt * 1000);
		this.message =
			`Ce certificat a une signature valide, mais contient une date d'expiration fixée au ${this.expiresAt.toLocaleDateString()}` +
			` alors que nous sommes actuellement le ${new Date().toLocaleDateString()}. ` +
			`Informations brutes: ${JSON.stringify(hcert, null, '\t')}`;
	}
}
export class UnknownKidError extends Error {
	kid: string;
	constructor(kid: string) {
		super(`Ce certificat n'a pas été signé par une entité reconnue. kid: ${kid}'`);
		this.kid = kid;
	}
}
export class InvalidCertificateError extends Error {
	constructor(certificate: DSC) {
		super(`Certificat de signature invalide ou périmé: ${JSON.stringify(certificate)}`);
	}
}

// As per https://ec.europa.eu/health/sites/default/files/ehealth/docs/digital-green-certificates_v3_en.pdf
// Section 2.6.3
const CWT_CLAIMS = Object.freeze({
	ISSUER: 1,
	EXPIRATION: 4,
	ISSUED_AT: 6,
	HCERT: -260
});

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
 * Parse the COSE data
 */
async function parseDGCFromCoseData(rawCoseData: Uint8Array): Promise<RawDGC> {
	let kid = '';
	let certificate = (undefined as unknown) as DSC; // defined in verifierFn

	/**
	 * Get a Verifier given a kid
	 */
	async function verifierFn(kid_bytes: Uint8Array): Promise<Verifier> {
		kid = encodeb64(kid_bytes);
		certificate = await findDGCPublicKey(kid);
		const key = await getCertificatePublicKey(certificate);
		return { key };
	}

	const rawData: Uint8Array = await verify(rawCoseData, verifierFn);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const cborData: Map<number, any> = await cbor.decodeFirst(rawData);
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

	const issuer = cborData.get(CWT_CLAIMS.ISSUER);
	const issuedAt = cborData.get(CWT_CLAIMS.ISSUED_AT);
	const expiresAt = cborData.get(CWT_CLAIMS.EXPIRATION);

	const now = Math.floor(Date.now() / 1000);
	if (issuedAt && now < issuedAt) throw new DgcIssuedInFutureError(hcert, issuedAt);
	if (expiresAt && expiresAt < now) throw new ExpiredDgcError(hcert, expiresAt);

	return { hcert, kid, issuer, issuedAt, expiresAt, certificate };
}

/**
 * Find the DSC that matches this DSC KID.
 */
async function findDGCPublicKey(kid: string): Promise<DSC> {
	const DCCCerts = (await DCCCertsPromise).default;
	// Find the KID in known DSCs
	if (!(kid in DCCCerts)) throw new UnknownKidError(kid);
	const certificate: DSC = DCCCerts[kid as keyof typeof DCCCerts];
	const notAfter = new Date(certificate.notAfter);
	const notBefore = new Date(certificate.notBefore);
	// Verify that the certificate is still valid.
	const now = new Date();
	if (now > notAfter || now < notBefore) throw new InvalidCertificateError(certificate);
	return certificate;
}

async function getCertificatePublicKey({
	publicKeyAlgorithm,
	publicKeyPem
}: DSC): Promise<CryptoKey> {
	const der = decodeb64(publicKeyPem);
	const public_key = await webcrypto.subtle.importKey('spki', der, publicKeyAlgorithm, true, [
		'verify'
	]);
	return public_key;
}

function getCertificateInfo(cert: DGC): CommonCertificateInfo {
	const hcert = cert.hcert;
	const common = {
		first_name: hcert.nam.gn || (hcert.nam.gnt || '-').replace(/</g, ' '),
		last_name: hcert.nam.fn || hcert.nam.fnt.replace(/</g, ' '),
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
			...common
		};
	}
	if (hcert.t && hcert.t.length) {
		return {
			type: 'test',
			test_date: new Date(hcert.t[0].sc),
			// 260415000=not detected: http://purl.bioontology.org/ontology/SNOMEDCT/260415000
			is_negative: hcert.t[0].tr === '260415000',
			is_inconclusive: !['260415000', '260373001'].includes(hcert.t[0].tr),
			...common
		};
	}
	if (hcert.r && hcert.r.length) {
		return {
			type: 'test',
			test_date: new Date(hcert.r[0].fr), // date of positive test
			is_negative: false,
			is_inconclusive: false,
			...common
		};
	}
	throw new Error('Unsupported or empty certificate: ' + JSON.stringify(cert));
}

export async function parse(code: string): Promise<CommonCertificateInfo> {
	const rawCoseData = await extractCoseFromQRCode(code);
	const dgc = await parseDGCFromCoseData(rawCoseData);
	return getCertificateInfo({ ...dgc, code });
}
