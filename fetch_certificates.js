// Node.js script to refresh the accepted certificates list
import base64 from 'base64-js';
import fetch from 'node-fetch';
import { X509Certificate } from '@peculiar/x509';

async function main() {
	const TOKEN = process.env['TACV_TOKEN'];
	await get_data(TOKEN);
}

async function get_data(token) {
	const ENDPOINT = 'https://portail.tacv.myservices-ingroupe.com';
	const resp = await fetch(`${ENDPOINT}/api/client/configuration/synchronisation/tacv`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (resp.status !== 200) throw new Error(`API returned error: ${await resp.text()}`);
	const { certificates2DDoc, certificatesDCC } = await resp.json();
	const sorted = Object.entries(certificatesDCC).sort(([a], [b]) => (a > b ? 1 : -1));

	for (const [kid, cert] of sorted) {
		console.log(kid, cert);
		const raw = base64.toByteArray(cert);
		const pem = new TextDecoder().decode(raw);
		console.log(new X509Certificate(pem));
	}
}

main();
