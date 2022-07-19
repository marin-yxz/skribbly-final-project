exports.up = async (sql) => {
  await sql`CREATE TABLE user_room (
    id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		user_id integer UNIQUE  REFERENCES users(id)  ON DELETE CASCADE,
		room_id integer  REFERENCES rooms(id) ON DELETE CASCADE,
    socket_id varchar(50) not NULL,
    time TIMESTAMP NOT NULL
  )`;
  // UNIQUE
};
exports.down = async (sql) => {
  await sql`
	DROP TABLE user_room `;
};