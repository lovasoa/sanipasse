<script type="ts">
	import type { DBEvent } from '$lib/event';
	async function loadEvents() {
		const localforage = await import('localforage');
		return (await localforage.getItem<DBEvent[]>('events')) || [];
	}
	let events: Promise<DBEvent[]> | null = null;
	if (typeof window !== 'undefined') events = loadEvents();
</script>

{#await events then events}
	{#if events && events.length}
		<p class="mb-3">
			Vos événements:
			{#each events as event}
				<a class="me-1 badge rounded-pill bg-light text-dark" href="/events/{event.private_code}"
					>{event.name}</a
				>{/each}.
		</p>
	{/if}
{/await}
