import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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

function validate(
  email: string,
  password: string,
  name: string
): Record<string, string> | null {
  const fields: Record<string, string> = {}
  if (!name.trim()) fields.name = 'Name is required'
  else if (name.length > 200) fields.name = 'Name must be at most 200 characters'

  if (!email.trim()) fields.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    fields.email = 'Enter a valid email'
  }

  if (!password) fields.password = 'Password is required'
  else if (password.length < 8) {
    fields.password = 'Password must be at least 8 characters'
  } else if (!/[A-Z]/.test(password)) {
    fields.password = 'Password must contain at least one uppercase letter'
  } else if (!/[0-9]/.test(password)) {
    fields.password = 'Password must contain at least one number'
  }

  return Object.keys(fields).length ? fields : null
}

export function RegisterPage() {
  const { user, loading, signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to="/tasks" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFields({})
    const v = validate(email, password, name)
    if (v) {
      setFields(v)
      return
    }
    setSubmitting(true)
    try {
      await signup(email.trim().toLowerCase(), password, name.trim())
      navigate('/tasks', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.fields) setFields((f) => ({ ...f, ...err.fields }))
      } else {
        setError('Registration failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell
      title="Create account"
      subtitle={
        <>
          New users get the <span className="text-slate-300">user</span> role.
          Password: 8+ characters, one uppercase letter, one number.
        </>
      }
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {error && <div className={authAlertError}>{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="reg-name" className={authFieldLabel}>
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authFieldInput}
            placeholder="Jane Doe"
          />
          {fields.name && <p className={authFieldError}>{fields.name}</p>}
        </div>
        <div>
          <label htmlFor="reg-email" className={authFieldLabel}>
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldInput}
            placeholder="you@company.com"
          />
          {fields.email && <p className={authFieldError}>{fields.email}</p>}
        </div>
        <div>
          <label htmlFor="reg-password" className={authFieldLabel}>
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
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
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthPageShell>
  )
}
