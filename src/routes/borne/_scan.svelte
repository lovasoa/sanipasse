<script lang="ts">
	import type { CommonCertificateInfo } from '$lib/common_certificate_info';
	import { findCertificateError, parse_any } from '$lib/detect_certificate';
	import type { ConfigProperties, HTTPRequest } from './config/_config';
	import QrCodeVideoReader from '../_QrCodeVideoReader.svelte';
	import { store_statistics_datapoint } from './_stats_storage';
	import ScanStatsModal from './_scan_stats_modal.svelte';
	import ValidationMessage from './_validationMessage.svelte';
	import Slideshow from './_slideshow.svelte';

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

		let code_digest = cert.fingerprint;
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
			makeRequest(config.external_requests.accepted);
		if (config.store_statistics) store_statistics_datapoint(true);
	}

	async function onInvalid() {
		if (config.external_requests && config.external_requests.refused.url)
			makeRequest(config.external_requests.refused);
		if (config.store_statistics) store_statistics_datapoint(false);
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
</script>

<svelte:window on:keypress={onKeyPress} on:paste={onPaste} />
<svelte:head>
	{#if config.custom_css}
		<link rel="stylesheet" href="data:text/css,{encodeURIComponent(config.custom_css)}" />
	{/if}
</svelte:head>

<Slideshow
	file_urls={config.background_images}
	style="
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: -1;"
/>

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
			<ValidationMessage context={pass} valid={true} {config} />
		{:catch err}
			<ValidationMessage context={err} valid={false} {config} />
		{/await}
	{:else}
		{#if config.slideshow_media.length}
			<section id="top_media">
				<Slideshow file_urls={config.slideshow_media} style="width:100%" />
			</section>
		{/if}
		<section id="welcome_message">
			<div class="logos row justify-content-center w-100">
				{#each config.logo_urls as url}
					<img
						alt="logo"
						src={url}
						class="logo col"
						style="object-fit: contain; max-height: 10em"
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

{#if config.show_statistics_on_scan}
	<ScanStatsModal autoclose={config.autoclose_statistics} />
{/if}

<style>
	.videoinput {
		max-height: 45vh;
		display: flex;
		justify-content: center;
	}
	h1 {
		font-size: 2em;
	}

	#top_media {
		aspect-ratio: 16/9;
		margin-bottom: 1em;
		border-radius: 10px;
		overflow: hidden;
	}

	@media (min-width: 770px) {
		#top_media {
			aspect-ratio: 12/5;
		}
	}
</style>
