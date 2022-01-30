<script lang="ts">
	import { main_type_from_filename } from '$lib/file_types';
	import { onDestroy } from 'svelte';

	export let file_urls: string[];
	export let slideshow_interval_ms = 10_000;
	export let style = '';
	export let classes = 'slideshow';

	let active = 0;
	const interval = setInterval(() => {
		active = (active + 1) % file_urls.length;
	}, slideshow_interval_ms);
	onDestroy(() => clearInterval(interval));
</script>

<div {style} class={classes}>
	{#each file_urls as file_url, i}
		{#if main_type_from_filename(file_url) === 'video'}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				muted
				autoplay
				controls={false}
				loop
				src={file_url}
				alt="slideshow video {i} : {file_url}"
				class:active={active === i}
				style="transform: translateY({-100 * i}%);"
			/>
		{:else}
			<img
				src={file_url}
				alt="slideshow image {i} : {file_url}"
				class:active={active === i}
				style="transform: translateY({-100 * i}%);"
			/>
		{/if}
	{/each}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	img,
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 1s;
	}

	.active {
		opacity: 1;
	}
</style>
