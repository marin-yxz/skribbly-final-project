exports.up = async (sql) => {
  await sql`CREATE TABLE messages (
    id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		room_id integer REFERENCES rooms (id) ON DELETE CASCADE,
		user_id integer REFERENCES users (id) ON DELETE CASCADE,
		messages TEXT,
		time integer NOT NULL
  )`;
};
exports.down = async (sql) => {
  await sql`
	DROP TABLE messages `;
};
