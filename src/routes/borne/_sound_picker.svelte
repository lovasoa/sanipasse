<script lang="ts">
	import { assets } from '$app/paths';

	export let label = '';
	export let sounds: { name: string; asset: string | undefined | null }[] = [];
	export let selected_sound: string | undefined | null;
	export let sound_on_undefined: string;
	let audio: HTMLAudioElement | null = null;

	async function play_selected() {
		setTimeout(async () => {
			if (!audio || selected_sound === null) return;
			audio.play();
		}, 10);
	}
</script>

<label class="col-6">
	{label}
	<select
		class="form-select"
		aria-label={label}
		bind:value={selected_sound}
		on:change={play_selected}
	>
		{#each sounds as { asset, name }}
			<option value={asset}>{name}</option>
		{/each}
	</select>

	{#if selected_sound !== null}
		<!-- svelte-ignore a11y-media-has-caption -->
		<audio bind:this={audio} src="{assets}/{selected_sound || sound_on_undefined}" />
	{/if}
</label>
