<script lang="ts">
	import b64 from 'base64-js';
	import { ALLOWED_FILE_TYPES, MAX_FILESIZE } from '$lib/global_config';
	import { _ } from 'ajv';

	export let label = 'Fichiers';
	export let file_urls: string[];
	export let allowed_types = ['image', 'video'];

	let fileInput: HTMLInputElement | null = null;
	async function updateLogosUrls() {
		if (!fileInput) throw new Error('missing file element');
		const { files } = fileInput;
		if (!files || !files.length) throw new Error('No file in input');
		const files_buffers = Array.from(files).map((file) => ({
			file,
			arrayBuffer: file.arrayBuffer()
		}));
		if (files_buffers.some((x) => x.file.size > MAX_FILESIZE)) {
			alert(`Les fichiers de plus de ${(MAX_FILESIZE / 1e6).toFixed(1)} Mo ne sont pas autorisés.`);
			return resetFiles();
		}
		file_urls = [];
		for (const { file, arrayBuffer } of files_buffers) {
			const buffer = await arrayBuffer;
			const bytes = new Uint8Array(buffer);
			const url = `data:${file.type};base64,${b64.fromByteArray(bytes)}`;
			file_urls.push(url);
			file_urls = file_urls; // refresh
		}
	}
	function resetFiles() {
		file_urls = [];
		if (fileInput) fileInput.value = '';
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
				on:change={updateLogosUrls}
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
