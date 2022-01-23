import type { RequestHandler } from '@sveltejs/kit';
import { DATA_FOLDER, MAX_FILESIZE } from '$lib/global_config';
import fs from 'fs/promises';
import { ALLOWED_FILE_TYPES } from '$lib/file_types';

function checkKey(key: string): string {
	const match = key.match(/^[0-9a-f]{64}\.(.{2,4})$/);
	if (!match) throw new Error('Invalid name');
	const extension = match[1];
	const type = ALLOWED_FILE_TYPES[extension];
	if (!type) throw new Error('Invalid file type');
	return type;
}

export const get: RequestHandler = async ({ params: { key } }) => {
	const type = checkKey(key);
	const body = await fs.readFile(`${DATA_FOLDER}/${key}`);
	return {
		headers: {
			'Content-Type': type,
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Content-Security-Policy': "script-src 'none';"
		},
		body
	};
};

export const put: RequestHandler = async ({ params: { key }, request }) => {
	checkKey(key);
	const rawBody = await request.arrayBuffer();
	if (!rawBody || rawBody.byteLength === 0) return { status: 400, body: `missing request body` };
	if (rawBody.byteLength > MAX_FILESIZE)
		return { status: 413, body: `maximum file size: ${MAX_FILESIZE / 1_000_000} Mb` };
	await fs.writeFile(`${DATA_FOLDER}/${key}`, new DataView(rawBody));
	return { body: { success: true, url: '/api/file/' + key } };
};

export const del: RequestHandler = async ({ params: { key } }) => {
	checkKey(key);
	try {
		await fs.unlink(`${DATA_FOLDER}/${key}`);
		return { body: 'Success' };
	} catch (e) {
		if (e && (e as any).code === 'ENOENT') return { status: 208, body: 'File did not exist' };
		else throw e;
	}
};
