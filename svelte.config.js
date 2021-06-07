import preprocess from 'svelte-preprocess';
import adapter_static from '@sveltejs/adapter-static';
import adapter_node from '@sveltejs/adapter-node';

const adapter =
	process.env.SVELTEKIT_ADAPTER === 'node'
		? adapter_node({})
		: adapter_static({ fallback: "index.html" });

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
			build: {
				chunkSizeWarningLimit: 700
			}
		}
	},

};

export default config;
