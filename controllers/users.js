const config = require('../utils/config')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const middleware = require('../utils/middleware')
const db = require('../db/database')

const saltRounds = 10

usersRouter.get('/', async (request, response) => {
  const username = request.query.username
  let getTviits = request.query.getTviits
  let limit = request.query.limit
  let offset = request.query.offset

  if (getTviits === 'true') {
    getTviits = true
  } else if (getTviits === 'false') {
    getTviits = false
  } else {
    getTviits = false
  }

  if (!username) throw Error('SEARCH_NO_USERNAME')
  if (isNaN(limit)) limit = config.DEFAULT_GET_TVIIT_LIMIT
  if (isNaN(offset)) offset = 0

  let user = await db.getUser(username)

  if (!user) throw Error('USER_NOT_FOUND')

  delete user.passwordHash

  if (getTviits) {
    const tviits = await db.findTviits(null, user.userId, limit, offset)
    user.tviits = await db.addUserInfoToTviits(tviits)
  }

  response.json(user)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  let newUser = { ...body, username: body.username.toLowerCase() }

  if (!newUser.bio) newUser.bio = ''

  if (!newUser.username || !newUser.name || !newUser.password) throw Error('USERS_MISSING_PARAMS')

  if (newUser.password.length < config.MIN_PASSWORD_LENGTH) throw Error('USERS_PASSWORD_TOO_SHORT')
  if (newUser.password.length > config.MAX_PASSWORD_LENGTH) throw Error('USERS_PASSWORD_TOO_LONG')

  if (newUser.username.length < config.MIN_USERNAME_LENGTH) throw Error('USERS_USERNAME_TOO_SHORT')
  if (newUser.username.length > config.MAX_USERNAME_LENGTH) throw Error('USERS_USERNAME_TOO_LONG')

  if (newUser.name.length < config.MIN_NAME_LENGTH) throw Error('USERS_NAME_TOO_SHORT')
  if (newUser.name.length > config.MAX_NAME_LENGTH) throw Error('USERS_NAME_TOO_LONG')

  // if (newUser.bio.length < config.MIN_BIO_LENGTH) throw Error('USERS_BIO_TOO_SHORT')
  if (newUser.bio.length > config.MAX_BIO_LENGTH) throw Error('USERS_BIO_TOO_LONG')

  const existingUser = await db.getUser(newUser.username)

  if (existingUser) throw Error('USERS_USERNAME_ALREADY_EXISTS')

  const passwordHash = await bcrypt.hash(newUser.password, saltRounds)

  const user = { username: newUser.username, name: newUser.name, bio: newUser.bio, passwordHash }

  const userId = await db.addUser(user)

  response.json({ userId, username: newUser.username })
})

usersRouter.get('/:userId', async (request, response) => {
  const userId = request.params.userId
  let getTviits = request.query.getTviits
  let limit = request.query.limit
  let offset = request.query.offset

  if (getTviits === 'true') {
    getTviits = true
  } else if (getTviits === 'false') {
    getTviits = false
  } else {
    getTviits = false
  }

  if (isNaN(limit)) limit = config.DEFAULT_GET_TVIIT_LIMIT
  if (isNaN(offset)) offset = 0

  let user = await db.getUser(null, userId)

  if (!user) throw Error('USER_NOT_FOUND')

  delete user.passwordHash

  if (getTviits) {
    const tviits = await db.findTviits(null, user.userId, limit, offset)
    user.tviits = await db.addUserInfoToTviits(tviits)
  }

  response.json(user)
})

usersRouter.patch('/:userId', middleware.authHandler, async (request, response) => {
  const modUserInfo = request.body
  const paramUserId = request.params.userId
  const userId = request.user.userId

  if (Number(paramUserId) !== userId) throw Error('USER_UNAUTH_USER_PATCH')

  if (!(modUserInfo.name || (modUserInfo.bio !== undefined) || modUserInfo.newPassword)) throw Error('USERS_PATCH_PARAMS_ISSUE')

  if (!modUserInfo.newPassword) {
    if (Object.keys(modUserInfo).length !== 1) throw Error('USERS_PATCH_PARAMS_ISSUE')
  } else {
    if (Object.keys(modUserInfo).length !== 2) throw Error('USERS_PATCH_PARAMS_ISSUE')
  }

  if (modUserInfo.newPassword) {
    if (modUserInfo.newPassword.length < config.MIN_PASSWORD_LENGTH) throw Error('USERS_PASSWORD_TOO_SHORT')
    if (modUserInfo.newPassword.length > config.MAX_PASSWORD_LENGTH) throw Error('USERS_PASSWORD_TOO_LONG')
    if (!modUserInfo.oldPassword) throw Error('USERS_PATCH_PARAMS_ISSUE')

    // First check that given old (current) password is ok before changing
    const user = await db.getUser(request.user.username)

    const passwordCorrect = user === undefined
      ? false
      : await bcrypt.compare(modUserInfo.oldPassword, user.passwordHash)

    if (!passwordCorrect) throw Error('USERS_PATCH_OLD_PW_WRONG')

    const passwordHash = await bcrypt.hash(modUserInfo.newPassword, saltRounds)
    const userInfo = { userId, passwordHash }
    await db.changeUserPassword(userInfo)

  } else if (modUserInfo.name) {

    if (modUserInfo.name.length < config.MIN_NAME_LENGTH) throw Error('USERS_NAME_TOO_SHORT')
    if (modUserInfo.name.length > config.MAX_NAME_LENGTH) throw Error('USERS_NAME_TOO_LONG')

    const userInfo = { userId, name: modUserInfo.name }
    await db.changeUserName(userInfo)

  } else if (modUserInfo.bio !== undefined) {
    if (modUserInfo.bio.length < config.MIN_BIO_LENGTH) throw Error('USERS_BIO_TOO_SHORT')
    if (modUserInfo.bio.length > config.MAX_BIO_LENGTH) throw Error('USERS_BIO_TOO_LONG')

    const bio = modUserInfo.bio.length === 0
      ? null
      : modUserInfo.bio

    const userInfo = { userId, bio }
    await db.changeUserBio(userInfo)

  } else {
    throw Error('USERS_PATCH_PROBLEM')
  }

  response.json(modUserInfo)
})

module.exports = usersRouter