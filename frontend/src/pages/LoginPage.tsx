import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { AuthLoading } from '../components/auth/AuthLoading'
import { AuthPageShell } from '../components/auth/AuthPageShell'
import {
  authAlertError,
  authFieldError,
  authFieldInput,
  authFieldLabel,
  authPrimaryButton,
} from '../components/auth/auth-field-classes'
import { useAuth } from '../context/useAuth'

function validate(email: string, password: string): Record<string, string> | null {
  const fields: Record<string, string> = {}
  if (!email.trim()) fields.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    fields.email = 'Enter a valid email'
  }
  if (!password) fields.password = 'Password is required'
  return Object.keys(fields).length ? fields : null
}

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    '/tasks'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFields({})
    const v = validate(email, password)
    if (v) {
      setFields(v)
      return
    }
    setSubmitting(true)
    try {
      await login(email.trim().toLowerCase(), password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.fields) setFields((f) => ({ ...f, ...err.fields! }))
      } else {
        setError('Login failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Welcome back. Sign in to continue."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {error && <div className={authAlertError}>{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={authFieldLabel}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldInput}
            placeholder="you@company.com"
          />
          {fields.email && (
            <p className={authFieldError}>{fields.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className={authFieldLabel}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldInput}
            placeholder="••••••••"
          />
          {fields.password && (
            <p className={authFieldError}>{fields.password}</p>
          )}
        </div>
        <button type="submit" disabled={submitting} className={authPrimaryButton}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Demo account
        </p>
        <p className="mt-1 font-mono text-xs text-slate-400">
          <span className="text-slate-500">Email</span> admin@example.com
        </p>
        <p className="mt-0.5 font-mono text-xs text-slate-400">
          <span className="text-slate-500">Password</span> Admin123456
        </p>
      </div>
    </AuthPageShell>
  )
}
