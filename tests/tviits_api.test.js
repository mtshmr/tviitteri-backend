const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const credentials = {
  username: 'tester',
  password: 'testingPassword'
}

const tviit = {
  content: 'Testing tviiting!'
}

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

beforeEach(async () => {
  await api
    .post('/api/tests/deleteEverythingInTableDb/tviits')
})

describe('testing tviiting', () => {
  test('tviiting succeeds while logged in', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const tviitResponse = await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send(tviit)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(tviitResponse.body)).toContain('id')
    expect(tviitResponse.body.content).toEqual(tviit.content)
  })

  test('tviiting fails while not logged in', async () => {

    await api
      .post('/api/tviits')
      .send(tviit)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

describe('testing getting tviits', () => {
  test('getting a tviit by id succeeds', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const tviitResponse = await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send(tviit)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(tviitResponse.body)).toContain('id')

    const id = tviitResponse.body.id

    const getResponse = await api
      .get(`/api/tviits/${id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(getResponse.body.content).toEqual(tviit.content)
  })

  test('getting a tviit by non-existing id fails', async () => {

    await api
      .get('/api/tviits/1234567890')
      .expect(404)
      .expect('Content-Type', /application\/json/)
  })

  test('getting newest tviits succeeds', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send({ content: 'First tviit' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send({ content: 'Second tviit' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const getResponse = await api
      .get('/api/tviits')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(getResponse.body).toHaveLength(2)

    const contents = getResponse.body.map(r => r.content)

    expect(contents).toContain('First tviit')
    expect(contents).toContain('Second tviit')
  })
})

describe('testing deleting tviits', () => {
  test('deleting succeeds while logged in', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const tviitResponse = await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send(tviit)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const id = tviitResponse.body.id

    await api
      .delete(`/api/tviits/${id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    await api
      .get(`/api/tviits/${id}`)
      .expect(404)
      .expect('Content-Type', /application\/json/)
  })

  test('deleting fails while not logged in', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const tviitResponse = await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send(tviit)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const id = tviitResponse.body.id

    // Try deleting without token in Authorization header
    await api
      .delete(`/api/tviits/${id}`)
      .expect(401)
  })

  test('deleting a tviit of another user fails', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const tviitResponse = await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send(tviit)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const id = tviitResponse.body.id

    // Create another user
    const newUser2 = {
      username: 'tester2',
      name: 'Testwo McTestface',
      password: 'testingPassword'
    }

    await api
      .post('/api/users')
      .send(newUser2)

    // Login as the second user
    const loginResponse2 = await api
      .post('/api/login')
      .send({ username: newUser2.username, password: newUser2.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token2 = loginResponse2.body.token

    // Try deleting the tviit from user1 while logged in as user2
    await api
      .delete(`/api/tviits/${id}`)
      .set('Authorization', `bearer ${token2}`)
      .expect(403)
  })
})

afterAll(async () => {
  await api
    .post('/api/tests/closeDb')
})