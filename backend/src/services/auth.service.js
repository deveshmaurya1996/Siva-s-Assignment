import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/db.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error.middleware.js';

const BCRYPT_ROUNDS = 12;

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    created_at: row.created_at,
  };
}

export async function signup({ email, password, name }) {
  const db = await getDb();
  const existing = await db.get(
    'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
    [email]
  );
  if (existing) {
    throw new AppError(409, 'Email already registered', { email: 'Email is already in use' });
  }
  const id = uuidv4();
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db.run(
    `INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'user')`,
    [id, email, password_hash, name]
  );
  const user = await db.get(
    `SELECT id, email, name, role, created_at FROM users WHERE id = ?`,
    [id]
  );
  const token = signToken({ sub: user.id });
  return { token, user: publicUser(user) };
}

export async function login({ email, password }) {
  const db = await getDb();
  const row = await db.get(
    'SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = ? COLLATE NOCASE',
    [email]
  );
  if (!row) {
    throw new AppError(401, 'Invalid email or password');
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    throw new AppError(401, 'Invalid email or password');
  }
  const user = publicUser(row);
  const token = signToken({ sub: user.id });
  return { token, user };
}

export async function getUserById(id) {
  const db = await getDb();
  const row = await db.get(
    `SELECT id, email, name, role, created_at FROM users WHERE id = ?`,
    [id]
  );
  return publicUser(row);
}
