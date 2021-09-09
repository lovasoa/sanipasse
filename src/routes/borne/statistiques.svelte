<script lang="ts">
	import {
		load_stats,
		reset_stats,
		STATS_GRANULARITY_MILLIS,
		store_statistics_datapoint
	} from './_stats_storage';
	import type { StatsDataPoint } from './_stats_storage';
	import { onMount } from 'svelte';

	import { load_config } from './_config_storage';
	import StatsChart from './_stats_chart.svelte';

	export let with_interactions = true;

	interface ShowPoint {
		timestamp: number;
		show_date?: { name: string; rowspan: number };
		show_time: string;
		valid: number;
		invalid: number;
	}

	let datapoints: StatsDataPoint[] = [];
	$: show_datapoints = compute_show_datapoints(datapoints);
	const config = load_config();

	function compute_show_datapoints(datapoints: StatsDataPoint[]): ShowPoint[] {
		let current_date = { name: '', rowspan: 0 };
		return datapoints.map(({ date, valid, invalid }) => {
			const timestamp = date.getTime();
			const name = date.toLocaleDateString('fr-FR', {
				weekday: 'long',
				month: 'long',
				day: 'numeric'
			});
			let show_date = undefined;
			if (name === current_date.name) {
				current_date.rowspan++;
			} else {
				show_date = current_date = { name, rowspan: 1 };
			}
			const show_time = date.toLocaleTimeString('fr-FR', {
				hour: 'numeric',
				minute: 'numeric'
			});
			return { timestamp, show_time, valid, invalid, show_date };
		});
	}

	async function display_stats() {
		datapoints = [];
		let last_update = 0;
		for await (const point of load_stats()) {
			datapoints.push(point);
			// Avoid refreshing the UI at each new point
			if (Date.now() - last_update > 250) {
				datapoints = datapoints;
				last_update = Date.now();
			}
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

<StatsChart {datapoints} show_toolbar={!with_interactions} />
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
		{#each show_datapoints as { timestamp, show_date, show_time, valid, invalid } (timestamp)}
			<tr>
				{#if show_date}
					<th scope="row" class="sticky-top bg-white" rowspan={show_date.rowspan}
						>{show_date.name}</th
					>
				{/if}
				<th scope="row">{show_time}</th>
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

{#if with_interactions}
	<button class="btn btn-danger my-4" on:click={reset}>Réinitialiser les statistiques</button>
{/if}

<style>
	th {
		z-index: -1;
	}
</style>
