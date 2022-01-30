<script lang="ts">
	import type { ConfigProperties } from './_config';
	import ExternalRequestsConfig from './_external_request_config.svelte';
	import SoundPicker from './_sound_picker.svelte';

	export let config: ConfigProperties;
	$: video_scan_num = +(config.video_scan || 0);
	let video_preview: HTMLVideoElement | undefined = undefined;
	let has_video_preview = false;
	let video_preview_error: Error | null = null;

	async function setPreview() {
		if (!video_preview || !config.video_scan) return;
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
</script>

<fieldset class="col-md-12 row mt-2">
	<legend>Mode de saisie des QR codes</legend>
	<label class="col-4 mb-3">
		<input
			type="radio"
			bind:group={video_scan_num}
			value={0}
			on:change={() => (config.video_scan = false)}
		/>
		Scanneur de QR code USB physique
	</label>
	<label class="col-4 mb-3">
		<input
			type="radio"
			bind:group={video_scan_num}
			value={1}
			on:change={setPreview}
			on:click={() => (config.video_scan = true)}
		/>
		Scanner les QR code par vidéo
	</label>
	{#if config.video_scan}
		<div class="col-12 col-sm-6 mb-3">
			Caméra à utiliser de préférence:
			<ul>
				<li>
					<label>
						<input
							type="radio"
							bind:group={config.video_facing_mode}
							value="environment"
							on:change={setPreview}
						/>
						arrière
					</label>
				</li>
				<li>
					<label>
						<input
							type="radio"
							bind:group={config.video_facing_mode}
							value="user"
							on:change={setPreview}
						/>
						avant
					</label>
				</li>
			</ul>
		</div>
		<div class="col-12 col-sm-6">
			<p>Aperçu de la vidéo:</p>
			{#if video_preview_error}
				<p><small>{video_preview_error}</small></p>{/if}
			{#if !has_video_preview}
				<button class="btn btn-secondary" on:click|preventDefault={setPreview}>Afficher</button>
			{/if}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video height={has_video_preview ? 100 : 0} autoplay={true} bind:this={video_preview} />
		</div>
	{:else}<!-- USB scanning -->
		<div class="col-xl-6">
			Les lecteurs suivants, de l’entreprise française Solucode, ont été testés par le distributeur
			et fonctionnent avec sanipasse borne:
			<ul>
				<li>
					<a
						href="https://solucode.com/fr/inventaires-codebarre/189-dc320-lecteur-2d-imageur-filaire-kit-complet-usb-noir-districode.html"
						>Pistolet 2D DC 320</a
					>
				</li>
				<li>
					<a
						href="https://solucode.com/fr/accueil/257-dc7500-scanner-omnidirectionnel-filaire-2d-rs232.html"
						>Mini Scanner DC 7500</a
					>
				</li>
			</ul>
		</div>
		<div class="form-label col-xl-6">
			<label for="wait">Durée d'attente avant la validation du code saisi</label>
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
</fieldset>

<fieldset class="col-md-12 row mt-2">
	<legend>Règles de validation des passes à appliquer</legend>
	<div class="list-group">
		<label class="list-group-item list-group-item-action d-flex">
			<input
				class="form-check-input m-3 align-self-center flex-shrink-0"
				type="radio"
				bind:group={config.validation_ruleset}
				value={'tousAntiCovidDefaultRules'}
			/>
			<div>
				<h5>Règles par défaut</h5>
				Depuis le 24 janvier, et l'instauration du passe vaccinal, seuls les vaccins sont acceptés dans
				la plupart des lieux.
			</div>
		</label>
		<label class="list-group-item list-group-item-action d-flex">
			<input
				class="form-check-input m-3 align-self-center flex-shrink-0"
				type="radio"
				bind:group={config.validation_ruleset}
				value={'tousAntiCovidHealthRules'}
			/>
			<div>
				<h5>Règles pour les établissements de santé</h5>
				La loi sur le passe vaccinal ne concerne pas hôpitaux, maisons de retraite et établissements
				médico-sociaux.
			</div>
		</label>
	</div>
</fieldset>

<fieldset class="col-md-12 row mt-2">
	<legend>Personnalisation avancée</legend>

	<label class="col-12">
		<input type="checkbox" bind:checked={config.debug} />
		Affichage des informations de débogage
	</label>

	<div class="row mt-3">
		<p class="text-muted">
			Vous pouvez personnaliser tous les aspects de l'apparence de votre interface de validation à
			l'aide du langage <i>CSS</i>.
			<a href="/borne/config/custom-css-documentation" class="link-dark">En savoir plus</a>.
		</p>
		<div class="form-floating col-12  font-monospace text-muted">
			<textarea
				bind:value={config.custom_css}
				class="form-control"
				placeholder={'body {\n  background-color: aliceblue;\n}'}
				id="customcss"
				style="height: 7em"
			/>
			<label for="customcss">Code CSS personnalisé à appliquer sur l'interface</label>
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
</fieldset>

<fieldset class="p-2">
	<legend>Statistiques</legend>
	<p>
		Sanipasse borne a la capacité de stocker localement des statistiques anonymes sur le nombre de
		passes validés ou refusés au cours du temps. Ces statistiques ne contiennent aucune information
		personnelle, fonctionnent hors ligne, et ne sont pas envoyées au serveur de sanipasse.
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
		<a href="/borne/statistiques">page de visualisation des statistiques</a>. Vous avez également la
		possibilité de donner accès aux statistiques aux visiteurs en ajoutant un bouton d'affichage des
		statistiques sur l'interface de scan.
	</p>

	<label>
		<input type="checkbox" bind:checked={config.show_statistics_on_scan} />
		Donner accès aux statistiques depuis l'interface de scan
	</label>

	{#if config.show_statistics_on_scan}
		<label>
			<input type="checkbox" bind:checked={config.autoclose_statistics} />
			Fermer la fenêtre de statistiques automatiquement après quelques secondes.
		</label>
	{/if}
</fieldset>

<fieldset class="p-2">
	<legend>Interfaçage avec des services externes via <i>HTTP</i></legend>
	<ExternalRequestsConfig bind:external_requests={config.external_requests} />
</fieldset>

<style>
	video {
		max-width: 200px;
		max-height: 200px;
	}
</style>
