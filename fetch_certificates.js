// Node.js script to refresh the accepted certificates list
import base64 from 'base64-js';
import fetch from 'node-fetch';
import { X509Certificate } from '@peculiar/x509';
import crypto from 'isomorphic-webcrypto';
import fs from 'fs';

async function main() {
	const OUTFILE = 'src/assets/Digital_Green_Certificate_Signing_Keys.json';
	const TOKEN = process.env['TACV_TOKEN'];
	if (!TOKEN)
		return console.log(
			'Missing environment variable TACV_TOKEN.' +
				'You can get the value of the token from the TousAntiCovid Verif application.'
		);
	const certs = await get_data(TOKEN);
	await fs.promises.writeFile(OUTFILE, JSON.stringify(certs, null, '\t'));
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
		entries.map(async ([kid, cert]) => [kid, await parseCert(cert)])
	);
	const sorted = parsed.sort(([k1, a], [k2, b]) => (a.subject < b.subject ? -1 : 1));
	return Object.fromEntries(sorted);
}
async function parseCert(cert) {
	// Certs are doube-base64 encoded
	const raw = base64.toByteArray(cert);
	const pem = new TextDecoder().decode(raw);
	return exportCertificate(pem);
}

async function exportCertificate(pem) {
	const x509cert = new X509Certificate(pem);
    const public_key = await x509cert.publicKey.export(crypto);
	const spki = await crypto.subtle.exportKey('spki', public_key);

	// Export the certificate data.
	return {
		serialNumber: x509cert.serialNumber,
		subject: x509cert.subject,
		issuer: x509cert.issuer,
		notBefore: x509cert.notBefore.toISOString(),
		notAfter: x509cert.notAfter.toISOString(),
		signatureAlgorithm: x509cert.signatureAlgorithm.name,
		fingerprint: Buffer.from(await x509cert.getThumbprint(crypto)).toString('hex'),
		publicKeyAlgorithm: public_key.algorithm,
		publicKeyPem: Buffer.from(spki).toString('base64')
	};
}

main();
