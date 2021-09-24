import { create_storage_instance } from '$lib/storage';

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
	return await create_storage_instance('sanipasse_borne_stats');
}

const END_OF_TIME = new Date(2100, 1, 1).getTime();

/**
 * Create keys so that more recent items come first.
 */
function timestamp_to_key(timestamp: number): string {
	const dt = END_OF_TIME - timestamp;
	return dt.toString(36).padStart(8, '0');
}
function key_to_timestamp(key: string): number {
	return END_OF_TIME - parseInt(key, 36);
}

async function* callback_to_iterator<T>(
	fetch_items: (addItem: (item: T) => void, stop: () => void) => void
): AsyncGenerator<T> {
	let resolve: (item: T) => void = () => void 0;
	let error: () => void = () => void 0;
	let nextItem: Promise<T> = new Promise(() => {});
	function makeNewPromise() {
		nextItem = new Promise<T>((r, e) => {
			resolve = r;
			error = e;
		});
	}
	fetch_items(
		function addItem(item) {
			resolve(item);
			makeNewPromise();
		},
		function stop() {
			error();
			makeNewPromise();
		}
	);
	makeNewPromise();
	while (true) {
		try {
			yield await nextItem;
		} catch (_) {
			return;
		}
	}
}

export async function* load_stats(): AsyncGenerator<StatsDataPoint> {
	const collection = await instance();
	yield* callback_to_iterator((addItem, stop) => {
		collection.iterate(([valid, invalid]: StoredData, key) => {
			const date = new Date(key_to_timestamp(key));
			addItem({ date, valid, invalid });
		}, stop);
	});
}

export function time_bucket(date: Date = new Date()): number {
	const div = Math.floor(date.getTime() / STATS_GRANULARITY_MILLIS);
	return div * STATS_GRANULARITY_MILLIS;
}

export async function store_statistics_datapoint(is_valid: boolean, date?: Date) {
	const collection = await instance();
	const time = time_bucket(date);
	const key = timestamp_to_key(time);
	const elem = await collection.getItem<StoredData>(key);
	let stats = elem || [0, 0];
	stats[is_valid ? 0 : 1]++;
	await collection.setItem(key, stats);
}

export async function reset_stats() {
	const collection = await instance();
	await collection.dropInstance();
}
