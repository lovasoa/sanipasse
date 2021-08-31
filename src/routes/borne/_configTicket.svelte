<script lang="ts">
	import type { TicketConfig } from '$lib/borne_config';

	export let config:TicketConfig;
</script>

<fieldset class="col-12">
	<div class="row">
		<label class="col-6">
			<input type="checkbox" bind:checked={config.print} />
			Imprimer un ticket en cas de présentation d'un passe valide.
		</label>
		<div
			class="form-label col-6"
			title="Largeur du ticket à imprimer"
		>
			<label for="ticketWidth">Largeur du ticket</label>
			<div class="input-group">
				<input
					type="number"
					class="form-control"
					placeholder="90"
					id="ticketWidth"
					bind:value={config.width}
					min="70" max="210"
				/>
				<div class="input-group-text">mm</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="form-floating col-6 font-monospace text-muted">
			<textarea
				bind:value={config.header}
				class="form-control"
				placeholder={'Bienvenue dans notre établissement.'}
				id="ticket_header"
				style="height: 7em"
			/>
			<label for="ticket_header">Entête</label>
		</div>
		<div class="form-floating col-6 font-monospace text-muted">
			<textarea
				bind:value={config.footer}
				class="form-control"
				placeholder={'Merci de votre visite.'}
				id="ticket_footer"
				style="height: 7em"
			/>
			<label for="ticket_footer">Pied de page</label>
		</div>
	</div>
</fieldset>
