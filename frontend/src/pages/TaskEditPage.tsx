import { Navigate, useNavigate, useParams } from "react-router-dom";
import { SkeletonTaskForm } from "../components/Skeleton";
import { TaskForm } from "../components/TaskForm";
import { useAuth } from "../context/useAuth";
import { useTask } from "../hooks/useTask";
import { canFullEdit } from "../utils/permissions";

export function TaskEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { task, loading, error } = useTask(id);

  if (!id) {
    return <Navigate to="/tasks" replace />;
  }

  if (!loading && !task && error) {
    return (
      <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-red-200">
        {error}
      </div>
    );
  }

  if (!loading && task && user && !canFullEdit(user, task)) {
    return <Navigate to={`/tasks/${task.id}`} replace />;
  }

  if (loading || !task) {
    return <SkeletonTaskForm />;
  }

  return (
    <TaskForm
      mode="edit"
      initial={task}
      onDone={() => navigate(`/tasks/${task.id}`)}
      onCancel={() => navigate(`/tasks/${task.id}`)}
    />
  );
}
