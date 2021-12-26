<script type="ts">
	import ShowPromiseError from '../../_showPromiseError.svelte';
	import { TabContent, TabPane } from 'sveltestrap';
	import TechnicalParams from './config.svelte';
	import { load_config } from './_config_storage';

	let configKey: string = '';
	if (typeof window === 'object') configKey = new URLSearchParams(location.search).get('key') || '';
	let config_promise = load_config();
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
		>
	</p>
	<p>
		La configuration est modifiable uniquement à partir de la page actuelle, dont vous pouvez
		partager l'adresse avec vos collaborateurs.
	</p>
{:else}
	<p>
		<i>Sanipasse borne</i> est un logiciel libre et gratuit à installer sur une borne de contrôle automatique
		des pass sanitaires.
	</p>
	<p>
		Cette page vous permet de configurer l'interface de scan et de contrôle des passes. Une fois sur
		la page de scan, il vous faudra soit un lecteur physique de QR code, soit une webcam pour lire
		les passes sanitaires.
	</p>
{/if}

<TabContent>
	<TabPane tabId="advanced" tab="Paramètres techniques" active>
		<TechnicalParams />
	</TabPane>
	<TabPane tabId="simple" tab="Affichage">
		<h2>Bravo</h2>
		<img
			alt="Johnny Bravo"
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"
		/>
	</TabPane>
</TabContent>
