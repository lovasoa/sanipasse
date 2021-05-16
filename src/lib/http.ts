import { base } from '$app/paths';

export async function request<T>(
	method: string,
	expected_status: number,
	path: string,
	data?: unknown
): Promise<T> {
	const headers = data ? { 'Content-Type': 'application/json' } : undefined;
	const body = data ? JSON.stringify(data) : undefined;
	const r = await fetch(base + path, { method, headers, body });
	if (r.status !== expected_status) {
		throw new Error(`${r.statusText}: ${await r.text()}`);
	}
	if (r.status !== 204) return r.json();
	else return {} as T;
}

export async function put<T>(path: string, data: unknown): Promise<T> {
	return request('PUT', 201, path, data);
}

export async function get<T>(path: string, data?: Record<string, string>): Promise<T> {
	const params = new URLSearchParams(data).toString();
	if (params) path = path + '?' + params;
	return request('GET', 200, path);
}

export async function http_delete(path: string, data: unknown): Promise<undefined> {
	return request('DELETE', 204, path, data);
}
