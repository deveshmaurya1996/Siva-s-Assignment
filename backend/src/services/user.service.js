import { getDb } from '../db/db.js';

export async function listUsersForPicker() {
  const db = await getDb();
  const rows = await db.all(
    `SELECT id, email, name FROM users ORDER BY name COLLATE NOCASE ASC`
  );
  return rows;
}
