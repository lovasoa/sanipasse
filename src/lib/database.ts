import SequelizePKG from 'sequelize';
const { Sequelize, STRING, DATE, BOOLEAN, Model } = SequelizePKG;
import { generateKey } from '$lib/random_key';
import type { DBEvent, DBPerson } from '$lib/event';

const DATABASE_CONNECTION_STRING =
	process.env['DATABASE_CONNECTION_STRING'] || 'sqlite:sanipasse.db';
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

const sync = sequelize.sync({});
const SyncedEvent = sync.then(() => Event);
const SyncedPerson = sync.then(() => Person);
const SyncedBorneConfig = sync.then(() => BorneConfig);

export { SyncedEvent as Event, SyncedPerson as Person, SyncedBorneConfig as BorneConfig };
