import base64 from 'base64-js';
import crypto from 'isomorphic-webcrypto';

export function generateKey(byte_length = 9): string {
	const bytes = crypto.getRandomValues(new Uint8Array(byte_length));
	return base64.fromByteArray(bytes).replace(/[/]/g, '-').replace(/\+/g, '_');
}
