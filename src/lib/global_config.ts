// Where to persist data
export const DATA_FOLDER = process.env['DATA_FOLDER'] || '.';
// How to connect to the database
export const DATABASE_CONNECTION_STRING =
	process.env['DATABASE_CONNECTION_STRING'] || `sqlite:${DATA_FOLDER}/sanipasse.db`;
// Maximum file size
export const MAX_FILESIZE = Number(process.env['MAX_FILESIZE'] || 500_000);
