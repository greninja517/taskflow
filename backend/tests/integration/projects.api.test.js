const request = require('supertest');
const createApp = require('../../src/app');
const pool = require('../../src/db/pool');
const { runMigrations } = require('../../src/db/migrate');

const app = createApp();
let token;

function uniqueEmail() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

beforeAll(async () => {
  await runMigrations();
});

beforeEach(async () => {
  const res = await request(app).post('/api/auth/register').send({
    email: uniqueEmail(),
    password: 'password123',
  });
  token = res.body.token;
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE tasks, projects, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('Projects API', () => {
  it('creates and lists projects for the authenticated user', async () => {
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Website Redesign' })
      .expect(201);

    const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${token}`).expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Website Redesign');
  });

  it('rejects requests without a token', async () => {
    await request(app).get('/api/projects').expect(401);
  });

  it('updates a project', async () => {
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Old name' });

    const updateRes = await request(app)
      .patch(`/api/projects/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New name' })
      .expect(200);

    expect(updateRes.body.name).toBe('New name');
  });
});
