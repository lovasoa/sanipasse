<script lang="ts">
	import { DEFAULT_CONFIG } from './_config';
	import type { ConfigProperties } from './_config';

	import Config from './_config.svelte';
	import Scan from './_scan.svelte';
	let start = false;
	let config: ConfigProperties = DEFAULT_CONFIG;
	let scan_elem: HTMLDivElement | null = null;
	$: if (start && scan_elem) {
		scan_elem.requestFullscreen({ navigationUI: 'hide' });
	}
</script>

{#if start}
	<div
		bind:this={scan_elem}
		style="background:white"
		on:fullscreenchange={() => {
			start = !!document.fullscreenElement;
		}}
	>
		<Scan bind:config />
	</div>
{:else}
	<Config bind:start bind:config />
{/if}
