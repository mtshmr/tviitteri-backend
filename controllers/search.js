const config = require('../utils/config')
const searchRouter = require('express').Router()
const db = require('../db/database')

searchRouter.get('/', async (request, response) => {
  let q = request.query.q
  let userId = request.query.userId
  let limit = request.query.limit
  let offset = request.query.offset

  if (!q && !userId) throw Error('SEARCH_NO_QUERY')
  if (q && q.length < config.MIN_SEARCH_LENGTH) throw Error('SEARCH_QUERY_TOO_SHORT')

  if (isNaN(limit)) limit = config.DEFAULT_GET_TVIIT_LIMIT
  if (isNaN(offset)) offset = 0

  const tviits = await db.findTviits(q, userId, limit, offset)
  response.json(await db.addUserInfoToTviits(tviits))
})

module.exports = searchRouter