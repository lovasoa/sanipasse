// Node.js script to refresh the accepted certificates list
import base64 from 'base64-js';
import fetch from 'node-fetch';
import { X509Certificate, PublicKey } from '@peculiar/x509';
import crypto from 'isomorphic-webcrypto';
import fs from 'fs';

async function main() {
	const OUTFILE = 'src/assets/Digital_Green_Certificate_Signing_Keys.json';
	const TOKEN = process.env['TACV_TOKEN'];
	if (!TOKEN)
		return console.log(
			'Missing environment variable TACV_TOKEN. ' +
			'You can get the value of the token from the TousAntiCovid Verif application.'
		);
	const certs = await get_data(TOKEN);
	const contents = JSON.stringify(certs, null, '\t') + '\n';
	await fs.promises.writeFile(OUTFILE, contents);
	console.log(`Wrote ${Object.keys(certs).length} certificates to ${OUTFILE}`);
}

async function get_data(token) {
	const ENDPOINT = 'https://portail.tacv.myservices-ingroupe.com';
	const resp = await fetch(`${ENDPOINT}/api/client/configuration/synchronisation/tacv`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (resp.status !== 200) throw new Error(`API returned error: ${await resp.text()}`);
	const { certificates2DDoc, certificatesDCC } = await resp.json();
	const entries = Object.entries(certificatesDCC);
	const parsed = await Promise.all(
		entries.map(async ([kid, cert]) => {
			return [kid, await parseCert(cert)]
		})
	);
	const sorted = parsed
		.filter(cert => !!cert) // Remove certificates that could not be decoded
		.sort(([k1, a], [k2, b]) => (a.subject < b.subject ? -1 : 1));
	return Object.fromEntries(sorted);
}
async function parseCert(cert) {
	// Certs are doube-base64 encoded
	const raw = base64.toByteArray(cert);
	const pem = new TextDecoder().decode(raw);
	try {
		return await exportCertificate(pem);
	} catch (err) {
		// The server returns both certificates and raw public keys
		return await exportPublicAsCert(pem);
	}
}

/**
 * @param {string} pem base64-encoded PEM x509 certificate
 * @returns {Promise<import("./src/lib/digital_green_certificate").DSC>}
 */
async function exportCertificate(pem) {
	const x509cert = new X509Certificate(pem);

	// Export the certificate data.
	return {
		serialNumber: x509cert.serialNumber,
		subject: x509cert.subject,
		issuer: x509cert.issuer,
		notBefore: x509cert.notBefore.toISOString(),
		notAfter: x509cert.notAfter.toISOString(),
		signatureAlgorithm: x509cert.signatureAlgorithm.name,
		fingerprint: Buffer.from(await x509cert.getThumbprint(crypto)).toString('hex'),
		...await exportPublicKeyInfo(x509cert.publicKey)
	};
}

/**
 * Generate a DSC from a single public key without certificate information
 * @param {string} pem base64-encoded PEM x509 certificate
 * @returns {Promise<import("./src/lib/digital_green_certificate").DSC>}
 */
async function exportPublicAsCert(pem) {
	// Export the certificate data.
	return {
		serialNumber: "",
		subject: "UNKNOWN",
		issuer: "UNKNOWN",
		notBefore: "2020-01-01",
		notAfter: "2030-01-01",
		signatureAlgorithm: "",
		fingerprint: "",
		...await exportPublicKeyInfo(new PublicKey(pem))
	};
}


/**
 * @param {PublicKey} pubkey
 * @returns {Promise<{
 * 	publicKeyAlgorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams;
 * 	publicKeyPem: string;
 * }>}
 */
async function exportPublicKeyInfo(publicKey) {
	const public_key = await publicKey.export(crypto);
	const spki = await crypto.subtle.exportKey('spki', public_key);

	// Export the certificate data.
	return {
		publicKeyAlgorithm: public_key.algorithm,
		publicKeyPem: Buffer.from(spki).toString('base64')
	};
}

main();
