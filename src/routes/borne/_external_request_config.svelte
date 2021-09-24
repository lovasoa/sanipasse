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
<p>
	Si vous voulez contrôler du matériel depuis une système embarqué sous linux (tel qu'un Raspberry
	Pi), vous pouvez utiliser le logiciel
	<a href="https://github.com/lovasoa/http-gpio">http-gpio</a>, développé par le même auteur que
	sanipasse. Voir la <a href="https://youtu.be/cHzeFuuIRIU">vidéo de démonstration</a>.
</p>
<p>
	Vous pouvez aussi envoyer une requête vers n'importe quel serveur HTTP, local ou sur internet,
	mais il est important de faire attention aux éléments suivants:
</p>
<ul>
	<li>
		en tant qu'application web, sanipasse est soumis aux <a
			href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS">règles CORS</a
		>,
	</li>
	<li>
		si sanipasse est servi depuis un serveur sécurisé par https, et que votre service externe n'est
		pas sécurisé, vous devrez ajouter une
		<a
			href="https://www.chromium.org/Home/chromium-security/deprecating-powerful-features-on-insecure-origins"
		>
			exception de sécurité à votre navigateur</a
		>.
	</li>
</ul>
<p>
	Si vous avez besoin de conseil sur l'interfaçage de votre service ou de votre solution matérielle
	avec sanipasse borne, vous pouvez me contacter sur <a
		href="mailto:contact@ophir.dev?subject=conseil interface sanipasse borne">contact@ophir.dev</a
	>.
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
				placeholder="http://my-external-service/passe-{text}"
			/>
		</label>
		{#if request.method !== 'GET'}
			<div class="col-12 form-floating font-monospace text-muted">
				<textarea
					class="form-control"
					placeholder="Contents of the request that will be sent to the server"
					id="req{text}"
					style="height: 100px"
					bind:value={request.body}
				/>
				<label for="req{text}">Request body</label>
			</div>
		{/if}
	{/each}
</fieldset>
