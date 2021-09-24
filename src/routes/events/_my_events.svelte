<script type="ts">
	import type { DBEvent } from '$lib/event';
	import { get_from_local_store } from '$lib/storage';

	async function loadEvents() {
		const stored = await get_from_local_store<DBEvent[]>('events');
		return stored || [];
	}
	let events: Promise<DBEvent[]> | null = null;
	events = loadEvents();
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
