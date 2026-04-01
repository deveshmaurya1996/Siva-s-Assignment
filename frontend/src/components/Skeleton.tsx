import type { HTMLAttributes } from "react";

const base =
  "animate-pulse rounded-md bg-slate-800/80 motion-reduce:animate-none";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...rest }: SkeletonProps) {
  return <div className={`${base} ${className}`.trim()} {...rest} />;
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-full", "w-3/4"] as const;
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function SkeletonToolbar({
  items = 3,
  className = "",
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`.trim()}
    >
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTaskListTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-900/60">
          <tr>
            <th className="w-10 px-3 py-3">
              <Skeleton className="h-4 w-4 rounded" />
            </th>
            {Array.from({ length: 6 }, (_, i) => (
              <th key={i} className="px-3 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
            ))}
            <th className="px-3 py-3">
              <Skeleton className="h-4 w-14" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-b border-slate-800/80">
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-4 rounded" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-48 max-w-full" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonTaskDetail() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-2/3 max-w-md" />
      </div>
      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-full max-w-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTaskForm() {
  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTaskListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <SkeletonToolbar items={3} />
      <SkeletonTaskListTable rows={8} />
    </div>
  );
}
