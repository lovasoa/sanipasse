<script type="ts">
	import { page } from '$app/stores';
	import type { EventWithPeople } from '$lib/event';

	export let event: EventWithPeople;
	let linkCopied = false;
	let linkInput: HTMLInputElement | null = null;

	async function copyLink() {
		if (!linkInput) throw new Error('link <input> element not mounted');
		linkInput.select();
		await navigator.clipboard.writeText(linkInput.value);
		linkCopied = true;
	}
</script>

<h5>Communiquer auprès de vos invités</h5>
<p>Vous pouvez envoyer le lien suivant à vos invités pour leur permettre de s'inscrire :</p>
<div class="input-group input-group-sm mb-3">
	<input
		bind:this={linkInput}
		type="text"
		class="form-control"
		value="http://{$page.url.host}#{event.public_code || '...'}"
	/>
	<button class="input-group-text" title="Copier" on:click={copyLink}>
		{#if !linkCopied}📋
		{:else}Copié !
		{/if}
	</button>
</div>
<p>
	<small>
		Attention, ne confondez pas! Envoyez bien le lien indiqué ci-dessus, et non l'adresse de la page
		actuelle à vos invités. La page actuelle est réservée aux administrateurs de l'évènement.
	</small>
</p>
<h5>Voir les réponses des invités</h5>
<p>
	Les réponses des invités sont affichées <strong>uniquement sur cette page</strong>, dont l'adresse
	est confidentielle et réservée aux administrateurs de l'évènement. Il est conseillé d'ajouter
	cette page aux marque-pages de votre navigateur pour pouvoir y revenir facilement.
</p>
