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
		stop();
		decodePromise = navigator.mediaDevices
			.getUserMedia({
				audio: false,
				video: facingMode ? { facingMode } : true
			})
			.then(start);
		return onUnMount;
	}

	onMount(loadCamera);
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video
	style="display:{started ? 'block' : 'none'}"
	bind:this={videoElement}
	class:started
	on:click={() => {
		if (allowSwap) {
			facingMode = facingMode === 'environment' ? 'user' : 'environment';
			loadCamera();
		}
	}}
/>

{#await decodePromise}
	<div class="alert alert-light">Chargement de la caméra...</div>
{:catch error}
	<div class="alert alert-danger">
		<h4>Impossible d'accéder à la caméra</h4>
		<code>{error}</code>
	</div>
{/await}

<style>
	video {
		width: 100%;
		object-fit: contain;
	}
	.alert {
		height: 100%;
	}
</style>
