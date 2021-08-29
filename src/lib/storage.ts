const localforage = import('localforage'); // Can fail on node

async function ensure_persisted() {
	if (typeof navigator !== 'object' || !navigator.storage || !navigator.storage.persist)
		return false;
	return await navigator.storage.persist();
}

export async function storage_is_volatile(): Promise<boolean | undefined> {
	if (typeof navigator !== 'object' || !navigator.storage || !navigator.storage.persisted)
		return undefined;
	return !(await navigator.storage.persisted());
}

export async function storage_usage_ratio(): Promise<number | undefined> {
	if (typeof navigator !== 'object' || !navigator.storage || !navigator.storage.estimate)
		return undefined;
	const { quota, usage } = await navigator.storage.estimate();
	if (!quota || !usage) return undefined;
	return usage / quota;
}

export async function store_locally(key: string, value: any): Promise<boolean> {
	if (typeof window !== 'object') return false;
	const persisted = await ensure_persisted();
	await (await localforage).setItem(key, value);
	return persisted;
}

export async function get_from_local_store<T>(key: string): Promise<T | undefined> {
	if (typeof window !== 'object') return undefined; // Browser-only
	const element = await (await localforage).getItem(key);
	return element as T;
}
