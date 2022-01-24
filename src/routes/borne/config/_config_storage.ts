import type { ConfigProperties } from './_config';
import { DEFAULT_CONFIG } from './_config';
import { get_from_local_store, store_locally } from '$lib/storage';
import { get } from '$lib/http';

const STORAGE_KEY = 'borne_config';

export async function save_config(config: ConfigProperties) {
	await store_locally(STORAGE_KEY, config);
}

export async function load_config(): Promise<ConfigProperties> {
	if (typeof window !== 'object') return DEFAULT_CONFIG;
	try {
		const any_config = await get_from_local_store(STORAGE_KEY);
		return migrate_config(any_config);
	} catch (e) {
		console.error('Unable to load config', e);
		return DEFAULT_CONFIG;
	}
}

export async function load_config_from_key(configKey: string): Promise<ConfigProperties> {
	const config = await get(`/api/borne/${configKey}`);
	return migrate_config(config);
}

export function migrate_config(config: any): ConfigProperties {
	// Migration from older versions
	if (typeof config !== 'object') return DEFAULT_CONFIG;
	if (config.sound_valid === undefined) config.sound_valid = 'valid.mp3';
	if (config.sound_invalid === undefined) config.sound_invalid = 'invalid.mp3';
	config.accepted_message = config.accepted_message || DEFAULT_CONFIG.accepted_message;
	config.refused_message = config.refused_message || DEFAULT_CONFIG.refused_message;
	config.background_images = config.background_images || DEFAULT_CONFIG.background_images;
	config.slideshow_media = config.slideshow_media || DEFAULT_CONFIG.slideshow_media;
	config.validation_ruleset = config.validation_ruleset || DEFAULT_CONFIG.validation_ruleset;
	return config;
}
