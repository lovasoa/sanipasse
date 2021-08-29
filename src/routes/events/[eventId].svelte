<script type="ts">
	import InviteesList from './_inviteesList.svelte';
	import { getKey, Invitees, parseKey } from '$lib/invitees';
	import type { Names } from '$lib/invitees';
	import AddInvitee from './_addInvitee.svelte';
	import ShowPromiseError from '../_showPromiseError.svelte';
	import { get, put, http_delete } from '$lib/http';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { DBEvent, EventWithPeople } from '$lib/event';
	import Communicate from './_communicate.svelte';
	const localforage = import('localforage'); // Can fail on node

	const REFRESH_INTERVAL_SECONDS = 15;

	let invitees = new Invitees();
	const { eventId } = $page.params;
	let currentPromise: Promise<any> | null = new Promise(() => {});
	let event: EventWithPeople | null = null;
	let interval: NodeJS.Timeout | null = null;

	async function loadData() {
		const promise = get<EventWithPeople>(`/api/event-${eventId}/event.json`);
		currentPromise = promise;
		event = await promise;
		event.people.forEach((p) => {
			invitees = invitees.add({ ...parseKey(p.key), ...p });
		});
	}

	function resetInterval() {
		if (interval) clearInterval(interval);
		if (document.visibilityState === 'visible') {
			loadData();
			interval = setInterval(loadData, 1000 * REFRESH_INTERVAL_SECONDS);
		}
	}

	/**
	 * Add the event to local storage
	 */
	async function persistEvent() {
		const [storage, _data_ready] = await Promise.all([localforage, currentPromise]);
		let events: DBEvent[] = (await storage.getItem('events')) || [];
		events = events.filter((e) => e.private_code !== eventId);
		if (!event) throw new Error('currentPromise loaded but event is null');
		const { private_code, name, date } = event;
		events.push({ private_code, name, date });
		await storage.setItem('events', events);
	}

	onMount(() => {
		resetInterval();
		persistEvent();
		document.addEventListener('visibilitychange', resetInterval);
		return () => {
			if (interval) clearInterval(interval);
			document.removeEventListener('visibilitychange', resetInterval);
		};
	});

	async function invite(person: Names) {
		invitees = invitees.invite(person);
		currentPromise = put(`/api/event-${event?.private_code}/invite.json`, {
			key: getKey(person)
		});
	}

	async function remove(key: string) {
		invitees = invitees.delete(key);
		currentPromise = http_delete(`/api/event-${event?.private_code}/invite.json`, { key });
		return;
	}
</script>

<svelte:head>
	<title>Événement Sanipasse: {event?.name || '...'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if event}
	<h2>
		{event.name}<small class="text-muted fs-5"
			>, le {new Date(event.date).toLocaleString('fr')}
		</small>
	</h2>
{/if}
<div class="row">
	<div class="col-sm-12 col-md-6 col-lg-5 p-2">
		<InviteesList {invitees} {event} on:remove={(evt) => remove(evt.detail)} />
		<ShowPromiseError promise={currentPromise} />
	</div>
	<div class="col-sm-12 col-md-6 col-lg-7 p-2">
		<AddInvitee on:invitee={(evt) => invite(evt.detail)} />
		{#if event}<Communicate {event} />{/if}
	</div>
</div>
