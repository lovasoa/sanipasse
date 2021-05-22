<script lang="ts">
	const code: string = decodeURIComponent(globalThis?.location?.hash.slice(1) || '');
	let div: HTMLElement | null = null;
	import { parse } from '$lib/2ddoc';
	import { BrowserQRCodeSvgWriter } from '@zxing/browser';
	import Certificate from './_Certificate.svelte';
	import wallet from './_myWalletStore';

	const writer = new BrowserQRCodeSvgWriter();
	function updateCode(div: HTMLElement) {
		console.log(code);
		div.innerHTML = '';
		const width = 512,
			height = 512;
		const contents = 'https://bonjour.tousanticovid.gouv.fr/app/wallet?v=' + code;
		writer.writeToDom(div, contents, width, height, new Map());
		// See https://github.com/zxing-js/browser/pull/59
		const svg = div.querySelector('svg');
		if (svg) {
			svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
			svg.style.width = '100%';
		}
	}
	$: if (div) updateCode(div);
</script>

<div bind:this={div}><svg /></div>

{#if code}
	<div class="mb-3 mt-3">
		{#await parse(code) then certificate}
			<Certificate {certificate} />
		{:catch e}
			<pre class="alert alert-danger">Certificat invalide: {e} </pre>
		{/await}
		{#if $wallet.includes(code)}
			<button
				class="btn btn-danger w-100"
				on:click={(_) => {
					wallet.remove(code);
				}}>Supprimer de mon carnet</button
			>
		{/if}
	</div>
{/if}

<style>
	div {
		margin: auto;
		width: 100%;
		min-height: 50vh;
		text-align: center;
	}
	div svg {
		width: 100%;
	}
</style>
