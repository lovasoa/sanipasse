import type { DBPerson } from './event';
export type Invitee = DBPerson;
export type Key = string;

export function normalize(str: string, trim = true): string {
	if (trim) str = str.trim();
	return str
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z]/g, ' ')
		.substr(0, 80);
}

export interface Names {
	first_name: string;
	last_name: string;
}
export interface NamedInvitee extends Names, DBPerson {}

export function getKey(i: Names): Key {
	return `${normalize(i.first_name)}|${normalize(i.last_name)}`;
}

export function parseKey(k: Key): { first_name: string; last_name: string } {
	const [first_name, last_name] = k.split('|', 2);
	return { first_name, last_name };
}

export class Invitees {
	map: Map<Key, DBPerson>;
	constructor() {
		this.map = new Map();
	}
	add(i: DBPerson): Invitees {
		this.map.set(i.key, i);
		return this;
	}
	invite(i: Names): Invitees {
		return this.add({
			key: getKey(i),
			invited: true,
			validated: false
		});
	}
	delete(key: Key): Invitees {
		this.map.delete(key);
		return this;
	}
	filtered(search: string): NamedInvitee[] {
		const search_terms = search.split(/\s+/).map((term) => term.toLocaleLowerCase());
		const result: NamedInvitee[] = [];
		for (const [key, person] of this.map) {
			const names = parseKey(key);
			if (
				!search_terms.length ||
				search_terms.some(
					(term) =>
						names.first_name.toLowerCase().includes(term) ||
						names.last_name.toLowerCase().includes(term)
				)
			)
				result.push({ ...names, ...person });
		}
		return result.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
	}
}
