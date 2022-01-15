<script lang="ts">
	const code: string = decodeURIComponent(globalThis?.location?.hash.slice(1) || '');
	let div: HTMLElement | null = null;
	import { isDGC, parse_any } from '$lib/detect_certificate';
	import { BrowserQRCodeSvgWriter } from '@zxing/browser';
	import Certificate from './_Certificate.svelte';
	import wallet from './_myWalletStore';

	const writer = new BrowserQRCodeSvgWriter();
	function updateCode(div: HTMLElement) {
		div.innerHTML = '';
		const width = 512,
			height = 512;
		const contents = isDGC(code)
			? code
			: 'https://bonjour.tousanticovid.gouv.fr/app/wallet2d#' + encodeURIComponent(code);
		writer.writeToDom(div, contents, width, height, new Map());
	}
	$: if (div) updateCode(div);
</script>

<div bind:this={div}><svg /></div>

{#if code}
	<div class="mb-3 mt-3">
		{#await parse_any(code) then info}
			<Certificate {info} />
		{:catch e}
			<pre class="alert alert-danger">Certificat invalide: {e} </pre>
		{/await}
		{#if $wallet.includes(code)}
			{#if $wallet[0] !== code}
				<button
					class="btn btn-primary w-100 mt-2"
					on:click={(_) => {
						wallet.favorite(code);
					}}>Marquer comme certificat préféré</button
				>
			{/if}
			<button
				class="btn btn-danger w-100 mt-2"
				on:click={(_) => {
					if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce passe ?'))
						wallet.remove(code);
				}}>Supprimer de mon carnet</button
			>
		{:else}
			<button
				class="btn btn-success w-100 mt-2"
				on:click={(_) => {
					wallet.add(code);
				}}>Ajouter à mon carnet</button
			>
		{/if}
	</div>
{/if}

<style>
	div {
		margin: auto;
		width: 100%;
		min-height: 50vh;
	}
	div :global(svg) {
		width: 100%;
	}
</style>
