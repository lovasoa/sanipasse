<script type="ts">
	import { DEFAULT_CONFIG, load_config } from './_config';
	import Scan from './_scan.svelte';
</script>

{#await load_config()}
	<Scan config={DEFAULT_CONFIG} />
	<p class="w-100">Chargement de la configuration…</p>
{:then config}
	<Scan {config} />
{/await}
