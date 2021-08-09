<script context="module" type="ts">
	import type { LoadOutput } from '@sveltejs/kit';

	class UnknownErrorType extends Error {
		name = 'Sanipasse unknown error';
	}

	export function load({ error, status }: LoadOutput) {
		return {
			props: {
				error: typeof error === 'object' ? error : new UnknownErrorType(error),
				status: status || 0
			}
		};
	}
</script>

<script type="ts">
	export let error: Error = new Error('missing error');
	export let status: number = 0;
</script>

<div class="alert alert-danger">
	<h1>Erreur {status}</h1>
	<pre>{error.name} : {error.message}</pre>
	<h4>Vous pensez que ceci est un bug dans sanipasse ?</h4>
	<p>
		Vous pouvez <a
			href="https://github.com/lovasoa/sanipasse/issues/new?title=erreur {status}: {encodeURIComponent(
				error.message
			)}&body={encodeURIComponent(
				"Merci de bien vouloir décrire ici votre appareil, votre navigateur, et les circonstances d'apparition du bug.\n\n" +
					'## Informations techniques\n\n' +
					'```\n' +
					JSON.stringify(error, null, 4) +
					'\n```'
			)}">ouvrir un rapport de bug</a
		>.
	</p>
</div>
