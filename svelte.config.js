import preprocess from 'svelte-preprocess';
import adapter_static from '@sveltejs/adapter-static';
import adapter_node from '@sveltejs/adapter-node';
import vite_plugin_legacy from '@vitejs/plugin-legacy';

const adapter =
	process.env.SVELTEKIT_ADAPTER === 'node'
		? adapter_node({})
		: adapter_static({ fallback: 'index.html' });

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter,
		vite: {
			plugins: [
				vite_plugin_legacy({
					targets: ['ie >= 11'],
					additionalLegacyPolyfills: ['regenerator-runtime/runtime']
				})
			],

			build: {
				chunkSizeWarningLimit: 800
			}
		}
	}
};

export default config;
