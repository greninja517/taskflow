import { useEffect, useState } from 'react';
import * as api from '../api/client';
import { statusLabel } from '../utils/statusLabel';

const STATUSES = ['todo', 'in_progress', 'done'];

export default function TaskBoard({ token, project }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .listTasks(token, project.id)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, project.id]);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const task = await api.createTask(token, { projectId: project.id, title: title.trim() });
    setTasks((t) => [task, ...t]);
    setTitle('');
  }

  async function advance(task) {
    const nextIndex = (STATUSES.indexOf(task.status) + 1) % STATUSES.length;
    const updated = await api.updateTask(token, task.id, { status: STATUSES[nextIndex] });
    setTasks((ts) => ts.map((t) => (t.id === task.id ? updated : t)));
  }

  async function removeTask(task) {
    await api.deleteTask(token, task.id);
    setTasks((ts) => ts.filter((t) => t.id !== task.id));
  }

  return (
    <section className="task-board">
      <div className="task-board-header">
        <h2>{project.name}</h2>
        <form onSubmit={addTask} className="new-task-form">
          <input
            aria-label="new-task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
          />
          <button type="submit">Add</button>
        </form>
      </div>

      {loading ? (
        <p className="empty-state">Loading tasks...</p>
      ) : (
        <div className="pipeline">
          {STATUSES.map((status) => (
            <div key={status} className={`pipeline-stage stage-${status}`}>
              <h3>{statusLabel(status)}</h3>
              <ul>
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <li key={task.id} className="task-card">
                      <span className="task-title">{task.title}</span>
                      <div className="task-actions">
                        <button onClick={() => advance(task)} title="Advance to next stage">
                          &rarr;
                        </button>
                        <button onClick={() => removeTask(task)} title="Delete task" className="danger">
                          &times;
                        </button>
                      </div>
                    </li>
                  ))}
                {tasks.filter((t) => t.status === status).length === 0 && (
                  <li className="empty-state">Nothing here</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
