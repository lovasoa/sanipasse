// Node.js script to refresh the accepted certificates list
import base64 from 'base64-js';
import fetch from 'node-fetch';
import { X509Certificate, PublicKey } from '@peculiar/x509';
import crypto from 'isomorphic-webcrypto';
import fs from 'fs';

const OUTFILE = 'src/assets/Digital_Green_Certificate_Signing_Keys.json';
const ALL_DATA_FILE = '/tmp/tacv_data.json';
// Concatenated sh256 fingerprints of blacklisted certificates
const BLACKLIST_FILE = 'src/assets/blacklist_text.json';
const ENDPOINT = 'https://portail.tacv.myservices-ingroupe.com';

async function main() {
	const TOKEN = process.env['TACV_TOKEN'];
	if (!TOKEN)
		return console.log(
			'Missing environment variable TACV_TOKEN. ' +
				'You can get the value of the token from the TousAntiCovid Verif application.'
		);

	await Promise.all([handle_blacklist(TOKEN), handle_tacv_data(TOKEN)]);
}

async function handle_tacv_data(TOKEN) {
	const tacv_data = await get_data(TOKEN);
	await Promise.all([
		save_tacv_data(tacv_data),
		save_validity_data(tacv_data),
		save_certs(tacv_data)
	]);
}

async function handle_blacklist(TOKEN) {
	const promises = ['dcc', '2ddoc'].map((t) => get_blacklist(t, TOKEN));
	const blacklists = await Promise.all(promises);
	await save_blacklist(blacklists.flat());
}

async function save_tacv_data(tacv_data) {
	await fs.promises.writeFile(ALL_DATA_FILE, JSON.stringify(tacv_data));
	console.log('Saved all data to ' + ALL_DATA_FILE);
}

async function save_certs(tacv_data) {
	const certs = await get_certs(tacv_data);
	const contents = JSON.stringify(certs, null, '\t') + '\n';
	await fs.promises.writeFile(OUTFILE, contents);
	console.log(`Wrote ${Object.keys(certs).length} certificates to ${OUTFILE}`);
}

async function get_data(token) {
	const resp = await fetch(`${ENDPOINT}/api/client/configuration/synchronisation/tacv`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (resp.status !== 200) throw new Error(`API returned error: ${await resp.text()}`);
	console.log('Fetched validity and certificates data');
	return await resp.json();
}

async function save_validity_data(tacv_data) {
	const VALIDITY_DATA_FILE = 'src/assets/validity_data.json';
	const validity = tacv_data.specificValues.validity;
	const sorted = Object.fromEntries(Object.entries(validity).sort(([a], [b]) => (a > b ? 1 : -1)));
	await writeNiceJson(sorted, VALIDITY_DATA_FILE);
	console.log('Saved validity data to ' + VALIDITY_DATA_FILE);
}

/**
 * @param {'dcc'|'2ddoc'} type blacklist type
 * @param {string} token JWT token
 * @returns {string[]} hex digest of blacklisted certificates
 */
async function get_blacklist(type, token) {
	const resp = await fetch(`${ENDPOINT}/api/client/configuration/blacklist/tacv/${type}/0`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (resp.status !== 200) throw new Error(`API returned error: ${await resp.text()}`);
	const { elements, _lastIndexBlacklist } = await resp.json();
	console.log(`Fetched ${elements.length} blacklisted ${type} certificates`);
	return elements.flatMap(({ hash, active }) => (active ? [hash] : []));
}

async function save_blacklist(blacklist) {
	await writeNiceJson(blacklist.join(' '), BLACKLIST_FILE);
	console.log(`Saved ${blacklist.length}-item blacklist to ${BLACKLIST_FILE}`);
}

async function writeNiceJson(data, filename) {
	const nice = JSON.stringify(data, null, '\t') + '\n';
	return fs.promises.writeFile(filename, nice);
}

async function get_certs(tacv_data) {
	const entries = Object.entries(tacv_data.certificatesDCC);
	const parsed = await Promise.all(
		entries.map(async ([kid, cert]) => {
			return [kid, await parseCert(cert)];
		})
	);
	const sorted = parsed
		.filter((cert) => !!cert) // Remove certificates that could not be decoded
		.sort(([_k1, a], [_k2, b]) => (a.subject < b.subject ? -1 : 1));
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
		...(await exportPublicKeyInfo(x509cert.publicKey))
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
		serialNumber: '',
		subject: 'UNKNOWN',
		issuer: 'UNKNOWN',
		notBefore: '2020-01-01',
		notAfter: '2030-01-01',
		signatureAlgorithm: '',
		fingerprint: '',
		...(await exportPublicKeyInfo(new PublicKey(pem)))
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
