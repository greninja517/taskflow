const pool = require('../db/pool');

async function assertProjectOwnership(projectId, userId) {
  const result = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [
    projectId,
    userId,
  ]);
  return result.rows.length > 0;
}

async function listTasks(req, res, next) {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId query param is required' });

    const owns = await assertProjectOwnership(projectId, req.userId);
    if (!owns) return res.status(404).json({ error: 'Project not found' });

    const result = await pool.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC', [
      projectId,
    ]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { projectId, title, description, status, priority, dueDate } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ error: 'projectId and title are required' });
    }

    const owns = await assertProjectOwnership(projectId, req.userId);
    if (!owns) return res.status(404).json({ error: 'Project not found' });

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, COALESCE($4, 'todo'), COALESCE($5, 'medium'), $6)
       RETURNING *`,
      [projectId, title, description ?? null, status ?? null, priority ?? null, dueDate ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const owns = await assertProjectOwnership(existing.rows[0].project_id, req.userId);
    if (!owns) return res.status(404).json({ error: 'Task not found' });

    const result = await pool.query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         priority = COALESCE($4, priority),
         due_date = COALESCE($5, due_date),
         updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [title ?? null, description ?? null, status ?? null, priority ?? null, dueDate ?? null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const owns = await assertProjectOwnership(existing.rows[0].project_id, req.userId);
    if (!owns) return res.status(404).json({ error: 'Task not found' });

    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
