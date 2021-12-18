<script lang="ts">
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Icon } from 'sveltestrap';
	import Statistiques from './statistiques.svelte';
	export let autoclose: boolean | undefined = false;
	let open = false;
	let status: 'opening' | 'opened' | 'closing' | 'closed' = 'closed';

	let autoclose_timer: NodeJS.Timer | null = null;
	let autoclose_remaining_seconds = 0;

	function toggle() {
		if (status === 'opening' || status === 'closing') return;
		open = !open;
		if (autoclose_timer) {
			clearInterval(autoclose_timer);
			autoclose_remaining_seconds = 0;
		}
		if (open && autoclose) {
			autoclose_remaining_seconds = 30;
			autoclose_timer = setInterval(autoclose_callback, 1000);
		}
	}

	function autoclose_callback() {
		autoclose_remaining_seconds -= 1;
		if (autoclose_remaining_seconds <= 0) {
			open = false;
			if (autoclose_timer) clearInterval(autoclose_timer);
		}
	}
</script>

<div
	role="button"
	id="stats-btn"
	class="fixed-bottom btn btn-outline-secondary"
	title="statistiques d'utilisation"
	on:click={toggle}
>
	{#if autoclose_remaining_seconds}
		<strong>{autoclose_remaining_seconds}</strong>
	{:else}
		<Icon name="bar-chart-line" />
	{/if}
</div>

<Modal
	isOpen={open}
	{toggle}
	on:close={(_) => (status = 'closed')}
	on:open={(_) => (status = 'opened')}
	on:closing={(_) => (status = 'closing')}
	on:opening={(_) => (status = 'opening')}
>
	<ModalHeader {toggle}>Sanipasse borne: statistiques</ModalHeader>
	<ModalBody>
		<Statistiques with_interactions={false} />
	</ModalBody>
	<ModalFooter>
		<Button color="secondary" on:click={toggle}>Fermer</Button>
	</ModalFooter>
</Modal>

<style>
	#stats-btn {
		border-radius: 100%;
		width: 3em;
		height: 3em;
		margin: 1.2em;
		line-height: 2em;
		right: 0;
		left: auto;
	}
</style>
