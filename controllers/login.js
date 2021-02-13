const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const db = require('../db/database')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await db.getUser(body.username.toLowerCase())

  const passwordCorrect = user === undefined
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) throw Error('LOGIN_INVALID')

  const userForToken = {
    username: user.username,
    userId: user.userId
  }

  const token = jwt.sign(userForToken, config.JWT_SECRET)

  const likes = await db.getAllLikesOfUser(user.userId)

  response
    .json({ token, userId: user.userId, username: user.username, name: user.name, actions: { likes } })
})

module.exports = loginRouter