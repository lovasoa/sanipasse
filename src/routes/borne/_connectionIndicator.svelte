<script lang="ts">
	import { onMount } from 'svelte';
	import { Modal, ModalBody, ModalHeader } from 'sveltestrap';
	import type { ConfigProperties } from './config/_config';

	export let config: ConfigProperties;
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
		<p>
			Sanipasse v{process.env.SANIPASSE_VERSION}, mis à jour le {new Date(
				process.env.SANIPASSE_BUILD_DATE || 0
			).toLocaleString('fr')}
		</p>
		<p>
			Passes validés avec les
			{#if config.validation_ruleset === 'tousAntiCovidDefaultRules'}
				règles par défaut de TousAntiCovid
			{:else if config.validation_ruleset === 'tousAntiCovidVaccineRules'}
				règles du passe vaccinal
			{:else if config.validation_ruleset === 'tousAntiCovidHealthRules'}
				règles du passe sanitaire (tests acceptés)
			{:else}
				règles personnalisées définies par l'opérateur
			{/if}
			.
		</p>
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
