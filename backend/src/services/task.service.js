import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/db.js';
import { AppError } from '../middleware/error.middleware.js';

const SORT_SQL = {
  title: 't.title',
  status: 't.status',
  priority: 't.priority',
  due_date: 't.due_date',
  created_at: 't.created_at',
  updated_at: 't.updated_at',
};

function mapTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    due_date: row.due_date,
    assigned_to: row.assigned_to,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assigned_user: row.assigned_email
      ? {
          id: row.assigned_to,
          email: row.assigned_email,
          name: row.assigned_name,
        }
      : null,
    creator: row.creator_email
      ? {
          id: row.created_by,
          email: row.creator_email,
          name: row.creator_name,
        }
      : null,
  };
}

function canAccessTask(user, task) {
  if (user.role === 'admin') return true;
  return task.created_by === user.id || task.assigned_to === user.id;
}

export async function assertUserExists(userId) {
  const db = await getDb();
  const row = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (!row) {
    throw new AppError(422, 'Validation failed', {
      assignedTo: 'assignedTo must reference an existing user',
    });
  }
}

export async function listTasks(user, query) {
  const db = await getDb();
  const conditions = [];
  const params = [];

  if (user.role !== 'admin') {
    conditions.push('(t.created_by = ? OR t.assigned_to = ?)');
    params.push(user.id, user.id);
  }

  if (query.status) {
    conditions.push('t.status = ?');
    params.push(query.status);
  }
  if (query.priority) {
    conditions.push('t.priority = ?');
    params.push(query.priority);
  }
  if (query.assignedTo) {
    conditions.push('t.assigned_to = ?');
    params.push(query.assignedTo);
  }
  if (query.search) {
    conditions.push('INSTR(LOWER(t.title), LOWER(?)) > 0');
    params.push(query.search);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = SORT_SQL[query.sortBy] || SORT_SQL.created_at;
  const orderDir = query.order === 'asc' ? 'ASC' : 'DESC';

  const countSql = `SELECT COUNT(*) AS c FROM tasks t ${where}`;
  const countRow = await db.get(countSql, params);
  const total = countRow?.c ?? 0;

  const offset = (query.page - 1) * query.limit;
  const listSql = `
    SELECT
      t.*,
      au.email AS assigned_email,
      au.name AS assigned_name,
      cu.email AS creator_email,
      cu.name AS creator_name
    FROM tasks t
    LEFT JOIN users au ON au.id = t.assigned_to
    INNER JOIN users cu ON cu.id = t.created_by
    ${where}
    ORDER BY ${sortCol} ${orderDir}
    LIMIT ? OFFSET ?
  `;
  const rows = await db.all(listSql, [...params, query.limit, offset]);

  return {
    tasks: rows.map(mapTask),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getTaskById(taskId, user) {
  const db = await getDb();
  const row = await db.get(
    `
    SELECT
      t.*,
      au.email AS assigned_email,
      au.name AS assigned_name,
      cu.email AS creator_email,
      cu.name AS creator_name
    FROM tasks t
    LEFT JOIN users au ON au.id = t.assigned_to
    INNER JOIN users cu ON cu.id = t.created_by
    WHERE t.id = ?
  `,
    [taskId]
  );
  if (!row) {
    throw new AppError(404, 'Task not found');
  }
  if (!canAccessTask(user, row)) {
    throw new AppError(403, 'You do not have access to this task');
  }
  return mapTask(row);
}

export async function createTask(data, user) {
  if (data.assignedTo) {
    await assertUserExists(data.assignedTo);
  }
  const db = await getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run(
    `
    INSERT INTO tasks (id, title, description, status, priority, due_date, assigned_to, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      id,
      data.title,
      data.description ?? null,
      data.status,
      data.priority,
      data.dueDate ?? null,
      data.assignedTo ?? null,
      user.id,
      now,
      now,
    ]
  );
  return getTaskById(id, user);
}

export async function updateTask(taskId, data, user) {
  const db = await getDb();
  const existing = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!existing) {
    throw new AppError(404, 'Task not found');
  }
  if (!canAccessTask(user, existing)) {
    throw new AppError(403, 'You do not have access to this task');
  }

  if (data.assignedTo !== undefined && data.assignedTo !== null) {
    await assertUserExists(data.assignedTo);
  }

  const updates = [];
  const vals = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    vals.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    vals.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    vals.push(data.status);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    vals.push(data.priority);
  }
  if (data.dueDate !== undefined) {
    updates.push('due_date = ?');
    vals.push(data.dueDate ?? null);
  }
  if (data.assignedTo !== undefined) {
    updates.push('assigned_to = ?');
    vals.push(data.assignedTo);
  }

  if (!updates.length) {
    return getTaskById(taskId, user);
  }

  updates.push("updated_at = datetime('now')");
  vals.push(taskId);

  await db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, vals);

  return getTaskById(taskId, user);
}

export async function deleteTask(taskId, user) {
  const db = await getDb();
  const existing = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!existing) {
    throw new AppError(404, 'Task not found');
  }
  if (!canAccessTask(user, existing)) {
    throw new AppError(403, 'You do not have access to this task');
  }
  await db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
  return { ok: true };
}
