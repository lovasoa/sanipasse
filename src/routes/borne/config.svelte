<script lang="ts">
	import { goto } from '$app/navigation';
	import b64 from 'base64-js';
	import { DEFAULT_CONFIG } from './_config';
	import type { ConfigProperties } from './_config';
	import { load_config as load_config_local_storage, save_config } from './_config_storage';
	import ExternalRequestsConfig from './_external_request_config.svelte';
	import { generateKey } from '$lib/random_key';
	import { get, put } from '$lib/http';
	import ShowPromiseError from '../_showPromiseError.svelte';
	import SoundPicker from './_sound_picker.svelte';

	let configKey: string = '';
	if (typeof window === 'object') configKey = new URLSearchParams(location.search).get('key') || '';

	let config = DEFAULT_CONFIG;
	let video_scan_num = 0;

	async function load_config_from_key(): Promise<ConfigProperties> {
		return get(`/api/borne/${configKey}`);
	}

	async function load_config() {
		if (configKey) return load_config_from_key();
		else return load_config_local_storage();
	}

	let config_promise = load_config();
	config_promise.then((data) => {
		config = data;
		video_scan_num = +(config.video_scan || 0);
	});
	let loading = false;
	$: config.video_scan = !!video_scan_num;

	let logosFileInput: HTMLInputElement | null = null;
	async function updateLogosUrls() {
		if (!logosFileInput) throw new Error('missing file element');
		const { files } = logosFileInput;
		if (!files || !files.length) throw new Error('No file in input');
		const files_buffers = Array.from(files).map((file) => ({
			file,
			arrayBuffer: file.arrayBuffer()
		}));
		config.logo_urls = [];
		for (const { file, arrayBuffer } of files_buffers) {
			const buffer = await arrayBuffer;
			const bytes = new Uint8Array(buffer);
			const url = `data:${file.type};base64,${b64.fromByteArray(bytes)}`;
			config.logo_urls.push(url);
			config.logo_urls = config.logo_urls; // refresh
		}
	}
	function resetLogosUrls() {
		config.logo_urls = [];
		if (logosFileInput) logosFileInput.value = '';
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
			video_preview_error = err instanceof Error ? err : new Error(`${err}`);
		}
	}

	async function uploadConfig() {
		if (!configKey) configKey = generateKey();
		uploadConfigPromise = put(`/api/borne/${configKey}`, config);
		await uploadConfigPromise;
		await goto(`/borne/config?key=${configKey}`);
	}

	let uploadConfigPromise: Promise<unknown> | null = null;
</script>

<svelte:head>
	<title>Borne de contrôle du passe sanitaire Sanipasse</title>
	<meta
		name="description"
		content="Sanipasse est un logiciel libre et gratuit qui fournit une interface de scan automatisé des passes sanitaires."
	/>
</svelte:head>

<ShowPromiseError promise={config_promise} />

<h1>Configuration de l'interface de validation des passes <i>Sanipasse borne</i></h1>

{#if configKey}
	<p>
		Cette configuration est utilisable depuis n'importe quel appareil en chargeant l'adresse
		suivante :
		<a href="/borne?key={configKey}" class="font-monospace"
			>{typeof window === 'object' ? window.location.host : 'sanipasse.fr'}/borne?key={configKey}</a
		>
	</p>
	<p>
		La configuration est modifiable uniquement à partir de la page actuelle, dont vous pouvez
		partager l'adresse avec vos collaborateurs.
	</p>
{:else}
	<p>
		<i>Sanipasse borne</i> est un logiciel libre et gratuit à installer sur une borne de contrôle automatique
		des pass sanitaires.
	</p>
	<p>
		Cette page vous permet de configurer l'interface de scan et de contrôle des passes. Une fois sur
		la page de scan, il vous faudra soit un lecteur physique de QR code, soit une webcam pour lire
		les passes sanitaires.
	</p>
{/if}

<form
	class="row g-3 my-3"
	on:submit|preventDefault={async () => {
		loading = true;
		console.log(config);
		await save_config(config);
		await goto('/borne');
		loading = false;
	}}
>
	<fieldset class="col-md-12">
		<legend>Affichage</legend>

		<div class="row">
			<div class="form-label col-12 mb-0">
				<div class="input-group">
					<label class="input-group-text" for="bgimage">Logos supérieurs</label>
					<input
						type="file"
						class="form-control"
						bind:this={logosFileInput}
						on:change={updateLogosUrls}
						accept="image/*"
						multiple
						id="bgimage"
					/>
				</div>
			</div>
			<div class="col-12 mb-3">
				{#each config.logo_urls as url}
					<img alt="logo" src={url} class="m-1" style="max-height: 3em" />
				{/each}
				{#if config.logo_urls.length > 0}
					<button type="button" class="btn btn-sm btn-outline-danger" on:click={resetLogosUrls}
						>Supprimer</button
					>
				{/if}
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
			<div class="form-floating col-12 text-muted">
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
				Informations contractuelles en bas de la page<br />
				<small class="text-muted"
					>(La <a href="/LICENSE">licence</a> de sanipasse vous demande d'informer vos utilisateurs de
					l'utilisation du logiciel, ainsi que de sa licence)
				</small>
				<input
					type="text"
					class="form-control"
					bind:value={config.bottom_infos}
					placeholder="Affiché en petits caractères en sous l'interface de scan"
				/>
			</label>

			<label
				class="col-4 mb-3"
				title="Si cette option est activée, le message de validation ne contiendra pas le nom de la personne dont le passe a été validé"
			>
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

			<details class="col-12 mt-2 ">
				<summary>Personnalisations de style avancées</summary>
				<div class="row">
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
						<input
							type="text"
							class="form-control"
							bind:value={config.font_size}
							placeholder="12"
						/>
					</label>
					<div class="form-floating col-12  font-monospace text-muted">
						<textarea
							bind:value={config.custom_css}
							class="form-control"
							placeholder={'body {\n  background-color: aliceblue;\n}'}
							id="customcss"
							style="height: 7em"
						/>
						<label for="customcss">Code CSS personnalisé</label>
					</div>
					<SoundPicker
						label="Son émis lors de l'acceptation d'un pass"
						sound_on_undefined="valid.mp3"
						bind:selected_sound={config.sound_valid}
						sounds={[
							{ name: 'auncun', asset: null },
							{ name: 'ding', asset: undefined },
							{ name: 'tulut', asset: 'tulut.mp3' },
							{ name: 'tin-liiin', asset: 'tin-lin.mp3' },
							{ name: 'plop', asset: 'plop.mp3' }
						]}
					/>
					<SoundPicker
						label="Son émis lors du refus d'un pass"
						sound_on_undefined="invalid.mp3"
						bind:selected_sound={config.sound_invalid}
						sounds={[
							{ name: 'auncun', asset: null },
							{ name: 'bong-bong-bong', asset: undefined },
							{ name: 'bong', asset: 'bong.mp3' },
							{ name: 'hein', asset: 'hein.mp3' }
						]}
					/>
				</div>
			</details>
		</div>
	</fieldset>
	<fieldset class="col-md-12">
		<legend>Durée d'attente…</legend>

		<div class="row">
			{#if !video_scan_num}
				<div class="form-label col-xl-4">
					<label for="wait">…avant la validation du code saisi</label>
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
			<div
				class="form-label col-xl-4"
				title="Temps d'affichage du message d'acceptation ou de refus du passe"
			>
				<label for="back">…avant le retour à l'interface de scan</label>
				<div class="input-group">
					<input
						type="number"
						step="0.1"
						class="form-control"
						placeholder="4"
						id="back"
						bind:value={config.reset_after_s}
					/>
					<div class="input-group-text">secondes</div>
				</div>
			</div>
			<div
				class="form-label col-xl-4"
				title="Une fois qu'un passe a été validé, il ne peut pas être réutilisé pendant cette durée, pour éviter que plusieurs personnes ne scannent le même passe."
			>
				<label for="norevalidation">...avant réutilisation du même passe</label>
				<div class="input-group">
					<input
						type="number"
						class="form-control"
						placeholder="pas de revalidation avant:"
						id="norevalidation"
						bind:value={config.prevent_revalidation_before_minutes}
					/>
					<div class="input-group-text">minutes</div>
				</div>
			</div>
		</div>
	</fieldset>

	<details>
		<summary>Interfaçage avec des services externes via <i>HTTP</i></summary>
		<ExternalRequestsConfig bind:external_requests={config.external_requests} />
	</details>

	<details class="p-2">
		<summary>Statistiques</summary>
		<p>
			Sanipasse borne a la capacité de stocker localement des statistiques anonymes sur le nombre de
			passes validés ou refusés au cours du temps. Ces statistiques ne contiennent aucune
			information personnelle, fonctionnent hors ligne, et ne sont pas envoyées au serveur de
			sanipasse.
		</p>
		<p>
			Si vous êtes un commerçant soumis au contrôle obligatoire du passe sanitaire, lors d'un
			contrôle, la police peut vous demander de fournir ces statistiques.
		</p>
		<label>
			<input type="checkbox" bind:checked={config.store_statistics} />
			Enregistrer les statistiques d'utilisation
		</label>

		<p class="my-2">
			Une fois collectées, les statistiques seront visibles depuis la
			<a href="/borne/statistiques">page de visualisation des statistiques</a>. Vous avez également
			la possibilité de donner accès aux statistiques aux visiteurs en ajoutant un bouton
			d'affichage des statistiques sur l'interface de scan.
		</p>

		<label>
			<input type="checkbox" bind:checked={config.show_statistics_on_scan} />
			Donner accès aux statistiques depuis l'interface de scan
		</label>
	</details>

	<ShowPromiseError promise={uploadConfigPromise} />

	<button
		class="btn btn-outline-primary col-md-5 mt-6 mx-2"
		disabled={loading}
		on:click|preventDefault={uploadConfig}
		title="Enregistrer ces paramètres sur le serveur de sanipasse pour pouvoir y accéder depuis un autre appareil"
		>Sauvegarder ces paramètres en ligne</button
	>
	<input
		type="submit"
		class="btn btn-primary col-md-5 mt-6 mx-2"
		disabled={loading}
		title="Sauvegarder les paramètres localement sur ce navigateur, et lancer l'interface de contrôle des passes sanitaires avec cette configuration"
		value={loading ? 'Chargement' : "Lancer l'interface de scan localement"}
	/>
</form>

<style>
	video {
		max-width: 200px;
		max-height: 200px;
	}
</style>
