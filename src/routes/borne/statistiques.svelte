<script lang="ts">
	import { load_stats } from './_stats_storage';
	import type { StatsDataPoint } from './_stats_storage';
	import { onMount } from 'svelte';

	import { load_config } from './_config';
	import StatsChart from './_stats_chart.svelte';

	let datapoints: StatsDataPoint[] = [];
	const config = load_config();

	onMount(async () => {
		for await (const point of load_stats()) {
			datapoints = [...datapoints, point];
		}
	});
</script>

{#await config then config}
	{#if !config.store_statistics}
		<div class="alert alert-danger">
			<h3>Les statistiques sont désactivées</h3>
			<p>
				L'enregistrement des statistiques est désactivé dans la configuration locale de cet
				appareil. Vous pouvez l'activer depuis <a href="config">la page de configuration</a>.
			</p>
		</div>
	{/if}
{/await}

<StatsChart {datapoints} />
<table class="table">
	<colgroup>
		<col span="1" style="width: 40%;" />
		<col span="1" style="width: 30%;" />
		<col span="1" style="width: 15%;" />
		<col span="1" style="width: 15%;" />
	</colgroup>
	<thead>
		<tr>
			<th scope="col">Date</th>
			<th scope="col">Heure</th>
			<th scope="col" class="text-center">Passes validés</th>
			<th scope="col" class="text-center">Passes refusés</th>
		</tr>
	</thead>
	<tbody>
		{#each datapoints as { date, valid, invalid } (date)}
			<tr>
				<th scope="row"
					>{date.toLocaleString('fr-FR', {
						weekday: 'long',
						month: 'long',
						day: 'numeric'
					})}</th
				>
				<th scope="row"
					>{date.toLocaleString('fr-FR', {
						hour: 'numeric',
						minute: 'numeric'
					})}</th
				>
				<td class="text-center {valid > 0 ? 'text-success' : 'text-muted'}">{valid}</td>
				<td class="text-center  {invalid > 0 ? 'text-danger' : 'text-muted'}">{invalid}</td>
			</tr>
		{:else}
			<tr>
				<td colspan="3">Aucune statistique disponible</td>
			</tr>
		{/each}
	</tbody>
</table>
