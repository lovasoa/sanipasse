const localforage = import('localforage'); // Can fail on node

const STATS_GRANULARITY_MILLIS = 3600 * 1000;

/// Data is stored in local storage with the timestamp as a key,
// and an array of [valid, invalid] as value.
type StoredData = [number, number];

export interface StatsDataPoint {
	date: Date;
	valid: number;
	invalid: number;
}

async function instance(): Promise<LocalForage> {
	const storage = await localforage;
	return await storage.default.createInstance({
		name: 'sanipasse_borne_stats'
	});
}

export async function* load_stats(): AsyncGenerator<StatsDataPoint> {
	const collection = await instance();
	const keys = await collection.keys();
	const timestamps = keys.map((key) => parseInt(key));
	timestamps.sort((a, b) => b - a); // More recent data first
	for (const timestamp of timestamps) {
		const elem = await collection.getItem<StoredData>(timestamp.toString());
		if (elem) {
			const [valid, invalid] = elem;
			const date = new Date(timestamp);
			yield { date, valid, invalid };
		}
	}
}

export async function store_statistics_datapoint(is_valid: boolean) {
	const collection = await instance();
	const current_time_bucket =
		((Date.now() / STATS_GRANULARITY_MILLIS) | 0) * STATS_GRANULARITY_MILLIS;
	const key = current_time_bucket.toString();
	const elem = await collection.getItem<StoredData>(key);
	let stats = elem || [0, 0];
	stats[is_valid ? 0 : 1]++;
	await collection.setItem(key, stats);
}
