<script lang="ts">
	import {
		load_stats,
		reset_stats,
		STATS_GRANULARITY_MILLIS,
		store_statistics_datapoint
	} from './_stats_storage';
	import type { StatsDataPoint } from './_stats_storage';
	import { onMount } from 'svelte';

	import { load_config } from './_config';
	import StatsChart from './_stats_chart.svelte';

	let datapoints: StatsDataPoint[] = [];
	const config = load_config();

	async function display_stats() {
		datapoints = [];
		for await (const point of load_stats()) {
			datapoints.push(point);
			// Avoid refreshing the UI at each new point
			if (datapoints.length % 256 === 0) datapoints = datapoints;
		}
		datapoints = datapoints;
	}

	onMount(display_stats);

	async function reset() {
		await reset_stats();
		await display_stats();
	}

	async function load_random() {
		for (let i = 0; i < 200; i++) {
			const d0 = Date.now() - STATS_GRANULARITY_MILLIS * 1000;
			const d = new Date(d0 + Math.random() * STATS_GRANULARITY_MILLIS * 1000);
			store_statistics_datapoint(Math.random() > 0.2, d);
		}
		await display_stats();
	}
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
	{#if config.debug}
		<div class="alert alert-info">
			<h3>Mode de débogage activé</h3>
			<p>
				<button class="btn btn-info" on:click={load_random}>Ajouter des données aléatoires</button>
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

<button class="btn btn-danger" on:click={reset}>Réinitialiser les statistiques</button>
