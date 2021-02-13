const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeAll(async () => {
  await api
    .post('/api/tests/createTablesDb')

  const newUser = {
    username: 'tester',
    name: 'Test McTestface',
    password: 'testingPassword'
  }

  await api
    .post('/api/users')
    .send(newUser)
})

describe('testing login', () => {
  test('login succeeds with correct credentials', async () => {
    const credentials = {
      username: 'tester',
      password: 'testingPassword'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(response.body)).toContain('token')
    expect(response.body.username).toEqual(credentials.username)
  })

  test('login fails with wrong credentials', async () => {
    const credentials = {
      username: 'tester',
      password: 'wrongPassword'
    }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

afterAll(async () => {
  await api
    .post('/api/tests/closeDb')
})