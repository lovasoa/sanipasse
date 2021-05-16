<script type="ts">
	import type { Names } from '$lib/invitees';
	import { normalize } from '$lib/invitees';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ invitee: Names }>();

	let first_name: string = '';
	let last_name: string = '';

	let firstField: HTMLInputElement | null = null;

	$: first_name = normalize(first_name, false);
	$: last_name = normalize(last_name, false);

	function submit(e: Event) {
		e.preventDefault();
		dispatch('invitee', { first_name, last_name });
		first_name = '';
		last_name = '';
		if (firstField) firstField.focus();
	}
</script>

<h3>Ajouter un invité</h3>
<form class="alert alert-info" role="alert" on:submit={submit}>
	<div class="row">
		<label class="form-label col-md-12 col-lg-6"
			>Prénom
			<input
				type="text"
				class="form-control text-capitalize"
				placeholder="Marcel"
				required
				bind:value={first_name}
				bind:this={firstField}
			/>
		</label>
		<label class="form-label col-md-12 col-lg-6"
			>Nom
			<input
				type="text"
				class="form-control text-uppercase"
				placeholder="Proust"
				required
				bind:value={last_name}
			/>
		</label>
	</div>
	<input type="submit" class="btn btn-primary" value="Ajouter" />
</form>
