const request = require('supertest');
const createApp = require('../../src/app');
const pool = require('../../src/db/pool');
const { runMigrations } = require('../../src/db/migrate');

const app = createApp();
let token;
let projectId;

function uniqueEmail(prefix = 'user') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

beforeAll(async () => {
  await runMigrations();
});

beforeEach(async () => {
  const authRes = await request(app)
    .post('/api/auth/register')
    .send({ email: uniqueEmail(), password: 'password123' });
  token = authRes.body.token;

  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Project' });
  projectId = projectRes.body.id;
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE tasks, projects, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('Tasks API', () => {
  it('creates a task with default status and priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId, title: 'Write CI pipeline' })
      .expect(201);

    expect(res.body.status).toBe('todo');
    expect(res.body.priority).toBe('medium');
  });

  it('updates a task status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId, title: 'Deploy to staging' });

    const updateRes = await request(app)
      .patch(`/api/tasks/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'in_progress' })
      .expect(200);

    expect(updateRes.body.status).toBe('in_progress');
  });

  it("prevents access to tasks in another user's project", async () => {
    const otherAuth = await request(app)
      .post('/api/auth/register')
      .send({ email: uniqueEmail('other'), password: 'password123' });
    const otherToken = otherAuth.body.token;

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ projectId, title: 'Should not be allowed' })
      .expect(404);
  });
});
