import { useCallback, useEffect, useState } from 'react'
import type { Task } from '../types'
import { ApiError, apiFetch } from '../api/client'

export function useTask(id: string | undefined) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!id) {
      setTask(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<{ task: Task }>(`/tasks/${id}`)
      setTask(res.task)
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Failed to load task'
      setError(msg)
      setTask(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const update = useCallback(
    async (body: Record<string, unknown>) => {
      if (!id) throw new Error('No task id')
      const res = await apiFetch<{ task: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      setTask(res.task)
      return res.task
    },
    [id]
  )

  const remove = useCallback(async () => {
    if (!id) return
    await apiFetch<undefined>(`/tasks/${id}`, { method: 'DELETE' })
    setTask(null)
  }, [id])

  return { task, loading, error, refresh, update, remove }
}
