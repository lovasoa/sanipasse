<script type="ts">
	import { Icon } from 'sveltestrap';
	import type { Invitees } from '$lib/invitees';
	import { createEventDispatcher } from 'svelte';
	import type { EventWithPeople } from '$lib/event';
	const dispatch = createEventDispatcher<{ remove: string }>();
	let search = '';
	export let invitees: Invitees;
	export let event: EventWithPeople | null = null;
	$: filtered = invitees.filtered(search);
</script>

<h3>Invités</h3>
<div class="input-group mb-3">
	<span class="input-group-text" id="inputGroup-sizing-default">🔎</span>
	<input type="search" class="form-control" placeholder="Nom de l'invité" bind:value={search} />
</div>
{#if search}
	<small>Invités dont le nom comprend "{search}"</small>
{/if}
<ul class="list-group">
	{#each filtered as { key, first_name, last_name, validated, invited } (key)}
		<li
			class="list-group-item "
			class:list-group-item-light={!validated}
			class:list-group-item-warning={validated && !invited}
			class:list-group-item-success={validated && invited}
		>
			<div class="row">
				<div class="col-11">
					{#if !validated}
						<span title="Cet invité n'a pas encore validé de certificat sanitaire">⏳</span>
					{:else if !invited}
						<span title="Cette personne n'était pas invitée">➕</span>
					{:else}
						<span title="Cet invité a validé un certificat sanitaire">✅</span>
					{/if}
					<span class="text-capitalize">{first_name}</span>
					<span class="text-uppercase">{last_name}</span>
					<small>
						Passe sanitaire <strong>{validated ? '' : 'non'} validé</strong>.
						{#if !invited}
							Cette personne s'est enregistrée, mais elle n'était <strong>pas invitée</strong>.
						{/if}
					</small>
				</div>
				<button
					class="col-1 delete"
					title="Supprimer l'invité"
					on:click={dispatch.bind(null, 'remove', key)}
				>
					<Icon name="trash" />
				</button>
			</div>
		</li>
	{:else}
		{#if search}
			<li class="list-group-item fst-italic">Aucun invité dont le nom comprend "{search}"</li>
		{:else}
			<li class="list-group-item">
				<p class="text-center fst-italic">Aucun invité pour le moment</p>
				<p>
					La création d'une liste d'invités à l'avance n'est pas obligatoire. Vous pouvez simplement
					{#if typeof navigator === 'object' && navigator.share && event}
						<button
							class="btn btn-primary btn-sm"
							on:click={() =>
								event &&
								navigator.share({
									title: `${event.name}: Invitation Sanipasse`,
									text:
										`Vous êtes invité à l'événement ${event.name}. ` +
										`Pour participer, merci de bien vouloir valider votre passe sanitaire sur sanipasse.`,
									url: 'https://sanipasse.fr#' + event.public_code
								})}>partager</button
						>
					{:else}
						envoyer
					{/if}
					dès maintenant le lien d'invitation fourni dans la section
					<i>Communiquer auprès de vos invités</i>, et le nom des personnes ayant validé leur
					invitation à l'aide d'un passe sanitaire apparaîtra ici.
				</p>
			</li>
		{/if}
	{/each}
</ul>

<style>
	small {
		font-style: italic;
	}
	li small {
		display: none;
	}
	li:hover small {
		display: inline-block !important;
	}
	li .delete {
		display: none;
	}
	li:hover .delete {
		display: block;
	}
	.delete {
		background: none;
		border: none;
	}
</style>
