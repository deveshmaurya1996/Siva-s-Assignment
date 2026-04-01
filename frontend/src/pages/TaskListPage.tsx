import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types";
import { SkeletonTaskListPage } from "../components/Skeleton";
import { SelectMenu, type SelectOption } from "../components/SelectMenu";
import {
  canDeleteTask,
  canFullEdit,
  canUpdateStatus,
} from "../utils/permissions";

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const sortCols = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "due_date", label: "Due" },
  { key: "created_at", label: "Created" },
  { key: "updated_at", label: "Updated" },
] as const;

function SortIcon({
  active,
  order,
}: {
  active: boolean;
  order: "asc" | "desc";
}) {
  if (!active) return <span className="text-slate-600">↕</span>;
  return (
    <span className="text-emerald-400">{order === "asc" ? "↑" : "↓"}</span>
  );
}

export function TaskListPage() {
  const { user } = useAuth();
  const { params, setParams, data, loading, error, patchTask, removeTask } =
    useTasks();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setParams((p) => ({
      ...p,
      page: 1,
      search: debouncedSearch || undefined,
    }));
  }, [debouncedSearch, setParams]);

  function handleSort(field: (typeof sortCols)[number]["key"]) {
    setParams((p) => ({
      ...p,
      page: 1,
      sortBy: field,
      order: p.sortBy === field ? (p.order === "asc" ? "desc" : "asc") : "desc",
    }));
  }

  async function toggleDone(task: Task, checked: boolean) {
    setRowBusy(task.id);
    try {
      await patchTask(task.id, {
        status: checked ? "done" : "todo",
      });
    } finally {
      setRowBusy(null);
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setRowBusy(task.id);
    try {
      await removeTask(task.id);
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {loading && !data ? (
        <SkeletonTaskListPage />
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-2xl font-semibold text-white">Tasks</h1>
            <Link
              to="/tasks/new"
              className="inline-flex w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              New task
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                Search title
              </label>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs uppercase tracking-wide text-slate-500"
                htmlFor="filter-status"
              >
                Status
              </label>
              <SelectMenu
                id="filter-status"
                value={params.status ?? ""}
                onChange={(v) =>
                  setParams((p) => ({
                    ...p,
                    page: 1,
                    status: v || undefined,
                  }))
                }
                options={STATUS_FILTER_OPTIONS}
                placeholder="All"
                className="w-full"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs uppercase tracking-wide text-slate-500"
                htmlFor="filter-priority"
              >
                Priority
              </label>
              <SelectMenu
                id="filter-priority"
                value={params.priority ?? ""}
                onChange={(v) =>
                  setParams((p) => ({
                    ...p,
                    page: 1,
                    priority: v || undefined,
                  }))
                }
                options={PRIORITY_FILTER_OPTIONS}
                placeholder="All"
                className="w-full"
              />
            </div>
          </div>

          {loading && data && (
            <p className="text-xs text-slate-500">Refreshing…</p>
          )}

          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="w-10 px-3 py-3 text-slate-400">Done</th>
                  {sortCols.map((col) => (
                    <th key={col.key} className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1 font-medium text-slate-300 hover:text-white"
                      >
                        {col.label}
                        <SortIcon
                          active={params.sortBy === col.key}
                          order={params.order}
                        />
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.tasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      No tasks match your filters.
                    </td>
                  </tr>
                )}
                {data?.tasks.map((task) => {
                  const canDel = user && canDeleteTask(user);
                  const canEdit = user && canFullEdit(user, task);
                  const canStatus = user && canUpdateStatus(user, task);
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-slate-800/80 hover:bg-slate-900/40"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={task.status === "done"}
                          disabled={!canStatus || rowBusy === task.id}
                          onChange={(e) =>
                            void toggleDone(task, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-600"
                          title={
                            canStatus
                              ? "Mark complete"
                              : "You cannot update this task"
                          }
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-100">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="hover:text-emerald-400"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        {task.status}
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        {task.priority}
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {new Date(task.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {new Date(task.updated_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-emerald-400 hover:underline"
                          >
                            View
                          </Link>
                          {canEdit && (
                            <Link
                              to={`/tasks/${task.id}/edit`}
                              className="text-slate-300 hover:underline"
                            >
                              Edit
                            </Link>
                          )}
                          {canDel && (
                            <button
                              type="button"
                              disabled={rowBusy === task.id}
                              onClick={() => void handleDelete(task)}
                              className="text-red-400 hover:underline disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages} (
                {data.pagination.total} tasks)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.pagination.page <= 1}
                  onClick={() =>
                    setParams((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
                  }
                  className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() =>
                    setParams((p) => ({
                      ...p,
                      page: Math.min(data.pagination.totalPages, p.page + 1),
                    }))
                  }
                  className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
