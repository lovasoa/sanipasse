<script lang="ts">
	import type { DBEvent } from '$lib/event';
	import { get } from '$lib/http';
	import { onMount } from 'svelte';
	const eventId = globalThis?.location?.hash?.slice(1);
	import { Row } from 'sveltestrap';
	import ShowPromiseError from './_showPromiseError.svelte';
	let links = [
		{ href: 'import/video', text: '📸 Scanner un certificat' },
		{ href: 'import/file', text: '📁 Importer un fichier' },
		{ href: 'import/text', text: '🔗 Entrer un lien TousAntiCovid' }
	];
	if (eventId) links = links.map((l) => ({ ...l, href: `${l.href}#${eventId}` }));
	let promise: Promise<DBEvent | null> = eventId ? new Promise(() => {}) : Promise.resolve(null);
	let event: DBEvent | null = null;
	onMount(async () => {
		if (eventId) {
			promise = get(`/api/publicevent-${eventId}/event.json`);
			event = await promise;
		}
	});
</script>

<svelte:head>
	{#if event}
		<title>Sanipasse: “{event.name}”</title>
	{:else}
		<title>Sanipasse: Vérification de pass sanitaire</title>
	{/if}
</svelte:head>

<header>
	<h1>Bienvenue sur Sanipasse</h1>

	<ShowPromiseError {promise} />

	{#if eventId}
		<p>
			Ceci est une invitation à l'évènement
			<i class="bg-light">{event?.name || '...'}</i>, qui aura lieu le
			{event ? new Date(event.date).toLocaleString('fr') : '...'}.
		</p>
		<p>
			Pour confirmer votre participation, vous devez scanner un certificat de test de moins de 72h,
			ou un certificat de vaccination (de seconde dose si le vaccin en demande deux).
		</p>
		<p>
			Votre passe sanitaire est <a href="apropos#donnees">strictement privée</a>. Il ne sera
			<b>pas conservé</b>
			sur notre serveur, <b>ni visible</b> par l'organisateur de l'événement.
		</p>
	{:else}
		<p>
			Sanipasse est un logiciel libre de vérification des certificats de test ou de
			vaccination, et d'organisation d’événements respectueux des règles sanitaires.
		</p>
		<p>
			La vérification proposée ci-dessous est <a href="apropos#donnees">strictement privée</a>, et
			vos données ne quittent jamais votre appareil.
		</p>
	{/if}
</header>

{#each links as { href, text }, i (href)}
	<Row>
		<a {href} class="btn" class:btn-primary={i == 0}>{text}</a>
	</Row>
{/each}

<footer class="mb-2">
	{#if !eventId}
		<p>
			Vous pouvez également <i>Créer un événement</i>, pour construire une
			<a href="apropos#liste">liste d'invités zéro-COVID</a>. Sanipasse générera un lien privé à
			envoyer à vos invités, depuis lequel ils pourront confirmer leur participation en validant
			leur passe sanitaire.
		</p>
		<Row>
			<a href="events" class="btn btn-primary">📅 Créer un évènement</a>
		</Row>
	{/if}
</footer>

<style>
	a,
	header,
	footer {
		max-width: 512px;
		margin: 1em auto;
	}
</style>
