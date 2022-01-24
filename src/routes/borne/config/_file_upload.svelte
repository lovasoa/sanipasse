<script lang="ts">
	import b64 from 'base64-js';
	import { _ } from 'ajv';
	import ShowPromiseError from '../../_showPromiseError.svelte';
	import { sha256 } from '$lib/sha256';
	import { browser } from '$app/env';
	import type { MainType } from '$lib/file_types';
	import {
		extensions_for_types,
		file_of_type,
		get_extension,
		mimes_for_types
	} from '$lib/file_types';

	export let label = 'Fichiers';
	export let file_urls: string[];
	export let allowed_types: MainType[] = ['image', 'video'];

	let fileInput: HTMLInputElement | null = null;

	let loading: Promise<void> = Promise.resolve();

	const file_config: Promise<{ MAX_FILESIZE: number }> = browser
		? fetch('/api/file/config.json').then((r) => r.json())
		: new Promise(() => {});

	async function updateUrls() {
		if (!fileInput) throw new Error('missing file element');
		const { files } = fileInput;
		if (!files || !files.length) throw new Error('No file in input');
		for (const url of Array.from(files).map(file_to_url)) {
			file_urls = [...file_urls, await url];
		}
		if (fileInput) fileInput.value = '';
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
		if (!file_of_type(file.name, allowed_types)) {
			throw (
				`Les fichiers .${get_extension(file.name)} ne sont pas supportés. ` +
				`Veuillez insérer un fichier dans l'un des formats suivants: 
				${extensions_for_types(allowed_types).join(', ')}.`
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

		const path = `/api/file/${hash}.${get_extension(file.name)}`;
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
		const deletions = Promise.all(file_urls.map(deleteFile));
		file_urls = []; // Reset the array even if the deletion failed
		await deletions;
		setTimeout(() => fileInput && (fileInput.value = ''), 0);
	}

	function onerror(e: Event) {
		const details = (e.target instanceof HTMLVideoElement && e.target.error?.message) || '';
		const type =
			e.target instanceof HTMLVideoElement || e.target instanceof HTMLImageElement
				? get_extension(e.target.src)
				: '';
		loading = Promise.reject(new Error(`Impossible de charger le fichier ${type}. ${details}`));
	}
</script>

<div class="row">
	<div class="form-label col-12 mb-0">
		<div class="input-group">
			<label class="input-group-text" for="file_{label}">{label}</label>
			<input
				type="file"
				class="form-control"
				bind:this={fileInput}
				on:change={() => (loading = updateUrls())}
				accept={[...extensions_for_types(allowed_types), ...mimes_for_types(allowed_types)].join(
					','
				)}
				multiple
				id="file_{label}"
			/>
			{#if file_urls.length > 0}
				<button
					type="button"
					class="btn btn-sm btn-outline-danger"
					on:click={() => (loading = resetFiles())}>Supprimer</button
				>
			{/if}
		</div>
	</div>
	<div class="col-12 mb-3">
		<ShowPromiseError promise={loading} />
	</div>
	<div class="col-12 mb-3 d-flex flex-wrap">
		{#each file_urls as url}
			{#if file_of_type(url, ['image'])}
				<img src={url} height="50" alt="image: {label}" class="preview" on:error={onerror} />
			{:else}
				<video
					muted
					src={url}
					controls
					playsinline
					loop
					autoplay
					height="50"
					class="preview"
					alt="video: {label}"
					on:error={onerror}
				/>
			{/if}
		{/each}
	</div>
</div>

<style>
	.preview {
		max-height: 50px;
		border: 1px solid #aaa;
		border-radius: 2px;
		min-width: 25px;
		margin: 5px;
	}
</style>
