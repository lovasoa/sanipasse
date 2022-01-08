<script lang="ts">
	import b64 from 'base64-js';
	import { ALLOWED_FILE_TYPES, MAX_FILESIZE } from '$lib/global_config';
	import { _ } from 'ajv';
	import ShowPromiseError from '../../_showPromiseError.svelte';

	export let label = 'Fichiers';
	export let file_urls: string[];
	export let allowed_types = ['image', 'video'];

	let fileInput: HTMLInputElement | null = null;

	let loading: Promise<void> = Promise.resolve();

	async function updateLogosUrls() {
		if (!fileInput) throw new Error('missing file element');
		const { files } = fileInput;
		if (!files || !files.length) throw new Error('No file in input');
		resetFiles();
		file_urls = [];
		for (const url of Array.from(files).map(file_to_url)) {
			file_urls = [...file_urls, await url];
		}
	}

	async function file_to_url(file: File): Promise<string> {
		if (file.size > MAX_FILESIZE)
			throw `Les fichiers de plus de ${(MAX_FILESIZE / 1e6).toFixed(1)} Mo ne sont pas autorisés.`;
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		return `data:${file.type};base64,${b64.fromByteArray(bytes)}`;
	}

	function resetFiles() {
		file_urls = [];
		setTimeout(() => fileInput && (fileInput.value = ''), 0);
	}
</script>

<div class="row">
	<div class="form-label col-12 mb-0">
		<div class="input-group">
			<label class="input-group-text" for="bgimage">{label}</label>
			<input
				type="file"
				class="form-control"
				bind:this={fileInput}
				on:change={() => (loading = updateLogosUrls())}
				accept={Object.entries(ALLOWED_FILE_TYPES)
					.flatMap(([extension, type]) =>
						allowed_types.some((t) => type.startsWith(t)) ? ['.' + extension, type] : []
					)
					.join(',')}
				multiple
				id="bgimage"
			/>
		</div>
	</div>
	<div class="col-12 mb-3">
		<ShowPromiseError promise={loading} />
	</div>
	<div class="col-12 mb-3">
		{#each file_urls as url}
			<img alt="logo" src={url} class="m-1" style="max-height: 3em" />
		{/each}
		{#if file_urls.length > 0}
			<button type="button" class="btn btn-sm btn-outline-danger" on:click={resetFiles}
				>Supprimer</button
			>
		{/if}
	</div>
</div>
