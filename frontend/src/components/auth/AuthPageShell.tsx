import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthPageShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(16,185,129,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-lg font-semibold tracking-tight text-emerald-400">
            Task Manager
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle != null && (
            <div className="mt-2 text-sm leading-relaxed text-slate-400">
              {subtitle}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/95 p-6 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-sm sm:p-8">
          {children}
        </div>

        {footer != null && (
          <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
        )}
      </div>
    </div>
  )
}
