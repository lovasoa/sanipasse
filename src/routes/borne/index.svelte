<script lang="ts">
	import Config from './_config.svelte';
	import Scan from './_scan.svelte';
	let start = false;
	let decode_after_s = 1;
	let reset_after_s = 4;
	let place_name = '';
</script>

{#if start}
	<Scan bind:decode_after_s bind:reset_after_s bind:place_name />
{:else}
	<Config bind:start bind:decode_after_s bind:reset_after_s bind:place_name />
{/if}
