<script lang="ts">
	import { goto } from '$app/navigation';
	import b64 from 'base64-js';
	import { load_config, save_config, DEFAULT_CONFIG } from './_config';
	import ExternalRequestsConfig from './_external_request_config.svelte';

	let config = DEFAULT_CONFIG;
	let video_scan_num = 0;

	let config_promise = load_config();
	config_promise.then((data) => {
		config = data;
		video_scan_num = +(config.video_scan || 0);
	});
	let loading = false;
	$: config.video_scan = !!video_scan_num;

	function fileUrlFromInput(evt: { currentTarget: HTMLInputElement }): Promise<string[]> {
		const { files } = evt.currentTarget;
		if (!files || !files.length) throw new Error('No file in input');
		return Promise.all(
			Array.from(files).map(async (f) => {
				const buffer = await f.arrayBuffer();
				const bytes = new Uint8Array(buffer);
				return `data:${f.type};base64,${b64.fromByteArray(bytes)}`;
			})
		);
	}

	let video_preview: HTMLVideoElement | undefined = undefined;
	let has_video_preview = false;
	let video_preview_error: Error | null = null;

	async function setPreview() {
		if (!video_preview || !video_scan_num) return;
		has_video_preview = false;
		if (video_preview.srcObject instanceof MediaStream) {
			video_preview.srcObject.getTracks().forEach((t) => t.stop());
		}
		await new Promise((r) => setTimeout(r, 200));
		try {
			video_preview_error = null;
			video_preview.srcObject = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: { facingMode: config.video_facing_mode }
			});
			has_video_preview = true;
		} catch (err) {
			video_preview_error = err;
		}
	}
</script>

<svelte:head>
	<title>Borne de contrôle du passe sanitaire Sanipasse</title>
	<meta
		name="description"
		content="Sanipasse est un logiciel libre et gratuit qui fournit une interface de scan automatisé des passes sanitaires."
	/>
</svelte:head>

{#await config_promise}
	Chargement de la configuration...
{/await}

<h1>Configuration de l'interface de validation des passes <i>Sanipasse borne</i></h1>
<p>
	<i>Sanipasse borne</i> est un logiciel libre et gratuit à installer sur une borne de contrôle automatique
	des pass sanitaires.
</p>
<p>
	Cette page vous permet de configurer l'interface de scan et de contrôle des passes. Une fois sur
	la page de scan, il vous faudra soit un lecteur physique de QR code, soit une webcam pour lire les
	passes sanitaires.
</p>
<form
	class="row g-3"
	on:submit|preventDefault={async () => {
		loading = true;
		console.log(config);
		await save_config(config);
		await goto('/borne');
		loading = false;
	}}
>
	<fieldset class="col-md-12">
		<legend>Durée d'attente...</legend>

		<div class="row">
			{#if !video_scan_num}
				<div class="form-label col-xl-4">
					<label for="wait">...avant la validation du code saisi</label>
					<div class="input-group">
						<input
							type="number"
							step="0.01"
							class="form-control"
							placeholder="1"
							id="wait"
							title="Temps de lecture du code par le lecteur de QR code physique"
							bind:value={config.decode_after_s}
						/>
						<div class="input-group-text">secondes</div>
					</div>
				</div>
			{/if}
			<div class="form-label col-xl-4">
				<label for="back">...avant le retour à l'interface de scan</label>
				<div class="input-group">
					<input
						type="number"
						step="0.1"
						class="form-control"
						placeholder="4"
						id="back"
						title="Temps d'affichage du message d'acceptation ou de refus du passe"
						bind:value={config.reset_after_s}
					/>
					<div class="input-group-text">secondes</div>
				</div>
			</div>
			<div class="form-label col-xl-4">
				<label for="norevalidation">...avant de pouvoir réutiliser un même passe</label>
				<div class="input-group">
					<input
						type="number"
						class="form-control"
						placeholder="pas de revalidation avant:"
						id="norevalidation"
						title="Une fois qu'un pass a été validé, il ne peut pas être réutilisé pendant cette durée, pour éviter que plusieurs personnes ne scannent le même passe."
						bind:value={config.prevent_revalidation_before_minutes}
					/>
					<div class="input-group-text">minutes</div>
				</div>
			</div>
		</div>
	</fieldset>
	<fieldset class="col-md-12">
		<legend>Affichage</legend>

		<div class="row">
			<div class="form-label col-12 mb-0">
				<div class="input-group">
					<label class="input-group-text" for="bgimage">Logos supérieurs</label>
					<input
						type="file"
						class="form-control"
						on:change={async (e) => {
							config.logo_urls = await fileUrlFromInput(e);
						}}
						accept="image/*"
						multiple
						id="bgimage"
					/>
				</div>
			</div>
			<div class="col-12">
				{#each config.logo_urls as url}
					<img alt="logo" src={url} class="m-1" style="max-height: 3em" />
				{/each}
			</div>
			<label class="col-12 mb-3">
				Titre de la page
				<input
					type="text"
					class="form-control"
					bind:value={config.title}
					placeholder="Texte affiché en haut de l'interface de scan"
				/>
			</label>
			<div class="form-floating col-12">
				<textarea
					bind:value={config.description}
					class="form-control"
					placeholder="Instructions"
					id="desc"
					style="height: 7em"
				/>
				<label for="desc">Instructions</label>
			</div>
			<label class="col-12 mb-3">
				Informations contractuelles en bas de la page
				<input
					type="text"
					class="form-control"
					bind:value={config.bottom_infos}
					placeholder="Affiché en petits caractères en sous l'interface de scan"
				/>
			</label>
			<label class="col-6 mb-3">
				Police de caractères du texte
				<input
					type="text"
					class="form-control"
					bind:value={config.font}
					placeholder="Arial, Helvetica, Garamond, ..."
				/>
			</label>
			<label class="col-6 mb-3">
				Taille du texte
				<input type="text" class="form-control" bind:value={config.font_size} placeholder="12" />
			</label>
			<label class="col-4 mb-3">
				<input type="checkbox" bind:checked={config.anonymize} />
				Cacher l'identité de la personne
			</label>
			<label class="col-4 mb-3">
				<input type="radio" bind:group={video_scan_num} value={0} />
				Scanneur de QR code USB physique
			</label>
			<label class="col-4 mb-3">
				<input type="radio" bind:group={video_scan_num} value={1} on:change={setPreview} />
				Scanner les QR code par vidéo
			</label>
			{#if video_scan_num}
				<div class="col-6 mb-3">
					Caméra à utiliser de préférence:
					<label>
						<input
							type="radio"
							bind:group={config.video_facing_mode}
							value="environment"
							on:change={setPreview}
						/>
						arrière
					</label>
					<label>
						<input
							type="radio"
							bind:group={config.video_facing_mode}
							value="user"
							on:change={setPreview}
						/>
						avant
					</label>
				</div>
				<div class="col-6">
					<p>Aperçu de la vidéo:</p>
					{#if video_preview_error}
						<p><small>{video_preview_error}</small></p>{/if}
					{#if !has_video_preview}
						<button class="btn btn-secondary" on:click|preventDefault={setPreview}>Afficher</button>
					{/if}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video height={has_video_preview ? 100 : 0} autoplay={true} bind:this={video_preview} />
				</div>
			{/if}
			<label class="col-12">
				<input type="checkbox" bind:checked={config.debug} />
				Affichage des informations de débogage
			</label>
		</div>
	</fieldset>
	<details>
		<summary>Requêtes HTTP externe</summary>
		<ExternalRequestsConfig bind:external_requests={config.external_requests} />
	</details>

	<input
		type="submit"
		class="btn btn-primary col-md-6 offset-md-6 mt-6"
		disabled={loading}
		value={loading ? 'Chargement' : 'Démarrer'}
	/>
</form>

<style>
	video {
		max-width: 200px;
		max-height: 200px;
	}
</style>
