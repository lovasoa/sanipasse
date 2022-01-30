// No dynamic type should be allowed here: no svg

export const main_types = ['image', 'video'] as const;
export type MainType = typeof main_types[number];

export const ALLOWED_FILE_TYPES: Record<string, `${MainType}/${string}`> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	bmp: 'image/bmp',
	gif: 'image/gif',
	webp: 'image/webp',
	mp4: 'video/mp4',
	webm: 'video/webm'
};

export function get_extension(name: string): string {
	const parts = name.split('.');
	return parts[parts.length - 1].toLowerCase();
}

function mime_allowed(mime: string, allowed: MainType[]) {
	return allowed.some((t) => mime.startsWith(t));
}
export function file_of_type(file_name: string, allowed_types: MainType[]): boolean {
	const mime = mime_from_filename(file_name);
	if (!mime) return false;
	return mime_allowed(mime, allowed_types);
}

export function mime_from_filename(filename: string): string | undefined {
	const m = filename.match(/^data:([\w\/\+]+);/);
	return m ? m[1] : ALLOWED_FILE_TYPES[get_extension(filename)];
}

export function main_type_from_filename(filename: string): MainType | undefined {
	const mime = mime_from_filename(filename);
	if (!mime) return undefined;
	const parts = mime.split('/');
	return main_types.find((t) => t == parts[0]);
}

export function extensions_for_types(types: MainType[]): string[] {
	return Object.entries(ALLOWED_FILE_TYPES).flatMap(([ext, typ]) =>
		mime_allowed(typ, types) ? ['.' + ext] : []
	);
}

export function mimes_for_types(types: MainType[]): string[] {
	return Object.entries(ALLOWED_FILE_TYPES).flatMap(([_, typ]) =>
		mime_allowed(typ, types) ? [typ] : []
	);
}
