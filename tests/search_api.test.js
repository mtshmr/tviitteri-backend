const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const credentials = {
  username: 'tester',
  password: 'testingPassword'
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

describe('testing searching', () => {
  test('search returns right amount of tviits', async () => {

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send({ content: 'Found this one' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send({ content: 'Missed this one' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/tviits')
      .set('Authorization', `bearer ${token}`)
      .send({ content: 'Found this too' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const searchResponse = await api
      .get('/api/search?q=found')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(searchResponse.body).toHaveLength(2)

    const contents = searchResponse.body.map(r => r.content)

    expect(contents).toContain('Found this one')
    expect(contents).toContain('Found this too')

    const searchResponse2 = await api
      .get('/api/search?q=this')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(searchResponse2.body).toHaveLength(3)
  })
})

afterAll(async () => {
  await api
    .post('/api/tests/closeDb')
})