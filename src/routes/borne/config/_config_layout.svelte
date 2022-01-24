<script type="ts">
	import ShowPromiseError from '../../_showPromiseError.svelte';
	import { TabContent, TabPane } from 'sveltestrap';
	import TechnicalParams from './_tab_technical.svelte';
	import {
		load_config as load_config_local_storage,
		load_config_from_key,
		save_config
	} from './_config_storage';
	import { generateKey } from '$lib/random_key';
	import { put } from '$lib/http';
	import { goto } from '$app/navigation';
	import { DEFAULT_CONFIG } from './_config';
	import TabDisplay from './_tab_display.svelte';

	let configKey: string = '';
	if (typeof window === 'object') configKey = new URLSearchParams(location.search).get('key') || '';

	let config = DEFAULT_CONFIG;
	let config_promise = load_config();

	config_promise.then((data) => (config = data));
	let loading = false;

	async function load_config() {
		if (configKey) return load_config_from_key(configKey);
		else return load_config_local_storage();
	}

	async function uploadConfig() {
		if (!configKey) configKey = generateKey();
		uploadConfigPromise = put(`/api/borne/${configKey}`, config);
		await uploadConfigPromise;
		await goto(`/borne/config?key=${configKey}`);
	}

	let uploadConfigPromise: Promise<unknown> | null = null;
	export let with_technical = true;
</script>

<svelte:head>
	<title>Borne de contrôle du passe sanitaire Sanipasse</title>
	<meta
		name="description"
		content="Sanipasse est un logiciel libre et gratuit qui fournit une interface de scan automatisé des passes sanitaires."
	/>
</svelte:head>

<ShowPromiseError promise={config_promise} />

<h1>Configuration de l'interface de validation des passes <i>Sanipasse borne</i></h1>

{#if configKey}
	<p>
		Cette configuration est utilisable depuis n'importe quel appareil en chargeant l'adresse
		suivante :
		<a href="/borne?key={configKey}" class="font-monospace"
			>{typeof window === 'object' ? window.location.host : 'sanipasse.fr'}/borne?key={configKey}</a
		>.
	</p>
	{#if with_technical}
		<p>
			La configuration complète est modifiable à partir de
			<a href="/borne/config?key={configKey}">l'URL de la page actuelle</a>. Une
			<a href="/borne/config/simple?key={configKey}">URL de configuration simplifiée</a>, ne donnant
			accès qu'aux paramètres d'affichage est également disponible.
		</p>
	{/if}
{:else}
	<p>
		<i>Sanipasse borne</i> est un logiciel libre et gratuit à installer sur une borne de contrôle automatique
		des pass sanitaires.
	</p>
	<p>
		Cette page vous permet de configurer l'interface de scan et de contrôle des passes. Une fois sur
		la page de scan, il vous faudra soit
		<a class="link-dark" href="/borne/config/lecteur-physique">un lecteur physique de QR code</a>,
		soit une webcam pour lire les passes sanitaires.
	</p>
{/if}

<form
	class="row g-3 my-3"
	on:submit|preventDefault={async () => {
		loading = true;
		console.log(config);
		await save_config(config);
		await goto('/borne');
		loading = false;
	}}
>
	{#if with_technical}
		<TabContent>
			<TabPane tabId="simple" tab="Affichage" active>
				<TabDisplay bind:config />
			</TabPane>
			<TabPane tabId="advanced" tab="Paramètres techniques">
				<TechnicalParams bind:config />
			</TabPane>
		</TabContent>
	{:else}
		<TabDisplay bind:config />
	{/if}

	<ShowPromiseError promise={uploadConfigPromise} />

	<button
		class="btn col-md-5 mt-6 mx-2"
		disabled={loading}
		class:btn-primary={configKey}
		class:btn-outline-primary={!configKey}
		on:click|preventDefault={uploadConfig}
		title="Enregistrer ces paramètres sur le serveur de sanipasse pour pouvoir y accéder depuis un autre appareil"
		>Sauvegarder ces paramètres en ligne</button
	>
	<input
		type="submit"
		class="btn btn-primary col-md-5 mt-6 mx-2"
		class:btn-primary={!configKey}
		class:btn-outline-primary={configKey}
		disabled={loading}
		title="Sauvegarder les paramètres localement sur ce navigateur, et lancer l'interface de contrôle des passes sanitaires avec cette configuration"
		value={loading ? 'Chargement' : "Lancer l'interface de scan localement"}
	/>
</form>
