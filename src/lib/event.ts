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
