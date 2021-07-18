<script lang="ts">
	import type { ConfigProperties } from './_config';
	export let start: boolean = false;
	export let config: ConfigProperties;
	function fileUrlFromInput(evt: { currentTarget: HTMLInputElement }): Promise<string[]> {
		const { files } = evt.currentTarget;
		if (!files || !files.length) throw new Error('No file in input');
		return Promise.all(
			Array.from(files).map(async (f) => {
				const buffer = await f.arrayBuffer();
				const blob = new Blob([buffer], { type: f.type });
				return URL.createObjectURL(blob);
			})
		);
	}
</script>

<h2>Configuration de l'interface de validation des passes</h2>
<form class="row g-3">
	<fieldset class="col-md-12">
		<legend>Durée d'attente...</legend>

		<div class="row">
			<div class="form-label col-xl-6">
				<label for="wait">...avant la validation du code saisi</label>
				<div class="input-group">
					<input
						type="number"
						step="0.1"
						class="form-control"
						placeholder="1"
						id="wait"
						bind:value={config.decode_after_s}
					/>
					<div class="input-group-text">secondes</div>
				</div>
			</div>
			<div class="form-label col-xl-6">
				<label for="back">...avant le retour à l'interface de scan</label>
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
		</div>
	</fieldset>
	<fieldset class="col-md-12">
		<legend>Affichage</legend>

		<div class="row">
			<div class="form-label col-12 mb-0">
				<div class="input-group">
					<label class="input-group-text" for="bgimage">Logos supérieurs </label>
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
		</div>
	</fieldset>
	<input
		type="submit"
		class="btn btn-primary col-md-6 offset-md-6 mt-6"
		on:click={() => {
			start = true;
		}}
		value="Démarrer"
	/>
</form>
