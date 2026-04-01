import { Calendar } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Task } from '../types'
import { ApiError, apiFetch } from '../api/client'
import { SelectMenu, type SelectOption } from './SelectMenu'
import { useUsers } from '../hooks/useUsers'
import { fromLocalInput, toLocalInput } from '../utils/date'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

type Props = {
  mode: 'create' | 'edit'
  initial?: Task | null
  onDone: () => void
  onCancel?: () => void
}

function validate(
  title: string,
  description: string
): Record<string, string> | null {
  const fields: Record<string, string> = {}
  if (!title.trim()) fields.title = 'Title is required'
  else if (title.length > 200) fields.title = 'Title must be at most 200 characters'
  if (description.length > 2000)
    fields.description = 'Description must be at most 2000 characters'
  return Object.keys(fields).length ? fields : null
}

export function TaskForm({ mode, initial, onDone, onCancel }: Props) {
  const { users, loading: usersLoading } = useUsers()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<Task['status']>(
    initial?.status ?? 'todo'
  )
  const [priority, setPriority] = useState<Task['priority']>(
    initial?.priority ?? 'medium'
  )
  const [dueLocal, setDueLocal] = useState(toLocalInput(initial?.due_date ?? null))
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})

  const canSubmit = useMemo(() => !submitting, [submitting])

  const assignOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: '— Unassigned —' },
      ...users.map((u) => ({
        value: u.id,
        label: `${u.name} (${u.email})`,
      })),
    ],
    [users]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFields({})
    const localErr = validate(title, description)
    if (localErr) {
      setFields(localErr)
      return
    }

    const body: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueLocal.trim() ? fromLocalInput(dueLocal) : undefined,
      assignedTo: assignedTo || undefined,
    }

    if (mode === 'edit' && initial) {
      const patch: Record<string, unknown> = {}
      if (title.trim() !== initial.title) patch.title = title.trim()
      const desc = description.trim()
      if (desc !== (initial.description ?? '')) patch.description = desc || null
      if (status !== initial.status) patch.status = status
      if (priority !== initial.priority) patch.priority = priority
      const initialDueLocal = toLocalInput(initial.due_date ?? null)
      if (dueLocal !== initialDueLocal) {
        patch.dueDate = dueLocal.trim()
          ? fromLocalInput(dueLocal) ?? null
          : null
      }
      const prevAssign = initial.assigned_to ?? ''
      if (assignedTo !== prevAssign) {
        patch.assignedTo = assignedTo || null
      }
      if (Object.keys(patch).length === 0) {
        onDone()
        return
      }
      setSubmitting(true)
      try {
        await apiFetch(`/tasks/${initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(patch),
        })
        onDone()
      } catch (e) {
        if (e instanceof ApiError) {
          setError(e.message)
          if (e.fields) setFields(e.fields)
        } else setError('Request failed')
      } finally {
        setSubmitting(false)
      }
      return
    }

    setSubmitting(true)
    try {
      await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      onDone()
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
        if (e.fields) setFields(e.fields)
      } else setError('Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6"
    >
      <h1 className="text-xl font-semibold text-white">
        {mode === 'create' ? 'New task' : 'Edit task'}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-slate-400" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          autoComplete="off"
        />
        {fields.title && (
          <p className="mt-1 text-sm text-red-400">{fields.title}</p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm text-slate-400"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
        />
        {fields.description && (
          <p className="mt-1 text-sm text-red-400">{fields.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-400" htmlFor="status">
            Status
          </label>
          <SelectMenu
            id="status"
            value={status}
            onChange={(v) => setStatus(v as Task['status'])}
            options={STATUS_OPTIONS}
            className="w-full"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-slate-400"
            htmlFor="priority"
          >
            Priority
          </label>
          <SelectMenu
            id="priority"
            value={priority}
            onChange={(v) => setPriority(v as Task['priority'])}
            options={PRIORITY_OPTIONS}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400" htmlFor="due">
          Due date
        </label>
        <div className="relative">
          <input
            id="due"
            type="datetime-local"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
            className="relative w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-3 pr-10 text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
          <Calendar
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500/90"
            aria-hidden
            strokeWidth={2}
          />
        </div>
        {fields.dueDate && (
          <p className="mt-1 text-sm text-red-400">{fields.dueDate}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400" htmlFor="assign">
          Assigned to
        </label>
        <SelectMenu
          id="assign"
          value={assignedTo}
          onChange={setAssignedTo}
          options={assignOptions}
          disabled={usersLoading}
          placeholder="— Unassigned —"
          className="w-full"
        />
        {fields.assignedTo && (
          <p className="mt-1 text-sm text-red-400">{fields.assignedTo}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
