export function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-950">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
