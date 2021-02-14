const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeAll(async () => {
  await api
    .post('/api/tests/createTablesDb')
})

beforeEach(async () => {
  await api
    .post('/api/tests/deleteEverythingInTableDb/users')
})

describe('testing user creation', () => {
  test('creating a new user succeeds', async () => {
    const newUser = {
      username: 'tester',
      name: 'Test McTestface',
      password: 'testingPassword'
    }

    const postResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(postResponse.body)).toContain('userId')
  })

  test('trying to create a new user with existing username fails', async () => {
    const newUser = {
      username: 'tester',
      name: 'Test McTestface',
      password: 'testingPassword'
    }

    const postResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(postResponse.body)).toContain('userId')

    // Try to create a new user with same information
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
})

describe('testing user getting', () => {
  test('trying to get an existing user succeeds', async () => {
    const newUser = {
      username: 'tester',
      name: 'Test McTestface',
      password: 'testingPassword'
    }

    const postResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(postResponse.body)).toContain('userId')

    const userId = postResponse.body.userId

    const getResponse = await api.get(`/api/users/${userId}`)

    expect(Object.keys(getResponse.body)).toContain('username')
    expect(getResponse.body.username).toEqual(newUser.username)
  })

  test('trying to get a non-existing user fails', async () => {
    await api
      .get('/api/users/1234567890')
      .expect(404)
      .expect('Content-Type', /application\/json/)
  })
})

afterAll(async () => {
  await api
    .post('/api/tests/closeDb')
})