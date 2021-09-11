import type { EndpointOutput } from '@sveltejs/kit';
import { Event, Person } from '$lib/database';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';
import type { DBPerson } from '$lib/event';
import { getKey, parseKey } from '$lib/invitees';

export async function put({
	body,
	params: { private_code }
}: {
	body: DBPerson;
	params: { private_code: string };
}): Promise<EndpointOutput> {
	const P = await Person;
	const E = await Event;
	const names = parseKey(body.key);
	console.log(`Inviting ${names.first_name} ${names.last_name} to event ${private_code}`);
	const key = getKey(names);
	const people_table = P.sequelize?.escape(P.tableName);
	const events_table = P.sequelize?.escape(E.tableName);
	const query = P.sequelize?.query(
		`INSERT INTO ${people_table} (key, invited, eventPublicCode, createdAt, updatedAt) ` +
			`SELECT $key as key, true AS invited, public_code AS eventPublicCode, $now AS createdAt, $now AS updatedAt ` +
			`FROM ${events_table} WHERE private_code = $private_code`,
		{
			bind: { private_code, key, now: new Date().toISOString() },
			type: 'INSERT'
		}
	);

	try {
		return {
			status: 201, //created
			body: (await query) as JSONValue
		};
	} catch (error) {
		return error.name === 'SequelizeUniqueConstraintError'
			? { status: 409, body: `${names.first_name} ${names.last_name} est déjà invité` }
			: { status: 500, body: `${error?.message}` };
	}
}

export async function del({
	body,
	params: { private_code }
}: {
	body: DBPerson;
	params: { private_code: string };
}): Promise<EndpointOutput> {
	const key = getKey(parseKey(body.key));
	type Await<T> = T extends Promise<infer U> ? U : T;
	const found = (await (await Event).findOne({
		where: { private_code },
		include: { model: await Person, where: { key } }
	})) as { people: Await<typeof Person>[] } | null;
	if (!found) return { status: 404 };
	for (const p of found.people) await p.destroy();
	return { status: 204 }; // No content
}
