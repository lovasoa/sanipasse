import { writable } from 'svelte/store';
import { get_from_local_store, store_locally } from '$lib/storage';

const WALLET_STORE_KEY = 'wallet';

async function walletSet(value: string[]) {
	await store_locally(WALLET_STORE_KEY, value);
}

async function walletGet(): Promise<string[]> {
	return (await get_from_local_store<string[]>(WALLET_STORE_KEY)) || [];
}

function createWalletStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	walletGet().then((w) => set(w));
	return {
		subscribe,
		add: (cert: string) => {
			update((wallet) => {
				const newWallet = [...wallet, cert];
				walletSet(newWallet);
				return newWallet;
			});
		},
		remove: (cert: string) => {
			update((wallet) => {
				const newWallet = wallet.filter((c) => c !== cert);
				walletSet(newWallet);
				return newWallet;
			});
		},
		favorite: (cert: string) => {
			update((wallet) => {
				const newWallet = [cert, ...wallet.filter((c) => c !== cert)];
				walletSet(newWallet);
				return newWallet;
			});
		}
	};
}

const wallet = createWalletStore();
export default wallet;
