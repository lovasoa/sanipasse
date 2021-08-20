import crypto from 'isomorphic-webcrypto';

export	async function sha256(i: string): Promise<string> {
    const input_bytes = new TextEncoder().encode(i);
    const digest_bytes = await crypto.subtle.digest('SHA-256', input_bytes);
    return hex(digest_bytes);
}

function hex(i: ArrayBuffer): string {
    return [...new Uint8Array(i)].map((n) => n.toString(16).padStart(2, '0')).join('');
}