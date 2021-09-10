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
	custom_css?: string;
	video_facing_mode?: string;
	external_requests?: ExternalRequests;
	anonymize?: boolean;
	// For backwards compatibility, a missing sound is interpreted the default sound,
	// whereas a sound explicitly set to null is interpreted as no sound.
	sound_valid?: string | null;
	sound_invalid?: string | null;
	// Whether to store statistics about the validated and invalidated scans
	store_statistics?: boolean;
	// Whether to show the statistics on the scan page
	show_statistics_on_scan?: boolean;
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
	video_scan: true,
	store_statistics: true
};
