const localforage = import('localforage'); // Can fail on node

export interface HTTPRequest {
	method: string;
	url: string;
	body: string;
}

export interface ExternalRequests {
	accepted: HTTPRequest;
	refused: HTTPRequest;
}

export interface ConfigProperties {
	decode_after_s: number;
	reset_after_s: number;
	title: string;
	description: string;
	logo_urls: string[];
	bottom_infos: string;
	debug: boolean;
	prevent_revalidation_before_minutes?: number;
	/// If false, get the QR code from the keyboard
	video_scan?: boolean;
	font?: string;
	font_size?: number;
	video_facing_mode?: string;
	external_requests?: ExternalRequests;
	anonymize?: boolean;
}

export const DEFAULT_CONFIG: ConfigProperties = {
	decode_after_s: 0.5,
	reset_after_s: 4.0,
	debug: false,
	title: 'Bienvenue',
	description:
		'Scannez votre passe sanitaire depuis la section “carnets“ de votre application TousAntiCovid ou ' +
		'Sanipasse. Vous pouvez aussi scanner directement le QR code papier qui vous a été remis lors de ' +
		'votre test ou de votre vaccination.',
	logo_urls: [],
	bottom_infos: 'logiciel sanipasse.fr fourni par Ophir Lojkine sous licence AGPLv3.',
	anonymize: false,
	prevent_revalidation_before_minutes: 0,
	video_scan: true
};

const STORAGE_KEY = 'borne_config';

export async function save_config(config: ConfigProperties) {
	if (typeof window !== 'object') return;
	await (await localforage).setItem(STORAGE_KEY, config);
}

export async function load_config(): Promise<ConfigProperties> {
	if (typeof window !== 'object') return DEFAULT_CONFIG;
	try {
		const config = await (await localforage).getItem(STORAGE_KEY);
		return (config as ConfigProperties) || DEFAULT_CONFIG;
	} catch (e) {
		console.error('Unable to load config', e);
		return DEFAULT_CONFIG;
	}
}
