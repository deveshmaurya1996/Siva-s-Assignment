import { useCallback, useEffect, useState } from 'react'
import type { PaginatedTasks, Task } from '../types'
import { ApiError, apiFetch } from '../api/client'

export type TaskListParams = {
  page: number
  limit: number
  status?: string
  priority?: string
  assignedTo?: string
  sortBy: string
  order: 'asc' | 'desc'
  search?: string
}

const defaultParams: TaskListParams = {
  page: 1,
  limit: 10,
  sortBy: 'created_at',
  order: 'desc',
}

function toQuery(params: TaskListParams): string {
  const q = new URLSearchParams()
  q.set('page', String(params.page))
  q.set('limit', String(params.limit))
  q.set('sortBy', params.sortBy)
  q.set('order', params.order)
  if (params.status) q.set('status', params.status)
  if (params.priority) q.set('priority', params.priority)
  if (params.assignedTo) q.set('assignedTo', params.assignedTo)
  if (params.search) q.set('search', params.search)
  return q.toString()
}

export function useTasks(initial?: Partial<TaskListParams>) {
  const [params, setParams] = useState<TaskListParams>({
    ...defaultParams,
    ...initial,
  })
  const [data, setData] = useState<PaginatedTasks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<PaginatedTasks>(`/tasks?${toQuery(params)}`)
      setData(res)
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Failed to load tasks'
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateTaskLocal = useCallback((updated: Task) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
      }
    })
  }, [])

  const patchTask = useCallback(
    async (id: string, body: Record<string, unknown>) => {
      const res = await apiFetch<{ task: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      updateTaskLocal(res.task)
      return res.task
    },
    [updateTaskLocal]
  )

  const removeTask = useCallback(async (id: string) => {
    await apiFetch<undefined>(`/tasks/${id}`, { method: 'DELETE' })
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
        pagination: {
          ...prev.pagination,
          total: Math.max(0, prev.pagination.total - 1),
        },
      }
    })
  }, [])

  return {
    params,
    setParams,
    data,
    loading,
    error,
    refresh,
    patchTask,
    removeTask,
  }
}
