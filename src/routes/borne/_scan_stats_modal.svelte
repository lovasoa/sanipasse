<script lang="ts">
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Icon } from 'sveltestrap';
	import Statistiques from './statistiques.svelte';
	let open = false;
	const toggle = () => (open = !open);
</script>

<button
	class="fixed-bottom btn btn-outline-secondary"
	title="statistiques d'utilisation"
	on:click={toggle}><Icon name="bar-chart-line" /></button
>

<Modal isOpen={open} {toggle}>
	<ModalHeader {toggle}>Sanipasse borne: statistiques</ModalHeader>
	<ModalBody>
		<Statistiques with_interactions={false} />
	</ModalBody>
	<ModalFooter>
		<Button color="secondary" on:click={toggle}>Fermer</Button>
	</ModalFooter>
</Modal>

<style>
	button {
		border-radius: 100%;
		width: 3em;
		height: 3em;
		margin: 1.2em;
		right: 0;
		left: auto;
	}
</style>
