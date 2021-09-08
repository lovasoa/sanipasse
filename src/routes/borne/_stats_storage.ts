const localforage = import('localforage'); // Can fail on node

export const STATS_GRANULARITY_MILLIS = 3600 * 1000;

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

export function time_bucket(date: Date = new Date()): number {
	const div = Math.floor(date.getTime() / STATS_GRANULARITY_MILLIS);
	return div * STATS_GRANULARITY_MILLIS;
}

export async function store_statistics_datapoint(is_valid: boolean, date?: Date) {
	const collection = await instance();
	const time = time_bucket(date);
	const key = time.toString();
	const elem = await collection.getItem<StoredData>(key);
	let stats = elem || [0, 0];
	stats[is_valid ? 0 : 1]++;
	await collection.setItem(key, stats);
}

export async function reset_stats() {
	const collection = await instance();
	await collection.dropInstance();
}
