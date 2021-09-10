<script lang="ts">
	import { onMount } from 'svelte';
	import { time_bucket, STATS_GRANULARITY_MILLIS } from './_stats_storage';
	import type { StatsDataPoint } from './_stats_storage';
	import type ApexCharts from 'apexcharts';

	export let datapoints: StatsDataPoint[] = [];
	export let show_toolbar = true;

	type Class<T = any> = new (...args: any[]) => T;

	let apex: ApexCharts | null = null;
	let ApexCharts: Class<ApexCharts> | null = null;

	let chart: HTMLDivElement | null = null;

	const MIN_DURATION_MILLIS = STATS_GRANULARITY_MILLIS * 24;

	function compute_datapoints_with_zeroes(datapoints: StatsDataPoint[]): StatsDataPoint[] {
		const end_timestamp = datapoints[0]?.date?.getTime() || time_bucket();
		const start_or_null = datapoints[datapoints.length - 1]?.date?.getTime();
		let start_timestamp = end_timestamp - MIN_DURATION_MILLIS;
		if (start_or_null < start_timestamp) start_timestamp = start_or_null;
		const num_points = (end_timestamp - start_timestamp) / STATS_GRANULARITY_MILLIS;
		const datapoints_with_zeroes = new Array(num_points).fill(null).map((_, i) => ({
			date: new Date(start_timestamp + i * STATS_GRANULARITY_MILLIS),
			valid: 0,
			invalid: 0
		}));
		for (const dp of datapoints) {
			const idx = ((dp.date.getTime() - start_timestamp) / STATS_GRANULARITY_MILLIS) | 0;
			if (idx < 0 || idx > datapoints_with_zeroes.length) continue;
			datapoints_with_zeroes[idx] = dp;
		}
		return datapoints_with_zeroes;
	}
	$: datapoints_with_zeroes = compute_datapoints_with_zeroes(datapoints);
	let series: ApexAxisChartSeries = [];
	$: series = [
		{
			name: 'validés',
			color: '#20c997', // green
			data: datapoints_with_zeroes.map((d) => ({ x: d.date.getTime(), y: d.valid }))
		},
		{
			name: 'refusés',
			color: '#dc3545', // red
			data: datapoints_with_zeroes.map((d) => ({ x: d.date.getTime(), y: d.invalid }))
		}
	];
	const options: ApexCharts.ApexOptions = {
		series: [],
		chart: {
			height: 150,
			type: 'area',
			toolbar: {
				tools: {
					download: show_toolbar
				},
				export: {
					csv: {
						dateFormatter: (d) => (d ? new Date(d).toISOString() : ''),
						filename: 'statistiques_sanipasse.csv',
						columnDelimiter: ';',
						headerCategory: 'date'
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth'
		},
		xaxis: {
			type: 'datetime',
			tooltip: { enabled: false }
		},
		yaxis: {
			labels: {
				formatter(val: number) {
					return val.toFixed(0);
				}
			},
			tooltip: {
				enabled: false
			}
		},
		legend: {
			show: false
		},
		tooltip: {
			x: {
				formatter: (timestamp: number) =>
					new Date(timestamp).toLocaleString('fr-FR', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric'
					})
			}
		}
	};
	$: if (ApexCharts && !apex && series && chart) {
		apex = new ApexCharts(chart, options);
		apex.render();
	}
	$: if (apex) apex.updateSeries(series);

	onMount(async () => {
		ApexCharts = (await import('apexcharts')).default;
		return function unmount() {
			if (apex) apex.destroy();
		};
	});
</script>

<div bind:this={chart} />
