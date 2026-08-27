const pool = require('../db/pool');

async function listProjects(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const result = await pool.query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, name, description ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name ?? null, description ?? null, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      req.userId,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
