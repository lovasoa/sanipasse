<script lang="ts">
	import type { CommonCertificateInfo } from '$lib/common_certificate_info';
	import { findCertificateError, parse_any } from '$lib/detect_certificate';
	import { assets } from '$app/paths';
	import type { ConfigProperties } from './_config';

	export let config: ConfigProperties;
	const { decode_after_s, reset_after_s } = config;

	let code: string = '';
	let codeFoundPromise: Promise<CommonCertificateInfo> | undefined = undefined;

	let timeout: NodeJS.Timeout | undefined = undefined;
	let reset_timeout: NodeJS.Timeout | undefined = undefined;

	let last_event: KeyboardEvent | null = null;

	function onKeyPress(event: KeyboardEvent) {
		last_event = event;
		if (event.key.length > 1) return;
		code += event.key;
		if (timeout !== undefined) clearTimeout(timeout);
		if (reset_timeout !== undefined) clearTimeout(reset_timeout);
		timeout = setTimeout(launchParsing, decode_after_s * 1000);
		event.preventDefault();
	}

	function onPaste({ clipboardData }: ClipboardEvent) {
		if (!clipboardData) return;
		codeFoundPromise = validateCertificateCode(clipboardData.getData('text'));
		launchParsing();
	}

	async function validateCertificateCode(code: string): Promise<CommonCertificateInfo> {
		const cert = await parse_any(code);
		const error = findCertificateError(cert);
		if (error) throw new Error(error);
		else return cert;
	}

	function launchParsing() {
		console.log('Detected code before reset: ', code);
		codeFoundPromise = validateCertificateCode(code);
		timeout = undefined;
		code = '';
		reset_timeout = setTimeout(() => {
			codeFoundPromise = undefined;
		}, reset_after_s * 1000);
	}

	function showName({ first_name, last_name }: CommonCertificateInfo): string {
		return (
			first_name[0].toUpperCase() +
			first_name.slice(1).toLowerCase() +
			' ' +
			last_name.toUpperCase()
		);
	}
</script>

<svelte:window on:keypress={onKeyPress} on:paste={onPaste} />

<div class="main container">
	{#if timeout !== undefined}
		Scan du QR code en cours...
	{:else if codeFoundPromise != undefined}
		{#await codeFoundPromise}
			Décodage du code...
		{:then pass}
			<!-- svelte-ignore a11y-media-has-caption -->
			<audio autoplay src="{assets}/valid.mp3" />
			<div class="alert alert-success" role="alert">
				<div class="row">
					<div class="col-md-2"><div class="sign shallpass" /></div>
					<div class="col-md-10">
						<h3>Bienvenue, {showName(pass)}</h3>
						<p>Votre passe est validé.</p>
						<div class="progress">
							<div
								class="progress-bar bg-success animate"
								role="progressbar"
								style="animation-duration: {reset_after_s}s"
							/>
						</div>
					</div>
				</div>
			</div>
		{:catch err}
			<!-- svelte-ignore a11y-media-has-caption -->
			<audio autoplay src="{assets}/invalid.mp3" />
			<div class="alert alert-danger" role="alert">
				<div class="row">
					<div class="col-md-2"><div class="sign shallnotpass" /></div>
					<div class="col-md-10">
						<h3>Passe sanitaire invalide</h3>
						<pre>{err.message}</pre>
						<div class="progress">
							<div
								class="progress-bar bg-danger animate"
								role="progressbar"
								style="animation-duration: {reset_after_s}s"
							/>
						</div>
					</div>
				</div>
			</div>
		{/await}
	{:else}
		<div class="row justify-content-center w-100">
			{#each config.logo_urls as url}
				<img alt="logo" src={url} class="col" style="object-fit: contain; max-height: 10em;" />
			{/each}
		</div>

		<h1>{config.title}</h1>
		<p>{config.description}</p>
	{/if}

	{#if config.debug}
		<div>
			Code:
			<p class="text-break font-monospace">{code}</p>
			<p>Code length: {code.length}</p>
			<p>Last key pressed: {JSON.stringify(last_event?.key, null, ' ')}</p>
		</div>
	{/if}

	<p class="fixed-bottom text-muted fw-lighter fst-italic" style="font-size: .8em">
		{config.bottom_infos}
	</p>
</div>

<style>
	.progress-bar {
		width: 100%;
		transition: 100ms;
	}

	.progress-bar.animate {
		animation: reduce_width;
	}

	@keyframes reduce_width {
		to {
			width: 0%;
		}
	}

	.sign {
		border: 0.1em solid white;
		width: 5em;
		height: 5em;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.shallnotpass {
		background-color: var(--bs-danger);
	}
	.shallnotpass::after {
		content: ' ';
		display: block;
		background-color: white;
		animation: shallnotpass 0.5s;
		height: 0.8em;
		width: 65%;
	}
	@keyframes shallnotpass {
		from {
			height: 0;
			width: 0%;
		}
		to {
			height: 0.8em;
			width: 65%;
		}
	}

	.shallpass {
		background-color: var(--bs-success);
		animation: shallpass 0.8s;
	}
	.shallpass::before {
		content: ' ';
		display: block;
		background-color: white;
		height: 1em;
		width: 0.8em;
		transform: rotate(-45deg) translate(0.37em, 0.4em);
	}
	.shallpass::after {
		content: ' ';
		display: block;
		background-color: white;
		height: 0.8em;
		width: 50%;
		transform: rotate(-45deg);
	}
	@keyframes shallpass {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0);
		}
	}
</style>
