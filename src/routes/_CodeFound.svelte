<script lang="ts">
	import { Alert, Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'sveltestrap';
	import { parse } from '$lib/2ddoc';
	import type { Certificate } from '$lib/2ddoc';
	import CertificateBox from './_Certificate.svelte';
	import { put } from '$lib/http';
	import ShowPromiseError from './_showPromiseError.svelte';
	const eventId = globalThis?.location?.hash?.slice(1);
	export let codeFound: string | undefined = undefined;
	let parsed: Certificate | null = null;
	let error: string = '';
	$: if (codeFound) onCode(codeFound);
	async function onCode(codeFound: string) {
		try {
			if (codeFound) parsed = await parse(codeFound);
			error = '';
		} catch (err) {
			error = `${err}`;
		}
	}

	let promise: Promise<unknown> | null = null;
	async function send(eventId: string, code: string) {
		promise = put(`/api/publicevent-${eventId}/invite.json`, { code });
	}

	const toggle = () => (codeFound = undefined);
</script>

{#if error}
	<div class="row mt-5">
		<Alert color="danger" fade={false}>
			<h4>Erreur</h4>
			<code>{error}</code>
		</Alert>
	</div>
{:else if codeFound && parsed}
	<Modal isOpen={!!codeFound} {toggle}>
		<ModalHeader>
			{#if eventId}Confirmer ma présence
			{:else}Certificat détecté
			{/if}
		</ModalHeader>
		<ModalBody>
			<CertificateBox certificate={parsed} />
			<ShowPromiseError {promise} />
		</ModalBody>
		<ModalFooter>
			<Button color="secondary" on:click={toggle}>Fermer</Button>
			{#if eventId}
				<Button color="primary" on:click={() => send(eventId, codeFound)}
					>Envoyer mon certificat</Button
				>
			{/if}
		</ModalFooter>
	</Modal>
{/if}
