import { ListTodo, LogOut, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Dropdown, DropdownItem } from './Dropdown'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link
          to="/tasks"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-emerald-400 transition hover:text-emerald-300"
        >
          <ListTodo className="h-6 w-6 shrink-0" aria-hidden />
          Task Manager
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:gap-x-5"
          aria-label="Main"
        >
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
          >
            <ListTodo className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            Tasks
          </Link>
          <Link
            to="/tasks/new"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
          >
            <Plus className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            New task
          </Link>
          {user && (
            <Dropdown
              label={user.name}
              description={user.email}
              align="right"
            >
              <div className="border-b border-slate-800 px-3 py-2">
                <p className="text-xs text-slate-500">Role</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-200">
                  {user.role}
                </p>
              </div>
              <DropdownItem
                icon={<LogOut />}
                destructive
                onClick={() => logout()}
              >
                Log out
              </DropdownItem>
            </Dropdown>
          )}
        </nav>
      </div>
    </header>
  )
}
