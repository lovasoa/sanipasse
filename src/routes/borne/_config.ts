export interface ConfigProperties {
	decode_after_s: number;
	reset_after_s: number;
	title: string;
	description: string;
	logo_urls: string[];
	bottom_infos: string;
}

export const DEFAULT_CONFIG: ConfigProperties = {
	decode_after_s: 1.0,
	reset_after_s: 4.0,
	title: 'Bienvenue',
	description:
		'Scannez votre passe sanitaire depuis la section “carnets“ de votre application TousAntiCovid ou ' +
		'Sanipasse. Vous pouvez aussi scanner directement le QR code papier qui vous a été remis lors de ' +
		'votre test ou de votre vaccination.',
	logo_urls: [],
	bottom_infos: 'Borne par SAS LED SERVICES; logiciel sanipasse.fr fourni par Ophir Lojkine sous licence AGPLv3.'
};
