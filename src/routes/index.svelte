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
	else links.push({ href: 'events', text: '📅 Créer un évènement' });
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
	{/if}
</header>

{#each links as { href, text }, i (href)}
	<Row>
		<a {href} class="btn" class:btn-primary={i == 0}>{text}</a>
	</Row>
{/each}

<style>
	a,
	header {
		max-width: 512px;
		margin: auto;
		margin-top: 2em;
	}
</style>
