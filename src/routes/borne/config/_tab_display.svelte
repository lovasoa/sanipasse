<script lang="ts">
	import { DEFAULT_CONFIG } from './_config';
	import FileUpload from './_file_upload.svelte';
	import SoundPicker from './_sound_picker.svelte';

	export let config = DEFAULT_CONFIG;
</script>

<fieldset class="col-md-12">
	<legend>Interface d'accueil</legend>

	<div class="row">
		<FileUpload
			bind:file_urls={config.background_images}
			label="Image de fond"
			allowed_types={['image', 'video']}
		/>
		<FileUpload
			bind:file_urls={config.slideshow_media}
			label="Média à afficher au dessus du message d'accueil"
			allowed_types={['image', 'video']}
		/>
		<FileUpload
			bind:file_urls={config.logo_urls}
			label="Logos supérieurs"
			allowed_types={['image']}
		/>
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
				<input type="text" class="form-control" bind:value={config.font_size} placeholder="12" />
			</label>
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
	</div>
</fieldset>

<fieldset class="col-md-12 mt-3">
	<legend>Durée d'attente…</legend>

	<div class="row">
		<div
			class="form-label col-md-6"
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
			class="form-label col-md-6"
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

<fieldset class="col-md-12 mt-3 row gy-2">
	<legend>Messages affichés après le scan</legend>
	<p>
		Vous pouvez choisir le message qui sera affiché aux utilisateurs lorsqu'ils scanneront leur
		passe. Dans le message de validation du passe,
		<code>$first_name</code> sera remplacé par le prénom du porteur du passe,
		<code>$last_name</code> par son nom de famille, et
		<code>$date_of_birth</code> par sa date de naissance. Dans le message de refus,
		<code>$message</code> sera remplacé par une phrase expliquant pourquoi le passe est invalide.
	</p>
	<div class="form-floating col-12 col-md-6 text-muted">
		<textarea
			bind:value={config.accepted_message}
			class="form-control"
			placeholder="Instructions"
			id="accepted_message"
			style="height: 7em"
		/>
		<label for="accepted_message" class="p-2"
			>Message affiché lorsqu'un passe est <b>accepté</b></label
		>
	</div>

	<div class="form-floating col-12 col-md-6 text-muted">
		<textarea
			bind:value={config.refused_message}
			class="form-control"
			placeholder="Instructions"
			id="refused_message"
			style="height: 7em"
		/>
		<label for="refused_message">Message affiché lorsqu'un passe est <b>refusé</b></label>
	</div>
</fieldset>
