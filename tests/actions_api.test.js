const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const newUser = {
  username: 'tester',
  name: 'Test McTestface',
  password: 'testingPassword'
}

const newUser2 = {
  username: 'tester2',
  name: 'Test McTestface',
  password: 'testingPassword'
}

const credentials = {
  username: newUser.username,
  password: newUser.password
}

const credentials2 = {
  username: newUser2.username,
  password: newUser2.password
}

const tviit = {
  content: 'Testing tviiting!'
}

beforeAll(async () => {
  await api
    .post('/api/tests/createTablesDb')

  await api
    .post('/api/users')
    .send(newUser)

  await api
    .post('/api/users')
    .send(newUser2)
})

beforeEach(async () => {
  await api
    .post('/api/tests/deleteEverythingInTableDb/tviits')
  await api
    .post('/api/tests/deleteEverythingInTableDb/actions')
})

describe('testing liking', () => {
  test('liking a tviit of another user succeeds', async () => {

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

    const loginResponse2 = await api
      .post('/api/login')
      .send(credentials2)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token2 = loginResponse2.body.token

    const action = {
      actionType: 'like',
      targetTviitId: id
    }

    const likeResponse = await api
      .post('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .send(action)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(Object.keys(likeResponse.body)).toHaveLength(4)
  })

  test('liking own tviit fails', async () => {

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

    const action = {
      actionType: 'like',
      targetTviitId: id
    }

    await api
      .post('/api/actions')
      .set('Authorization', `bearer ${token}`)
      .send(action)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  test('getting own likes succeeds', async () => {

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

    const loginResponse2 = await api
      .post('/api/login')
      .send(credentials2)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token2 = loginResponse2.body.token

    const action = {
      actionType: 'like',
      targetTviitId: id
    }

    await api
      .post('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .send(action)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const getResponse = await api
      .get('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(getResponse.body.actions.likes).toHaveLength(1)
    expect(getResponse.body.actions.likes).toContain(id)
  })

  test('deleting own like succeeds', async () => {

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

    const loginResponse2 = await api
      .post('/api/login')
      .send(credentials2)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token2 = loginResponse2.body.token

    const action = {
      actionType: 'like',
      targetTviitId: id
    }

    await api
      .post('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .send(action)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const getResponse = await api
      .get('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(getResponse.body.actions.likes).toHaveLength(1)

    await api
      .delete('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .send(action)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const getResponse2 = await api
      .get('/api/actions')
      .set('Authorization', `bearer ${token2}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(getResponse2.body.actions.likes).toHaveLength(0)
  })
})

afterAll(async () => {
  await api
    .post('/api/tests/closeDb')
})