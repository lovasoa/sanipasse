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
</script>

<p>
	Vous pouvez demander à sanipasse d'envoyer une requête externe lorsqu'un passe est validé ou
	refusé. Cela permet de s'interfacer avec d'autres services ou du matériel comme une porte
	automatique.
</p>
<fieldset class="col-md-12">
	<label class="col-12 mb-3">
		Requête lorsqu'un passe est validé
		<input
			type="url"
			class="form-control"
			bind:value={r.accepted.url}
			placeholder="http://my-external-service/valid-pass-endpoint"
		/>
	</label>
	<label class="col-12 mb-3">
		Requête lorsqu'un passe est refusé
		<input
			type="url"
			class="form-control"
			bind:value={r.refused.url}
			placeholder="http://my-external-service/invalid-pass-endpoint"
		/>
	</label>
</fieldset>
