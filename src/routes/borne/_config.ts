import type { ConfigProperties } from '$lib/borne_config';
import { DEFAULT_CONFIG } from '$lib/borne_config';

const localforage = import('localforage'); // Can fail on node
const STORAGE_KEY = 'borne_config';

export async function save_config(config: ConfigProperties) {
	if (typeof window !== 'object') return;
	await (await localforage).setItem(STORAGE_KEY, config);
}

export async function load_config(): Promise<ConfigProperties> {
	if (typeof window !== 'object') return DEFAULT_CONFIG;
	try {
		const config = await (await localforage).getItem(STORAGE_KEY);
		return (config as ConfigProperties) || DEFAULT_CONFIG;
	} catch (e) {
		console.error('Unable to load config', e);
		return DEFAULT_CONFIG;
	}
}
