export type Role = 'admin' | 'user'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  assigned_user: { id: string; email: string; name: string } | null
  creator: { id: string; email: string; name: string } | null
}

export type ApiErrorBody = {
  error: string
  fields?: Record<string, string>
}

export type PaginatedTasks = {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
