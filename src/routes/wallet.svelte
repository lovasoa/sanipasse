<script lang="ts">
	import { Alert } from 'sveltestrap';

	import { parse_any } from '$lib/detect_certificate';
	import Certificate from './_Certificate.svelte';
	import CodeFound from './_CodeFound.svelte';

	import invitedTo from './_invitedToStore';
	import wallet from './_myWalletStore';
	import { storage_is_volatile, storage_usage_ratio } from '$lib/storage';

	let codeFound: string | undefined = undefined;
	let is_volatile = storage_is_volatile();
</script>

<h3>Mon carnet</h3>

{#if $invitedTo.eventId}
	<p>
		Pour valider votre participation à l'événement <i>{$invitedTo.event?.name || ''}</i> avec l'un des
		certificats ci-dessous, cliquez simplement dessus.
	</p>
{/if}

{#if $wallet.length > 0}
	{#await is_volatile then can_loose_data}
		{#if can_loose_data}
			<div class="alert alert-warning row">
				<p class="col-12">
					<strong>Attention !</strong> Votre carnet n'est pas enregistré de manière permanente par votre
					navigateur.
				</p>
				<button
					class="btn btn-primary btn-sm col align-self-end"
					on:click={async () => {
						await navigator.storage.persist();
						is_volatile = storage_is_volatile();
					}}>Enregistrer</button
				>
			</div>
		{/if}
	{/await}
	{#await storage_usage_ratio() then usage_ratio}
		{#if usage_ratio && usage_ratio > 0.7}
			<Alert color="warning" fade={false}>
				<strong>Attention !</strong>
				{(usage_ratio * 100).toFixed(0)}% du stockage disponible de votre navigateur est utilisé.
			</Alert>
		{/if}
	{/await}
{:else}
	<p>
		Aucun certificat dans votre carnet pour le moment. Après avoir scanné un certificat, vous
		pourrez l'ajouter à votre carnet pour y avoir accès ici.
	</p>
{/if}

{#each $wallet as cert}
	{#await parse_any(cert)}
		<Alert color="secondary" fade={false}>Décodage du certificat...</Alert>
	{:then info}
		<div
			class:clickCert={!!$invitedTo.eventId}
			on:click={(_) => {
				if ($invitedTo.eventId) codeFound = cert;
			}}
		>
			<Certificate {info} with_fullscreen={!$invitedTo.eventId} />
		</div>
	{/await}
{/each}

<CodeFound bind:codeFound />

<style>
	.clickCert {
		cursor: pointer;
	}
</style>
