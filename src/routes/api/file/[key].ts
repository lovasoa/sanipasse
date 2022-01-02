import type { RequestHandler } from '@sveltejs/kit';
import { DATA_FOLDER, MAX_FILESIZE } from '$lib/global_config';
import fs from 'fs/promises';

// No dynamic type should be allowed here: no svg
const allowed_types: Record<string, string> = {
	jpg: 'image/jpeg',
	png: 'image/png',
	mp4: 'video/mp4',
	webm: 'video/webm'
};

function checkKey(key: string): string {
	const match = key.match(/^[0-9a-f]{64}\.(.{2,4})$/);
	if (!match) throw new Error('Invalid name');
	const extension = match[1];
	const type = allowed_types[extension];
	if (!type) throw new Error('Invalid file type');
	return type;
}

export const get: RequestHandler = async ({ params: { key } }) => {
	const type = checkKey(key);
	const body = await fs.readFile(`${DATA_FOLDER}/${key}`);
	return {
		headers: {
			'Content-Type': type,
			'Content-Security-Policy': "script-src 'none';"
		},
		body
	};
};

export const put: RequestHandler = async ({ params: { key }, rawBody }) => {
	checkKey(key);
	if (!rawBody || rawBody.byteLength === 0) return { status: 400, body: `missing request body` };
	if (rawBody.byteLength > MAX_FILESIZE)
		return { status: 413, body: `maximum file size: ${MAX_FILESIZE / 1_000_000} Mb` };
	await fs.writeFile(`${DATA_FOLDER}/${key}`, rawBody);
	return { body: 'Success' };
};

export const del: RequestHandler = async ({ params: { key } }) => {
	checkKey(key);
	await fs.unlink(`${DATA_FOLDER}/${key}`);
	return { body: 'Success' };
};
