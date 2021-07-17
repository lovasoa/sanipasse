<script lang="ts">
	import { DEFAULT_CONFIG } from './_config';
	import type { ConfigProperties } from './_config';

	import Config from './_config.svelte';
	import Scan from './_scan.svelte';
	let start = false;
	let config: ConfigProperties = DEFAULT_CONFIG;
</script>

{#if start}
	<Scan bind:config />
{:else}
	<Config bind:start bind:config />
{/if}
