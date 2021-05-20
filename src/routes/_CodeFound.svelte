<script lang="ts">
	import { Alert, Modal, ModalBody, ModalFooter, ModalHeader, Button, Icon } from 'sveltestrap';
	import { parse } from '$lib/2ddoc';
	import type { Certificate } from '$lib/2ddoc';
	import CertificateBox from './_Certificate.svelte';
	import { put } from '$lib/http';
	import ShowPromiseError from './_showPromiseError.svelte';
	const eventId = globalThis?.location?.hash?.slice(1);
	export let codeFound: string | undefined = undefined;
	let parsed: Certificate | null = null;
	let error: string = '';
	let status: 'notsent' | 'sending' | 'validated' | 'error' = 'notsent';
	$: if (codeFound) onCode(codeFound);
	async function onCode(codeFound: string) {
		try {
			status = 'notsent';
			promise = null;
			if (codeFound) parsed = await parse(codeFound);
			error = '';
		} catch (err) {
			error = `${err}`;
		}
	}

	let promise: Promise<unknown> | null = null;

	$: promise?.then(() => (status = 'validated')).catch(() => (status = 'error'));

	async function send(eventId: string, code: string) {
		status = 'sending';
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
			{#if status === 'validated'}
				<div class="alert alert-success mt-4" role="alert">
					<h5>✅ Certificat validé</h5>
					<p>Votre participation à l'événement est confirmée.</p>
				</div>
			{/if}
		</ModalBody>
		<ModalFooter>
			<Button color="secondary" on:click={toggle}>Fermer</Button>
			{#if eventId}
				{#if status === 'notsent'}
					<Button color="primary" on:click={() => send(eventId, codeFound)}>
						<Icon name="upload" />
						Envoyer mon certificat
					</Button>
					<hr />
					<p class="fst-italic" style="font-size: .7rem">
						Votre certificat ne sera pas stocké par Sanipasse, ni visible par l'organisateur de
						l'événement.
					</p>
				{:else if status === 'sending'}
					<Button color="secondary" disabled={true}>
						<div class="spinner-border text-primary spinner-border-sm" role="status" />
						Envoi...
					</Button>
				{/if}
			{/if}
		</ModalFooter>
	</Modal>
{/if}
