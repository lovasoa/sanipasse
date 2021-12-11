<script lang="ts">
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Icon } from 'sveltestrap';
	import Statistiques from './statistiques.svelte';
	let open = false;
	let status: 'opening' | 'opened' | 'closing' | 'closed' = 'closed';
	function toggle() {
		if (status === 'opening' || status === 'closing') return;
		open = !open;
	}
</script>

<div
	role="button"
	id="stats-btn"
	class="fixed-bottom btn btn-outline-secondary"
	title="statistiques d'utilisation"
	on:click={toggle}
>
	<Icon name="bar-chart-line" />
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
