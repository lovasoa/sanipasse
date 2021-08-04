<script lang="ts">
	import { Alert, ListGroup, ListGroupItem } from 'sveltestrap';
	import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
	import type { Result } from '@zxing/library';
	import { BrowserCodeReader, BrowserMultiFormatReader } from '@zxing/browser';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ qrcode: string }>();

	export let started = false;
	let error = '';
	let videoElement: HTMLVideoElement | undefined = undefined;
	let stop = () => {};

	const codeReader = new BrowserMultiFormatReader(
		new Map([
			[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.DATA_MATRIX, BarcodeFormat.QR_CODE]],
			[DecodeHintType.TRY_HARDER, true as any]
		])
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
					if (!started) return;
					if (err || !result) {
						if (!(err instanceof NotFoundException)) error = `${err}`;
						return;
					} else onResult(result);
				}
			);
			stop = controls.stop.bind(controls);
			started = true;
		} catch (e) {
			error = e.toString();
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
				</Alert>
			{/each}
		</ListGroup>
	{/await}
{/if}

<style>
	button {
		background: none;
		border: none;
		width: 100%;
	}
	video {
		width: 100%;
		object-fit: contain;
	}
</style>
