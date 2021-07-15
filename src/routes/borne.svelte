<script lang="ts">
	import type { CommonCertificateInfo } from '$lib/common_certificate_info';
	import { findCertificateError, parse_any } from '$lib/detect_certificate';
	import { assets } from '$app/paths';

	let code: string = '';
	let codeFoundPromise: Promise<CommonCertificateInfo> | undefined = undefined;
	let decode_after_ms = 1000;
	let reset_after_ms = 4000;

	let place_name = '';
	let animate = false;
	let timeout: NodeJS.Timeout | undefined = undefined;
	let reset_timeout: NodeJS.Timeout | undefined = undefined;

	function onKeyPress(event: KeyboardEvent) {
		code += event.key;
		if (timeout !== undefined) clearTimeout(timeout);
		if (reset_timeout !== undefined) clearTimeout(reset_timeout);
		timeout = setTimeout(resetCode, decode_after_ms);
		animate = false;
		setTimeout(() => (animate = true), 5);
		event.preventDefault();
		codeFoundPromise = validateCertificateCode(code);
	}

	function onPaste({ clipboardData }: ClipboardEvent) {
		if (!clipboardData) return;
		codeFoundPromise = validateCertificateCode(clipboardData.getData('text'));
		resetCode();
	}

	async function validateCertificateCode(code: string): Promise<CommonCertificateInfo> {
		const cert = await parse_any(code);
		const error = findCertificateError(cert);
		if (error) throw new Error(error);
		else return cert;
	}

	function resetCode() {
		console.log('Detected code before reset: ', code);
		timeout = undefined;
		code = '';
		reset_timeout = setTimeout(() => {
			codeFoundPromise = undefined;
		}, reset_after_ms);
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

{#if timeout !== undefined}
	<div class="progress">
		<div
			class="progress-bar"
			role="progressbar"
			class:animate
			style="animation-duration: {decode_after_ms}ms"
		/>
	</div>
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
							style="animation-duration: {reset_after_ms}ms"
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
							style="animation-duration: {reset_after_ms}ms"
						/>
					</div>
				</div>
			</div>
		</div>
	{/await}
{:else}
	<h1>
		Bienvenue {#if place_name}chez {place_name} {/if}!
	</h1>
	<p>
		Scannez votre passe sanitaire depuis la section “carnets“ de votre application TousAntiCovid ou
		Sanipasse. Vous pouvez aussi scanner directement le QR code papier qui vous a été remis lors de
		votre test ou de votre vaccination.
	</p>
{/if}

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
