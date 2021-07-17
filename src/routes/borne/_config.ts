export interface ConfigProperties {
	decode_after_s: number;
	reset_after_s: number;
	place_name: string;
}

export const DEFAULT_CONFIG: ConfigProperties = {
	decode_after_s: 1.0,
	reset_after_s: 4.0,
	place_name: ''
};
