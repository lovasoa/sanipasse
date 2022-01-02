import SequelizePKG from 'sequelize';
const { Sequelize, STRING, DATE, BOOLEAN, Model } = SequelizePKG;
import { generateKey } from '$lib/random_key';
import type { DBEvent, DBPerson } from '$lib/event';
import { DATABASE_CONNECTION_STRING } from './global_config';

const sequelize = new Sequelize(DATABASE_CONNECTION_STRING);

class Event extends Model<DBEvent> {}
Event.init(
	{
		public_code: {
			type: STRING(9),
			primaryKey: true,
			defaultValue: generateKey
		},
		private_code: {
			type: STRING(9),
			defaultValue: generateKey
		},
		name: STRING,
		date: { type: DATE, allowNull: false }
	},
	{
		sequelize,
		modelName: 'event',
		indexes: [{ unique: true, fields: ['private_code'] }]
	}
);

interface ModelPerson extends DBPerson {
	eventPublicCode: string;
}
class Person extends Model<ModelPerson> {}
Person.init(
	{
		key: { type: STRING, primaryKey: true },
		eventPublicCode: { type: STRING, primaryKey: true },
		validated: { type: BOOLEAN, allowNull: false, defaultValue: false },
		invited: { type: BOOLEAN, allowNull: false, defaultValue: false }
	},
	{
		sequelize,
		modelName: 'person'
	}
);
Event.hasMany(Person, { foreignKey: 'eventPublicCode' });
Person.belongsTo(Event);

export interface DBConfig {
	key: string;
	config: string;
}
class BorneConfig extends Model<DBConfig> {}
BorneConfig.init(
	{
		key: { type: STRING, primaryKey: true },
		config: { type: STRING }
	},
	{
		sequelize,
		modelName: 'config'
	}
);

class ApiKeys extends Model<{ api_key: string; used_at: Date }> {}
ApiKeys.init(
	{
		api_key: { type: STRING, primaryKey: true },
		used_at: { type: DATE, primaryKey: true, allowNull: true }
	},
	{
		sequelize,
		updatedAt: false,
		createdAt: false
	}
);

const sync = sequelize.sync({});
const SyncedEvent = sync.then(() => Event);
const SyncedPerson = sync.then(() => Person);
const SyncedBorneConfig = sync.then(() => BorneConfig);
const SyncedApiKeys = sync.then(() => ApiKeys);

export type AsJson<T> = T extends Date ? Date : { [K in keyof T]: AsJson<T[K]> };

export {
	SyncedEvent as Event,
	SyncedPerson as Person,
	SyncedBorneConfig as BorneConfig,
	SyncedApiKeys as ApiKeys
};
