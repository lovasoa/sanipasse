<script lang="ts">
	import CodeFound from '../_CodeFound.svelte';
	import QrCodeVideoReader from '../_QrCodeVideoReader.svelte';

	let codeFound: string | undefined = undefined;
	let started = false;
</script>

<svelte:head>
	<title>Sanipasse - Scanner un passe sanitaire</title>
</svelte:head>

<aside class:d-none={!started} class="mb-3">
	Pour décoder le <b>QR code de votre certificat de test ou de vaccination</b>, faites-le apparaître
	de manière bien évidente, et avec une luminosité maximale.
</aside>

<div class="videoinput" class:started>
	<QrCodeVideoReader on:qrcode={({ detail }) => (codeFound = detail)} bind:started />
</div>
<CodeFound bind:codeFound />

<style>
	.videoinput {
		display: flex;
		flex-direction: row;
		max-height: 0;
		transition: 800ms;
	}
	.videoinput.started {
		max-height: 80vh;
	}
</style>
