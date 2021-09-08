<script lang="ts">
	import { onMount } from 'svelte';
	import type { StatsDataPoint } from './_stats_storage';
	import type ApexCharts from 'apexcharts';
	type Class<T = any> = new (...args: any[]) => T;

	let apex: ApexCharts | null = null;
	let ApexCharts: Class<ApexCharts> | null = null;

	let chart: HTMLDivElement | null = null;
	export let datapoints: StatsDataPoint[] = [];
	let series: ApexAxisChartSeries = [];
	$: series = [
		{
			name: 'Validé',
			color: '#20c997', // green
			data: datapoints.map((d) => ({ x: d.date.getTime(), y: d.valid }))
		},
		{
			name: 'Refusé',
			color: '#dc3545', // red
			data: datapoints.map((d) => ({ x: d.date.getTime(), y: d.invalid }))
		}
	];
	const options = {
		series: [],
		chart: {
			height: 150,
			type: 'area'
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth'
		},
		xaxis: {
			type: 'datetime',
			labels: {
				show: false
			}
		},
		yaxis: {
			labels: {
				formatter(val: number) {
					return val.toFixed(0);
				}
			}
		},
		legend: {
			show: false
		},
		tooltip: {
			x: {
				formatter: (timestamp: number) =>
					new Date(timestamp).toLocaleString('fr-FR', {
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
	$: console.log(series);

	onMount(async () => {
		ApexCharts = (await import('apexcharts')).default;
		return function unmount() {
			if (apex) apex.destroy();
		};
	});
</script>

<div bind:this={chart} />
