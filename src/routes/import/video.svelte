<script lang="ts">
	import CodeFound from '../_CodeFound.svelte';
	import { Button, Alert, Input, ListGroup, ListGroupItem } from 'sveltestrap';
	import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
	import type { Result } from '@zxing/library';
	import { BrowserCodeReader, BrowserMultiFormatReader } from '@zxing/browser';
	import { onMount } from 'svelte';
	export let codeFound: string | undefined = undefined;
	let started = false;
	let error = '';
	let videoElement: HTMLVideoElement | undefined = undefined;
	let stop = () => {};

	const codeReader = new BrowserMultiFormatReader(
		new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.DATA_MATRIX, BarcodeFormat.QR_CODE]]])
	);

	let devices: Promise<MediaDeviceInfo[]> = Promise.resolve([]);

	async function start(selectedDeviceId: string) {
		try {
			console.log(`Started decode from camera with id ${selectedDeviceId}`);
			// you can use the controls to stop() the scan or switchTorch() if available
			const controls = await codeReader.decodeFromVideoDevice(
				selectedDeviceId,
				videoElement,
				(result, err) => {
					console.log(`zxing callback called, result: ${result}, err: ${err}`);
					if (err || !result) {
						if (!(err instanceof NotFoundException)) error = `${err}`;
						return;
					} else onResult(result);
				}
			);
			stop = controls.stop;
			started = true;
		} catch (e) {
			error = e.toString();
		}
	}

	async function onResult(result: Result) {
		codeFound = result.getText();
	}

	function onUnMount() {
		stop();
	}
	onMount(() => {
		devices = BrowserCodeReader.listVideoInputDevices();
		devices.then((devices) => {
			if (devices.length === 1 && !started) {
				start(devices[0].deviceId);
			}
		});
		return onUnMount;
	});
</script>

<aside class:d-none={!started} class="mb-3">
	Faites apparaître le QR code de votre certificat de test ou de vaccination de manière bien
	évidente, et avec une luminosité maximale.
</aside>
<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoElement} class:started />

{#if error}
	<Alert color="danger">
		<h4>Impossible d'accéder à la caméra</h4>
		<code>{error}</code>
	</Alert>
{:else if !started}
	{#await devices}
		<Alert fade={false} color="light">Chargement de la caméra...</Alert>
	{:then devices}
		<ListGroup>
			{#each devices as device}
				<ListGroupItem>
					<button on:click={() => start(device.deviceId)}
						>Utiliser la caméra “{device.label}”</button
					>
				</ListGroupItem>
			{:else}
				<Alert color="danger">
					<h4>Aucune caméra</h4>
					<p>Aucune caméra n'a été détectée, impossible de scanner un code.</p>
					<p>
						Vous pouvez toujours renseigner votre certificat en faisant un copier-coller du lien
						TousAntiCovid compris sur votre certificat ci-dessous:
					</p>
					<Input type="url" bind:value={codeFound} />
				</Alert>
			{/each}
		</ListGroup>
	{/await}
{/if}

<CodeFound bind:codeFound />

<style>
	video {
		width: 0%;
		max-height: 0;
		transition: 1s;
	}
	video.started {
		width: 100%;
		max-height: 80vh;
	}
	button {
		background: none;
		border: none;
		width: 100%;
	}
</style>
