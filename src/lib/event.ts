import base64 from 'base64-js';
import crypto from 'isomorphic-webcrypto';

export interface EventData {
	name: string;
	date: string; // ISO-8601 date string, serializable
}

export interface DBEvent {
	public_code?: string;
	private_code?: string;
	name: string;
	date: Date;
}

export interface EventWithPeople extends DBEvent {
	people: DBPerson[];
}

export interface DBPerson {
	key: string;
	validated: boolean;
	invited?: boolean;
}

export function generateKey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(9));
	return base64.fromByteArray(bytes).replace(/[/]/g, '-').replace(/\+/g, '_');
}
