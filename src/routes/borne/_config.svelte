<script lang="ts">
	export let start: boolean = false;
	export let decode_after_s: number;
	export let reset_after_s: number;
	export let place_name: string;
</script>

<h2>Configuration de l'interface de validation des passes</h2>
<form class="row g-3">
	<label class="col-md-12">
		Nom du lieu
		<input type="text" class="form-control" bind:value={place_name} placeholder="mon petit resto" />
	</label>
	<fieldset class="col-md-12">
		<legend>Durée d'attente...</legend>

		<div class="row">
			<div class="form-label col-md-6">
				<label for="wait">...avant la validation du code saisi</label>
				<div class="input-group">
					<input
						type="number"
						step="0.1"
						class="form-control"
						placeholder="1"
						id="wait"
						bind:value={decode_after_s}
					/>
					<div class="input-group-text">secondes</div>
				</div>
			</div>
			<div class="form-label col-md-6">
				<label for="back">...avant le retour à l'interface de scan</label>
				<div class="input-group">
					<input
						type="number"
						step="0.1"
						class="form-control"
						placeholder="4"
						id="back"
						bind:value={reset_after_s}
					/>
					<div class="input-group-text">secondes</div>
				</div>
			</div>
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
