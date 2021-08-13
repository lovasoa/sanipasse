<script lang="ts">
	import CodeFound from '../_CodeFound.svelte';
	import QrCodeVideoReader from '../_QrCodeVideoReader.svelte';

	let codeFound: string | undefined = undefined;
	let started = false;
	let videoError: Error | null = null;
</script>

<svelte:head>
	<title>Sanipasse - Scanner un passe sanitaire</title>
</svelte:head>

{#if started}
	<aside class="mb-3">
		Pour décoder le <b>QR code de votre certificat de test ou de vaccination</b>, faites-le
		apparaître de manière bien évidente, et avec une luminosité maximale.
	</aside>
{:else if videoError}
	<p class="text-center">
		Si l'accès direct à votre webcam ne fonctionne pas, vous pouvez utiliser
		<a href="/import/file">la lecture depuis un fichier</a>.
	</p>
{:else}
	<p class="text-center">
		Sanipasse demande la permission d'accéder à votre webcam pour lire le QR code.
	</p>
	<p class="text-center">
		Votre navigateur va vous demander si vous souhaitez autoriser <i>sanipasse.fr</i> à utiliser votre
		webcam.
	</p>
	<p class="text-center">
		Cliquez sur <b>Autoriser</b>.
	</p>
{/if}

<div class="videoinput" class:started>
	<QrCodeVideoReader
		on:qrcode={({ detail }) => (codeFound = detail)}
		bind:started
		bind:videoError
		facingMode="environment"
		allowSwap={true}
	/>
</div>

<CodeFound bind:codeFound />

<style>
	.videoinput {
		display: flex;
		justify-content: center;
		max-height: 0;
		transition: 800ms;
	}
	.videoinput.started {
		max-height: 80vh;
	}
</style>
