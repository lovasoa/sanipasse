<script lang="ts">
	import { Alert, Modal, ModalBody, ModalFooter, ModalHeader, Button, Icon } from 'sveltestrap';
	import CertificateBox from './_Certificate.svelte';
	import { put } from '$lib/http';
	import ShowPromiseError from './_showPromiseError.svelte';
	import wallet from './_myWalletStore';
	import invitedTo from './_invitedToStore';
	import { parse_any } from '$lib/detect_certificate';
	import type { CommonCertificateInfo } from '$lib/detect_certificate';
	export let codeFound: string | undefined = undefined;
	let info: CommonCertificateInfo | null = null;
	let error = '';
	let status: 'notsent' | 'sending' | 'validated' | 'error' = 'notsent';
	$: if (codeFound) onCode(codeFound);
	async function onCode(codeFound: string) {
		try {
			status = 'notsent';
			promise = null;
			if (codeFound) info = await parse_any(codeFound);
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
{:else if codeFound && info}
	<Modal isOpen={!!codeFound} {toggle} size="lg">
		{#if $invitedTo.eventId}
			<ModalHeader>Confirmer ma présence</ModalHeader>
		{/if}

		<ModalBody>
			<CertificateBox {info} />
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
			{#if $invitedTo.eventId}
				{#if status === 'notsent'}
					<Button
						color="primary"
						on:click={() => $invitedTo.eventId && codeFound && send($invitedTo.eventId, codeFound)}
					>
						<Icon name="upload" />
						Envoyer mon certificat
					</Button>
					<hr />
					<p class="fst-italic" style="font-size: .7rem">
						Votre certificat ne sera pas stocké par Sanipasse, ni visible par l'organisateur de
						l'événement <b>{$invitedTo.event?.name || ''}</b>.
					</p>
				{:else if status === 'sending'}
					<Button color="secondary" disabled={true}>
						<div class="spinner-border text-primary spinner-border-sm" role="status" />
						Envoi...
					</Button>
				{/if}
			{:else if $wallet.includes(info.code)}
				<Button color="primary" disabled={true}>
					<Icon name="download" />
					Déjà enregistré dans mon carnet
				</Button>
			{:else}
				<Button color="primary" on:click={() => info && wallet.add(info.code)}>
					<Icon name="download" />
					Enregistrer dans mon carnet
				</Button>
				<p class="fst-italic" style="font-size: .7rem">
					Votre carnet de test est enregistré localement sur votre appareil et n'est pas envoyé sur
					les serveurs de sanipasse. Il est disponible depuis la page d'accueil.
				</p>
			{/if}
		</ModalFooter>
	</Modal>
{/if}
