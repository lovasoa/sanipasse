<script lang="ts">
	import b64 from 'base64-js';
	import { _ } from 'ajv';
	import ShowPromiseError from '../../_showPromiseError.svelte';
	import { sha256 } from '$lib/sha256';
	import { page } from '$app/stores';

	export let label = 'Fichiers';
	export let file_urls: string[];
	export let allowed_types = ['image', 'video'];

	let fileInput: HTMLInputElement | null = null;

	let loading: Promise<void> = Promise.resolve();

	const file_config: Promise<{
		ALLOWED_FILE_TYPES: Record<string, string>;
		MAX_FILESIZE: number;
	}> = fetch($page.url.origin + '/api/file/config.json').then((r) => r.json());

	let extension_types = new Map();

	file_config.then(({ ALLOWED_FILE_TYPES }) => {
		extension_types = new Map(
			Object.entries(ALLOWED_FILE_TYPES).filter(([_, type]) =>
				allowed_types.some((t) => type.startsWith(t))
			)
		);
	});

	async function updateLogosUrls() {
		if (!fileInput) throw new Error('missing file element');
		const { files } = fileInput;
		if (!files || !files.length) throw new Error('No file in input');
		await resetFiles();
		file_urls = [];
		for (const url of Array.from(files).map(file_to_url)) {
			file_urls = [...file_urls, await url];
		}
	}

	async function file_to_url(file: File): Promise<string> {
		const { MAX_FILESIZE } = await file_config;
		if (file.size > MAX_FILESIZE)
			throw `Les fichiers de plus de ${(MAX_FILESIZE / 1e6).toFixed(1)} Mo ne sont pas autorisés.`;
		// Inline small files as data URLs
		return file.size < 10_000 ? file_to_data_url(file) : upload_file_and_return_url(file);
	}

	async function file_to_data_url(file: File): Promise<string> {
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		return `data:${file.type};base64,${b64.fromByteArray(bytes)}`;
	}

	async function upload_file_and_return_url(file: File): Promise<string> {
		const parts = file.name.split('.');
		const extension = parts[parts.length - 1].toLowerCase();
		if (!extension_types.has(extension)) {
			throw (
				`Les fichiers .${extension} ne sont pas supportés. ` +
				`Veuillez insérer un fichier dans l'en des formats suivants: ${[
					...extension_types.keys()
				].join(', ')}`
			);
		}
		const start_bytes = file.slice(0, 100);
		const middle_bytes = file.slice(file.size / 2 - 100, file.size / 2 + 100);
		const end_bytes = file.slice(file.size - 100, file.size);
		const hash_key = [
			file.name,
			file.lastModified,
			file.type,
			file.size,
			await start_bytes.text(),
			await middle_bytes.text(),
			await end_bytes.text()
		].join('\t');
		const hash = await sha256(hash_key);

		const path = `/api/file/${hash}.${extension}`;
		const result = await fetch(path, {
			method: 'PUT',
			body: file
		});
		if (!result.ok) throw await result.text();
		return path;
	}

	async function deleteFile(url: string) {
		if (!url.startsWith('/api/file')) return;
		const result = await fetch(url, {
			method: 'DELETE'
		});
		if (!result.ok) throw `Erreur lors de la suppression d'un fichier.`;
	}

	async function resetFiles() {
		await Promise.all(file_urls.map(deleteFile));
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
				accept={[...extension_types.entries()].flatMap(([ext, typ]) => ['.' + ext, typ]).join(',')}
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
			<button
				type="button"
				class="btn btn-sm btn-outline-danger"
				on:click={() => (loading = resetFiles())}>Supprimer</button
			>
		{/if}
	</div>
</div>
