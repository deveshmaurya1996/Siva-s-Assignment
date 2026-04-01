import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SkeletonTaskDetail } from "../components/Skeleton";
import { useAuth } from "../context/useAuth";
import { useTask } from "../hooks/useTask";
import {
  canDeleteTask,
  canFullEdit,
  canUpdateStatus,
} from "../utils/permissions";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { task, loading, error, update, remove } = useTask(id);
  const [busy, setBusy] = useState(false);

  if (!id) {
    return <Link to="/tasks">Back to tasks</Link>;
  }

  if (loading && !task) {
    return <SkeletonTaskDetail />;
  }

  if (error || !task) {
    return (
      <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-red-200">
        {error ?? "Task not found"}
      </div>
    );
  }

  const currentTask = task;
  const canEdit = user && canFullEdit(user, currentTask);
  const canDel = user && canDeleteTask(user);
  const canStatus = user && canUpdateStatus(user, currentTask);

  async function handleDelete() {
    if (!window.confirm(`Delete “${currentTask.title}”?`)) return;
    setBusy(true);
    try {
      await remove();
      navigate("/tasks");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(checked: boolean) {
    setBusy(true);
    try {
      await update({ status: checked ? "done" : "todo" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/tasks"
            className="text-sm text-slate-500 hover:text-emerald-400"
          >
            ← Tasks
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {currentTask.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              to={`/tasks/${currentTask.id}/edit`}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Edit
            </Link>
          )}
          {canDel && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDelete()}
              className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-2 text-sm text-red-300 hover:bg-red-950/50 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Status
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="text-slate-200">{currentTask.status}</span>
            {canStatus && (
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={currentTask.status === "done"}
                  disabled={busy}
                  onChange={(e) => void toggleDone(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600"
                />
                Mark complete
              </label>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Priority
          </p>
          <p className="mt-1 text-slate-200">{currentTask.priority}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Description
          </p>
          <p className="mt-1 whitespace-pre-wrap text-slate-300">
            {currentTask.description || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Due date
          </p>
          <p className="mt-1 text-slate-300">
            {currentTask.due_date
              ? new Date(currentTask.due_date).toLocaleString()
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Assigned to
          </p>
          <p className="mt-1 text-slate-300">
            {currentTask.assigned_user
              ? `${currentTask.assigned_user.name} (${currentTask.assigned_user.email})`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Created by
          </p>
          <p className="mt-1 text-slate-300">
            {currentTask.creator
              ? `${currentTask.creator.name} (${currentTask.creator.email})`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Timestamps
          </p>
          <p className="mt-1 text-slate-400 text-sm">
            Created: {new Date(currentTask.created_at).toLocaleString()}
            <br />
            Updated: {new Date(currentTask.updated_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
