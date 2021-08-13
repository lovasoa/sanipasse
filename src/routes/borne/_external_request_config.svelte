<script lang="ts">
	import type { ExternalRequests } from './_config';

	export let external_requests: ExternalRequests | undefined;
	let r: ExternalRequests;
	$: {
		r = external_requests || {
			accepted: {
				url: '',
				method: 'GET',
				body: ''
			},
			refused: {
				url: '',
				method: 'GET',
				body: ''
			}
		};
		external_requests = r;
	}
	$: requests = [
		{ request: r.accepted, text: 'accepté' },
		{ request: r.refused, text: 'refusé' }
	];
</script>

<p>
	Vous pouvez demander à sanipasse d'envoyer une requête externe lorsqu'un passe est validé ou
	refusé. Cela permet de s'interfacer avec d'autres services ou du matériel comme une porte
	automatique, une ampoule, une imprimante...
</p>

<fieldset class="row">
	{#each requests as { request, text }}
		<h5 class="col-12 mt-2">Lorsqu'un passe est <strong>{text}</strong></h5>

		<label class="col-md-2 col-sm-12">
			Méthode
			<select class="form-select" bind:value={request.method}>
				<option value="GET" selected>GET</option>
				<option value="POST">POST</option>
				<option value="PUT">PUT</option>
				<option value="PATCH">PUT</option>
				<option value="TRACE">TRACE</option>
			</select>
		</label>
		<label class="col-md-10 col-sm-12 mb-3">
			URL à charger après un contrôle <strong>{text}</strong>
			<input
				type="url"
				class="form-control"
				bind:value={request.url}
				placeholder="http://my-external-service/valid-pass-endpoint"
			/>
		</label>
		{#if request.method !== 'GET'}
			<div class="col-12 form-floating font-monospace text-muted">
				<textarea
					class="form-control"
					placeholder="Contents of the request that will be sent to the server"
					id="req{text}"
					style="height: 100px"
				/>
				<label for="req{text}">Request body</label>
			</div>
		{/if}
	{/each}
</fieldset>
