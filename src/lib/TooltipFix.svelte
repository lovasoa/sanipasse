<script lang="ts">
	// https://github.com/bestguy/sveltestrap/issues/414
	import { Tooltip } from 'sveltestrap';

	let target: HTMLElement | null = null;
</script>

<span bind:this={target}><slot name="target" /></span>
{#if target}
	<Tooltip {target}><slot /></Tooltip>
{/if}
