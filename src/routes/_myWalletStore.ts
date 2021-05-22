
import { writable } from 'svelte/store';

const localforage = import("localforage"); // Can fail on node

async function walletSet(value: string[]) {
    if (typeof window !== "object") return;
    await (await localforage).setItem("wallet", value);
}

async function walletGet(): Promise<string[]> {
    if (typeof window !== "object") return []; // Browser-only
    return await (await localforage).getItem("wallet") || []
}

function createWalletStore() {
    const { subscribe, set, update } = writable<string[]>([]);

    walletGet().then(w => set(w));
    return {
        subscribe,
        add: (cert: string) => {
            update(wallet => {
                const newWallet = [...wallet, cert];
                walletSet(newWallet);
                return newWallet
            })
        },
        remove: (cert: string) => {
            update(wallet => {
                const newWallet = wallet.filter(c => c !== cert);
                walletSet(newWallet);
                return newWallet
            })
        },
    };
}

const wallet = createWalletStore();
export default wallet;