import { useEffect, useState } from 'react'
import { ApiError, apiFetch } from '../api/client'

export type PickerUser = { id: string; email: string; name: string }

export function useUsers() {
  const [users, setUsers] = useState<PickerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<{ users: PickerUser[] }>('/users')
      .then((r) => setUsers(r.users))
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : 'Failed to load users'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  return { users, loading, error }
}
