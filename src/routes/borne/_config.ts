import type { ConfigProperties } from '$lib/borne_config';
import { DEFAULT_CONFIG } from '$lib/borne_config';
import { get_from_local_store, store_locally } from '$lib/storage';

const STORAGE_KEY = 'borne_config';

export async function save_config(config: ConfigProperties) {
	await store_locally(STORAGE_KEY, config);
}

export async function load_config(): Promise<ConfigProperties> {
	if (typeof window !== 'object') return DEFAULT_CONFIG;
	try {
		const config = await get_from_local_store(STORAGE_KEY);
		return (config as ConfigProperties) || DEFAULT_CONFIG;
	} catch (e) {
		console.error('Unable to load config', e);
		return DEFAULT_CONFIG;
	}
}
