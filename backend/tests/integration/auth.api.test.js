// Integration tests hit a real Postgres database. Locally, point DATABASE_URL
// at the docker-compose db. In CI, this is where a `postgres:` service
// container comes in.
const request = require('supertest');
const createApp = require('../../src/app');
const pool = require('../../src/db/pool');
const { runMigrations } = require('../../src/db/migrate');

const app = createApp();

beforeAll(async () => {
  await runMigrations();
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE tasks, projects, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.token).toBeDefined();
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('rejects a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@example.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects an incorrect password', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login2@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login2@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });
});
