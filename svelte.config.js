import preprocess from 'svelte-preprocess';
import adapter_static from '@sveltejs/adapter-static';
import adapter_node from '@sveltejs/adapter-node';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf8'));

const adapter =
	process.env.SVELTEKIT_ADAPTER === 'node'
		? adapter_node({
				out: 'build'
		  })
		: adapter_static({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html'
		  });

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
				chunkSizeWarningLimit: 800
			},
			json: { stringify: true },
			define: {
				'process.env.SANIPASSE_VERSION': JSON.stringify(pkg.version),
				'process.env.SANIPASSE_BUILD_DATE': JSON.stringify(new Date().toISOString())
			}
		}
	}
};

export default config;
