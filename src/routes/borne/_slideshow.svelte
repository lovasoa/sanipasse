<script lang="ts">
	import { main_type_from_filename } from '$lib/file_types';

	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	export let file_urls: string[];
	export let slideshow_interval_ms = 10_000;
	export let style = '';
	let active = 0;

	const interval = setInterval(() => {
		active = (active + 1) % file_urls.length;
	}, slideshow_interval_ms);
	onDestroy(() => clearInterval(interval));
</script>

{#each file_urls as file_url, i}
	{#if active === i}
		{#if main_type_from_filename(file_url) === 'video'}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video transition:fade src={file_url} alt="slideshow" {style} />
		{:else}
			<img transition:fade src={file_url} alt="slideshow" {style} />
		{/if}
	{/if}
{/each}
