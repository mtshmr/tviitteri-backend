const config = require('../utils/config')
const tviitsRouter = require('express').Router()
const middleware = require('../utils/middleware')
const db = require('../db/database')

tviitsRouter.get('/', async (request, response) => {
  let limit = request.query.limit
  let offset = request.query.offset

  if (isNaN(limit)) limit = config.DEFAULT_GET_TVIIT_LIMIT
  if (isNaN(offset)) offset = 0

  const tviits = await db.getNewestTviits(limit, offset)
  response.json(await db.addUserInfoToTviits(tviits))
})

tviitsRouter.post('/', middleware.authHandler, async (request, response) => {
  const tviitBase = request.body

  if (tviitBase.content.length > config.MAX_TVIIT_CONTENT_LENGTH) throw Error('TVIIT_TOO_LONG')
  if (tviitBase.content.length < config.MIN_TVIIT_CONTENT_LENGTH) throw Error('TVIIT_TOO_SHORT')

  const userId = request.user.userId

  const postDate = new Date().toISOString()

  const responseTo = isNaN(tviitBase.responseTo)
    ? null
    : tviitBase.responseTo

  const tviit = { userId, content: tviitBase.content, postDate, responseTo }

  const tviitId = await db.addTviit(tviit)

  response.json({ id: tviitId, ...tviit })
})

tviitsRouter.get('/:id', async (request, response) => {
  const id = request.params.id

  const tviit = await db.getTviit(id)

  response.json(await db.addUserInfoToTviit(tviit))
})

tviitsRouter.delete('/:id', middleware.authHandler, async (request, response) => {
  const id = request.params.id
  const userId = request.user.userId

  const tviitToDel = await db.getTviit(id)

  if (tviitToDel.userId !== userId) throw Error('TVIIT_UNAUTH_DEL')

  await db.deleteTviit(id)

  response.status(204).end()
})

module.exports = tviitsRouter