<script lang="ts">
	import { parse } from '$lib/2ddoc';
	import Certificate from './_Certificate.svelte';
	import CodeFound from './_CodeFound.svelte';

	import invitedTo from './_invitedToStore';
	import wallet from './_myWalletStore';

	let codeFound: string | undefined = undefined;
</script>

<h3>Mon carnet</h3>

{#if $invitedTo.eventId}
	<p>
		Pour valider votre participation à l'événement <i>{$invitedTo.event?.name || ''}</i> avec l'un des
		certificats ci-dessous, cliquez simplement dessus.
	</p>
{/if}

{#each $wallet as cert}
	{#await parse(cert)}
		décodage...
	{:then certificate}
		<div
			class:clickCert={!!$invitedTo.eventId}
			on:click={(_) => {
				if ($invitedTo.eventId) codeFound = cert;
			}}
		>
			<Certificate {certificate} with_fullscreen={!$invitedTo.eventId} />
		</div>
	{/await}
{:else}
	<p>
		Aucun certificat dans votre carnet pour le moment. Après avoir scanné un certificat, vous
		pourrez l'ajouter à votre carnet pour y avoir accès ici.
	</p>
{/each}

<CodeFound bind:codeFound />

<style>
	.clickCert {
		cursor: pointer;
	}
</style>
