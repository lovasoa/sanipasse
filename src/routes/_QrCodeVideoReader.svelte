<script lang="ts">
	import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
	import type { Result } from '@zxing/library';
	import { BrowserMultiFormatReader } from '@zxing/browser';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ qrcode: string }>();

	export let facingMode: string | undefined = undefined;
	export let started = false;
	export let allowSwap = false;
	export let videoError: Error | null = null;

	let videoElement: HTMLVideoElement | undefined = undefined;
	let stop = () => {};

	const codeReader = new BrowserMultiFormatReader(
		new Map([
			[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.DATA_MATRIX, BarcodeFormat.QR_CODE]],
			[DecodeHintType.TRY_HARDER, true as any]
		])
	);

	let decodePromise: Promise<void> = Promise.resolve();

	function error(e: any) {
		decodePromise = Promise.reject(e);
	}

	async function start(mediaStream: MediaStream) {
		try {
			console.log(`Started decode from camera with id ${mediaStream.id}`);
			// you can use the controls to stop() the scan or switchTorch() if available
			const controls = await codeReader.decodeFromStream(
				mediaStream,
				videoElement,
				(result, err) => {
					console.log(`zxing callback called, result: ${result}, err: ${err}`);
					if (!started) return;
					if (err || !result) {
						if (!(err instanceof NotFoundException)) error(err);
						return;
					} else onResult(result);
				}
			);
			stop = () => {
				controls.stop();
				mediaStream.getTracks().forEach((track) => track.stop());
			};
			started = true;
		} catch (e) {
			error(e);
		}
	}

	async function onResult(result: Result) {
		const data = result.getText();
		dispatch('qrcode', data);
	}

	function onUnMount() {
		stop();
		started = false;
	}

	function loadCamera() {
		started = false;
		stop();
		const videoPromise = navigator.mediaDevices.getUserMedia({
			audio: false,
			video: facingMode ? { facingMode } : true
		});
		decodePromise = videoPromise.then(start);
		videoPromise.catch((e) => (videoError = e));
		return onUnMount;
	}

	onMount(loadCamera);
</script>

<div class="video-container" class:started>
	<!-- svelte-ignore a11y-media-has-caption -->
	<video style="display:{started ? 'block' : 'none'}" bind:this={videoElement} />
	{#if allowSwap}
		<button
			on:click|preventDefault={() => {
				facingMode = facingMode === 'environment' ? 'user' : 'environment';
				loadCamera();
			}}>🔄</button
		>
	{/if}
</div>

{#await decodePromise}
	<div class="alert alert-light">Chargement de la caméra...</div>
{:catch error}
	<div class="alert alert-danger">
		<h4>Impossible d'accéder à la caméra</h4>
		<code>{error}</code>

		<p class="mt-3 reportbug">
			Votre caméra fonctionne normalement sur d'autres sites et applications, vous avez bien
			autorisé sanipasse à y accéder, et vous pensez que c'est un bug dans sanipasse ? Vous pouvez <a
				href="https://github.com/lovasoa/sanipasse/issues/new?title={encodeURIComponent(
					error
				)}&body=Merci de bien vouloir décrire ici votre appareil, votre navigateur, et les circonstances d'apparition du bug."
				>ouvrir un rapport de bug</a
			>.
		</p>
	</div>
{/await}

<style>
	.video-container {
		position: relative;
	}

	.video-container button {
		position: absolute;
		bottom: 10px;
		right: 7px;
		width: 16px;
		height: 16px;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		opacity: 0;
		transition: 500ms;
		transition-delay: 800ms;
	}

	.video-container.started button {
		opacity: 0.5;
	}

	.video-container.started button:hover {
		opacity: 1;
		transition-delay: 0s;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.alert {
		height: 100%;
	}
	.reportbug {
		font-size: 0.8em;
	}
</style>
