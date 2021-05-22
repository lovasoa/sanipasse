<script>
	import { parse } from '$lib/2ddoc';
	import Certificate from './_Certificate.svelte';

	import wallet from './_myWalletStore';
</script>

<h3>Mon carnet</h3>

{#each $wallet as cert}
	{#await parse(cert)}
		décodage...
	{:then certificate}
		<Certificate {certificate} with_fullscreen={true} />
	{/await}
{:else}
	<p>
		Aucun certificat dans votre carnet pour le moment. Après avoir scanné un certificat, vous
		pourrez l'ajouter à votre carnet pour y avoir accès ici.
	</p>
{/each}
