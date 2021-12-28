import type { ConfigProperties } from './_config';
import { DEFAULT_CONFIG } from './_config';
import { get_from_local_store, store_locally } from '$lib/storage';

const STORAGE_KEY = 'borne_config';

export async function save_config(config: ConfigProperties) {
	await store_locally(STORAGE_KEY, config);
}

export async function load_config(): Promise<ConfigProperties> {
	if (typeof window !== 'object') return DEFAULT_CONFIG;
	try {
		const any_config = await get_from_local_store(STORAGE_KEY);
		const config = (any_config as ConfigProperties) || DEFAULT_CONFIG;
		// Migration from older versions
		if (config.sound_valid === undefined) config.sound_valid = 'valid.mp3';
		if (config.sound_invalid === undefined) config.sound_invalid = 'invalid.mp3';
		config.accepted_message = config.accepted_message || DEFAULT_CONFIG.accepted_message;
		config.refused_message = config.refused_message || DEFAULT_CONFIG.refused_message;
		return config;
	} catch (e) {
		console.error('Unable to load config', e);
		return DEFAULT_CONFIG;
	}
}
