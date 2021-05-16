import base64 from 'base64-js';
import { base32Decode } from '@ctrl/ts-base32';
import crypto from 'isomorphic-webcrypto';

const ALGO = { name: 'ECDSA', hash: 'SHA-256' };
const KEY_PARAMS = { name: 'ECDSA', namedCurve: 'P-256' };

const subtle = crypto?.subtle;

async function key(key_b64: string): Promise<CryptoKey | 'unsupported'> {
	if (!subtle) return 'unsupported';
	const key_bin = base64.toByteArray(key_b64);
	return subtle.importKey('spki', key_bin, KEY_PARAMS, false, ['verify']);
}

// Public keys from https://gitlab.inria.fr/stopcovid19/stopcovid-android/-/blob/master/stopcovid/src/main/assets/Config/config.json
const PUB_KEYS = new Map([
	[
		'AHP1',
		key(
			'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEPnxJntwNwme9uHSasmGFFwdC0FWNEpucgzhjr+/AZ6UuTm3kL3ogEUAwKU0tShEVmZNK4/lM05h+0ZvtboJM/A=='
		)
	],
	[
		'AHP2',
		key(
			'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEOYUgmx8pKu0UbyqQ/kt4+PXSpUprkO2YLHmzzoN66XjDW0AnSzXorFPe556p73Vawqaoy3qQKDIDB62IBYWBuA=='
		)
	],
	[
		'AV01',
		key(
			'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1T9uG2bEP7uWND6RT/lJs2y787BkEJoRMMLXvqPKFFC3ckqFAPnFjbiv/odlWH04a1P9CvaCRxG31FMEOFZyXA=='
		)
	],
	[
		'AV02',
		key(
			'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE3jL6zQ0aQj9eJHUw4VDHB9sMoviLVIlADnoBwC43Md8p9w655z2bDhYEEajQ2amQzt+eU7HdWrvqY23Do91Izg=='
		)
	]
]);

async function ecdsa_verify(
	public_key: CryptoKey,
	signature: ArrayBufferLike,
	data: ArrayBufferLike
): Promise<void> {
	const valid = await subtle.verify(ALGO, public_key, signature, data);
	if (!valid) throw new Error('🚨 Signature invalide; ce certificat est peut-être contrefait');
}

export async function check_signature(
	data: string,
	public_key_id: string,
	signature_base32: string
): Promise<void> {
	const public_key_promise = PUB_KEYS.get(public_key_id);
	if (!public_key_promise)
		throw new Error(
			`🤨 Certificat signé par une entité non reconnue ${public_key_id};` +
				`ce certificat est peut-être contrefait.`
		);
	const public_key = await public_key_promise;
	if (public_key === 'unsupported')
		throw new Error('Votre navigateur ne sait pas vérifier les signatures électroniques');
	const signature = base32Decode(signature_base32);
	const data_binary = new TextEncoder().encode(data);
	return ecdsa_verify(public_key, signature, data_binary);
}
