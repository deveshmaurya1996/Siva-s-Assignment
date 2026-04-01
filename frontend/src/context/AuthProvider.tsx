import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { User } from '../types'
import { apiFetch } from '../api/client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  )

  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem('token'))
  )

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) {
      return
    }
    apiFetch<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    localStorage.setItem('token', res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await apiFetch<{ token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        }),
        skipAuth: true,
      })
      localStorage.setItem('token', res.token)
      setToken(res.token)
      setUser(res.user)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
    }),
    [user, token, loading, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
