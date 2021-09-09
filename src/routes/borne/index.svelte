<script type="ts">
	import { DEFAULT_CONFIG } from './_config';
	import type { ConfigProperties } from './_config';
	import { load_config as load_config_from_storage, save_config } from './_config_storage';
	import Scan from './_scan.svelte';
	import { get } from '$lib/http';
	import { onMount } from 'svelte';

	let configKey: string = '';
	if (typeof window === 'object') configKey = new URLSearchParams(location.search).get('key') || '';

	// If the initial config is not found, use the locally stored config
	let config_promise = load_config().catch((e) => {
		console.log('Remote config fetching failed, loading local config', e);
		return load_config_from_storage();
	});

	// Always save the config to local storage when it is loaded
	config_promise.then(save_config);

	async function load_config_from_key(): Promise<ConfigProperties> {
		return get(`/api/borne/${configKey}`);
	}

	async function load_config(): Promise<ConfigProperties> {
		if (configKey) return load_config_from_key();
		else return load_config_from_storage();
	}

	async function refresh_config() {
		const config = await load_config();
		const previous_config = await config_promise;
		// Prevent re-mounting components if config hasn't changed
		if (JSON.stringify(config) !== JSON.stringify(previous_config)) {
			console.log('config changed! New config:', config);
			// Persist all config to local storage
			save_config(config);
			config_promise = Promise.resolve(config);
		}
	}

	let refresh_interval: NodeJS.Timer | null = null;
	async function mount_handler() {
		// Refresh config every 5 minutes
		refresh_interval = setInterval(refresh_config, 1000 * 60 * 5);
		return unmount_handler;
	}

	async function unmount_handler() {
		if (refresh_interval) clearInterval(refresh_interval);
	}

	onMount(mount_handler);
</script>

{#await config_promise}
	<p class="w-100">Chargement de la configuration…</p>
	<Scan config={DEFAULT_CONFIG} />
{:then config}
	<Scan {config} />
{/await}
