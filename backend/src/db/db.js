import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance = null;

function wrap(db) {
  return {
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    exec(sql) {
      return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  const dbPath =
    process.env.DATABASE_PATH ||
    path.join(process.cwd(), 'data', 'tasks.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const raw = new sqlite3.Database(dbPath);
  dbInstance = wrap(raw);

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  await dbInstance.exec(schema);

  await seedAdminIfNeeded(dbInstance);

  return dbInstance;
}

async function seedAdminIfNeeded(db) {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com')
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123456';
  const existing = await db.get(
    'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
    [email]
  );
  if (existing) return;

  const hash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  await db.run(
    `INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
    [id, email, hash, 'Admin', 'admin']
  );
}
