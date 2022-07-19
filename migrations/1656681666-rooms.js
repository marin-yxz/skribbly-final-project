exports.up = async (sql) => {
  await sql`CREATE TABLE rooms (
   id  BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
	name varchar(100) UNIQUE NOT NULL
  )`;
};
exports.down = async (sql) => {
  await sql`
	DROP TABLE rooms `;
};