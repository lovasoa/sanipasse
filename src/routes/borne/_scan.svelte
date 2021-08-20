<script lang="ts">
	import type { CommonCertificateInfo } from '$lib/common_certificate_info';
	import { findCertificateError, parse_any } from '$lib/detect_certificate';
	import { assets } from '$app/paths';
	import type { ConfigProperties, HTTPRequest } from './_config';
	import QrCodeVideoReader from '../_QrCodeVideoReader.svelte';
	import { sha256 } from '$lib/sha256';

	export let config: ConfigProperties;
	const { decode_after_s, reset_after_s, prevent_revalidation_before_minutes } = config;

	let code: string = '';
	let codeFoundPromise: Promise<CommonCertificateInfo> | undefined = undefined;

	let timeout: NodeJS.Timeout | undefined = undefined;
	let reset_timeout: NodeJS.Timeout | undefined = undefined;

	let last_event: KeyboardEvent | null = null;

	let externalRequest: Promise<Response> | null = null;

	// Passes that have been validated recently and cannot be revalidated
	let validated_passes: Map<string, number> = new Map();

	const prevent_revalidation_before_ms = (prevent_revalidation_before_minutes || 0) * 60 * 1000;

	function onKeyPress(event: KeyboardEvent) {
		last_event = event;
		// Handle event if we are in scanning mode and a single keycode was sent by the scanner
		if (event.key.length > 1 || codeFoundPromise) return;
		code += event.key;
		if (timeout !== undefined) clearTimeout(timeout);
		if (reset_timeout !== undefined) clearTimeout(reset_timeout);
		timeout = setTimeout(launchParsing, decode_after_s * 1000, code);
		event.preventDefault();
	}

	function onPaste({ clipboardData }: ClipboardEvent) {
		if (!clipboardData) return;
		launchParsing(clipboardData.getData('text'));
	}

	async function validateCertificateCode(code: string): Promise<CommonCertificateInfo> {
		const cert = await parse_any(code);
		const error = findCertificateError(cert);
		if (error) throw new Error(error);

		let code_digest = await sha256(code);
		const last_validated = validated_passes.get(code_digest);
		const now = Date.now();
		if (last_validated && now - last_validated < prevent_revalidation_before_ms) {
			const duration_minutes = ((now - last_validated) / 60 / 1000) | 0;
			throw new Error(
				`Passe déjà scanné par quelqu'un d'autre il y a ` +
					(duration_minutes ? duration_minutes + ' minutes.' : "moins d'une minute.")
			);
		}
		validated_passes.set(code_digest, now);
		setTimeout(() => validated_passes.delete(code_digest), prevent_revalidation_before_ms);
		return cert;
	}

	async function makeRequest(r: HTTPRequest) {
		const body = r.method === 'GET' ? undefined : r.body;
		externalRequest = fetch(r.url, { method: r.method, body });
		return externalRequest;
	}

	async function onValid() {
		if (config.external_requests && config.external_requests.accepted.url)
			return makeRequest(config.external_requests.accepted);
	}

	async function onInvalid() {
		if (config.external_requests && config.external_requests.refused.url)
			return makeRequest(config.external_requests.refused);
	}

	function launchParsing(code_input: string) {
		if (codeFoundPromise) return;
		console.log('Detected code before reset: ', code_input);
		codeFoundPromise = validateCertificateCode(code_input);
		codeFoundPromise.then(onValid, onInvalid);
		timeout = undefined;
		code = '';
		reset_timeout = setTimeout(() => {
			codeFoundPromise = undefined;
		}, reset_after_s * 1000);
	}

	function showName({ first_name, last_name }: CommonCertificateInfo): string {
		return (
			(first_name[0] || '').toUpperCase() +
			first_name.slice(1).toLowerCase() +
			' ' +
			last_name.toUpperCase()
		);
	}
</script>

<svelte:window on:keypress={onKeyPress} on:paste={onPaste} />
<svelte:head>
	{#if config.custom_css}
		<link rel="stylesheet" href="data:text/css,{encodeURIComponent(config.custom_css)}" />
	{/if}
</svelte:head>

<div
	class="main container"
	style="font-family: {config.font || 'inherit'}; font-size: {config.font_size || 16}px"
>
	{#if timeout !== undefined}
		Scan du QR code en cours...
	{:else if codeFoundPromise != undefined}
		{#await codeFoundPromise}
			Décodage du code...
		{:then pass}
			<!-- svelte-ignore a11y-media-has-caption -->
			<audio autoplay src="{assets}/valid.mp3" />
			<div class="validated_pass alert alert-success" role="alert">
				<div class="row">
					<div class="col-md-2"><div class="sign shallpass" /></div>
					<div class="col-md-10">
						<h3>
							Bienvenue, {#if !config.anonymize}{showName(pass)}{/if}
						</h3>
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
			<div class="refused_pass alert alert-danger" role="alert">
				<div class="row">
					<div class="col-md-2"><div class="sign shallnotpass" /></div>
					<div class="col-md-10">
						<h3>Passe sanitaire invalide</h3>
						<p class="font-monospace">{err.message}</p>
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
		<section id="welcome_message">
			<div class="logos row justify-content-center w-100">
				{#each config.logo_urls as url}
					<img
						alt="logo"
						src={url}
						class="logo col"
						style="object-fit: contain; max-height: 10em;"
					/>
				{/each}
			</div>
			<h1>{config.title}</h1>
			<p class="description">{config.description}</p>
		</section>
	{/if}

	{#if config.video_scan}
		<div class="videoinput w-100" style="display: {codeFoundPromise ? 'none' : 'flex'}">
			<QrCodeVideoReader
				on:qrcode={({ detail }) => launchParsing(detail)}
				facingMode={config.video_facing_mode}
			/>
		</div>
	{/if}

	{#if config.debug}
		<div>
			Code:
			<p class="text-break font-monospace">{code}</p>
			<p>Code length: {code.length}</p>
			<p>Last key pressed: {JSON.stringify(last_event?.key, null, ' ')}</p>
		</div>
		{#if externalRequest}
			<div>
				{#await externalRequest}
					Requête externe en cours...
				{:then r}
					status: {r.status}
					{r.statusText}
					{#await r.text() then text}
						body: {text}
					{/await}
				{:catch err}
					Erreur dans la requête externe:
					<pre>{err}</pre>
				{/await}
			</div>
		{/if}
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
	.videoinput {
		max-height: 45vh;
		display: flex;
		justify-content: center;
	}
	h1 {
		font-size: 2em;
	}
</style>
