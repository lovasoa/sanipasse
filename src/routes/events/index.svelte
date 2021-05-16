<script type="ts">
	import { goto } from '$app/navigation';
	import type { DBEvent, EventData } from '$lib/event';
	import { put } from '$lib/http';
	import ShowPromiseError from '../_showPromiseError.svelte';

	let name: string = '';
	let date: Date = new Date();
	date.setHours(12, 0, 0, 0);
	$: hours =
		date.getHours().toString().padStart(2, '0') +
		':' +
		date.getMinutes().toString().padStart(2, '0');

	let creationPromise: Promise<unknown> | null = null;

	async function createEvent() {
		const event: EventData = { name, date: date.toISOString() };
		const { private_code }: DBEvent = await put('/api/create_event', event);
		await goto(`events/${private_code}`);
	}

	function inputDate(e: Event): Date {
		return (e.target as any)?.valueAsDate;
	}
</script>

<svelte:head>
	<title>Sanipasse: Créer un événement</title>
</svelte:head>

<form
	on:submit={(e) => {
		e.preventDefault();
		creationPromise = createEvent();
	}}
>
	<h3>Créer un évènement</h3>

	<div class="mb-3">
		<label class="form-label"
			>Nom de l'évènement
			<input
				type="text"
				name="name"
				class="form-control"
				placeholder="Mon rendez-vous important"
				required
				bind:value={name}
			/>
		</label>
	</div>
	<h6>Date et heure de l'évènement</h6>
	<div class="row">
		<div class="col-sm-8">
			<label class="form-label"
				>Date <input
					type="date"
					class="form-control"
					required
					min={new Date().toISOString().substr(0, 10)}
					value={date.toISOString().substr(0, 10)}
					on:change={(e) => {
						const d = inputDate(e);
						date.setFullYear(d.getFullYear());
						date.setMonth(d.getMonth());
						date.setDate(d.getDate());
					}}
				/></label
			>
		</div>
		<div class="col-sm-4">
			<label class="form-label"
				>Heure
				<input
					type="time"
					class="form-control"
					required
					value={hours}
					on:change={(e) => {
						const d = inputDate(e);
						date.setHours(d.getHours());
						date.setMinutes(d.getMinutes());
					}}
				/></label
			>
		</div>
	</div>
	<!-- Pas de mot de passe pour l'instant, c'est l'eventId qui est secret
	<div class="row">
		<label class="form-label"
			><h6>Mot de passe</h6>
			<input type="password" class="form-control" required bind:value={password} />
		</label>
		<div class="form-text">
			💡 Choisissez un mot de passe fort pour protéger votre liste d'invités. Vous pouvez utiliser
			le gestionnaire de mots de passe de votre navigateur pour générer un bon mot de passe
			automatiquement.
		</div>
	</div>
    -->
	<div class="row">
		<button type="submit" class="btn btn-primary mt-3 col-sm-12 col-md-3 offset-md-9"
			>📅 Créer l'évènement</button
		>
	</div>
</form>

<ShowPromiseError promise={creationPromise} />

<style>
	label {
		width: 100%;
	}
</style>
