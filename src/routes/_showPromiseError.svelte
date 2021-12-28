<script type="ts">
	export let promise: Promise<unknown> | null;
</script>

{#await promise}
	<div class="alert alert-info mt-4 row" role="alert">
		<div class="spinner-border text-primary col-3 col-md-4" role="status" />
		<div class="col-9 col-md-8">⏱ Chargement...</div>
	</div>
{:catch e}
	<div class="alert alert-danger mt-4" role="alert">
		<h5>⚠️ Erreur</h5>
		<pre><code>{e.message || e}</code></pre>
	</div>
{/await}

<style>
	.alert {
		max-height: 10em;
		overflow-y: hidden;
		transition: 0.2s;
	}
	.alert:hover {
		max-height: 25em;
		overflow-y: auto;
	}
</style>
