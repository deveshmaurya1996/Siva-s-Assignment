import { useNavigate } from 'react-router-dom'
import { TaskForm } from '../components/TaskForm'

export function TaskNewPage() {
  const navigate = useNavigate()

  return (
    <div>
      <TaskForm
        mode="create"
        onDone={() => navigate('/tasks')}
        onCancel={() => navigate('/tasks')}
      />
    </div>
  )
}
