import { verifyToken } from '../utils/jwt.js';
import { AppError } from './error.middleware.js';
import { getDb } from '../db/db.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required');
    }
    const token = header.slice(7);
    const decoded = verifyToken(token);
    if (!decoded.sub) {
      throw new AppError(401, 'Invalid token payload');
    }
    const db = await getDb();
    const user = await db.get(
      `SELECT id, email, name, role, created_at FROM users WHERE id = ?`,
      [decoded.sub]
    );
    if (!user) {
      throw new AppError(401, 'User not found');
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
}
