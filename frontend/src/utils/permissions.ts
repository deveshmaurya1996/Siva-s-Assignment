import type { Task, User } from '../types'

export function canFullEdit(user: User | null, task: Task): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return task.created_by === user.id
}

export function canUpdateStatus(user: User | null, task: Task): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return (
    task.created_by === user.id ||
    (task.assigned_to !== null && task.assigned_to === user.id)
  )
}

export function canDeleteTask(user: User | null, task: Task): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return task.created_by === user.id
}
