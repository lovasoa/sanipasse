<script lang="ts">
	import { onMount } from 'svelte';
	import { Modal, ModalBody, ModalHeader } from 'sveltestrap';

	export let last_update = new Date();
	export let last_sync = new Date();

	let online = true;

	function updateOnlineStatus() {
		online = typeof navigator !== 'object' || navigator.onLine;
	}

	onMount(() => {
		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);
		updateOnlineStatus();
	});

	let open = false;
	const toggle = () => (open = !open);
</script>

<Modal isOpen={open} {toggle}>
	<ModalHeader {toggle}>{online ? 'En ligne' : 'Hors ligne'}</ModalHeader>
	<ModalBody>
		<p>Dernière synchronisation réussie le {last_sync.toLocaleString('fr')}.</p>
		{#if last_update !== last_sync}
			<p>Mise à jour de configuration le {last_update.toLocaleString('fr')}.</p>
		{/if}
		<p>Vous êtes {online ? 'en ligne' : 'hors ligne'}.</p>
	</ModalBody>
</Modal>

<span on:click={toggle}>
	{online ? '✔️' : '⚠️'}
</span>

<style>
	span {
		font-size: 0.9em;
		font-style: normal;
		cursor: pointer;
		padding: 0.2em;
	}
	p {
		margin-top: 0;
	}
</style>
