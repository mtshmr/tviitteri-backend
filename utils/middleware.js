const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const logger = require('./logger')
const db = require('../db/database')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  logger.error('UNKNOWN_ENDPOINT')
  response.status(404).json({
    error: 'unknown endpoint'
  })
}

const authHandler = async (request, response, next) => {
  logger.info('authHandler')
  const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
  }

  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, config.JWT_SECRET)
  if (!token || !decodedToken.userId) {
    throw Error('TOKEN_MISSING_INVALID')
  }
  const user = await db.getUser(null, decodedToken.userId)
  request.user = user
  next()
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return response.status(400).json({
      error: `max file size for uploads is ${config.MAX_UPLOAD_FILE_SIZE} bytes`
    })
  }

  switch (error.message) {
  case 'TVIIT_NOT_FOUND':
    return response.status(404).json({
      error: 'no tviit with given id'
    })
  case 'SEARCH_NO_QUERY':
    return response.status(400).json({
      error: 'no search query specified'
    })
  case 'SEARCH_QUERY_TOO_SHORT':
    return response.status(400).json({
      error: `min length of search query is ${config.MIN_SEARCH_LENGTH}`
    })
  case 'TVIIT_TOO_LONG':
    return response.status(400).json({
      error: `max length of tviit is ${config.MAX_TVIIT_CONTENT_LENGTH}`
    })
  case 'TVIIT_TOO_SHORT':
    return response.status(400).json({
      error: `min length of tviit is ${config.MIN_TVIIT_CONTENT_LENGTH}`
    })
  case 'USERS_USERNAME_ALREADY_EXISTS':
    return response.status(400).json({
      error: 'user with given username already exists'
    })
  case 'USERS_PASSWORD_TOO_SHORT':
    return response.status(400).json({
      error: `min length of password is ${config.MIN_PASSWORD_LENGTH}`
    })
  case 'USERS_PASSWORD_TOO_LONG':
    return response.status(400).json({
      error: `max length of password is ${config.MAX_PASSWORD_LENGTH}`
    })
  case 'USERS_MISSING_PARAMS':
    return response.status(400).json({
      error: 'user parameters must contain username, name, bio and password'
    })
  case 'LOGIN_INVALID':
    return response.status(401).json({
      error: 'invalid username or password'
    })
  case 'TVIIT_UNAUTH_DEL':
    return response.status(403).json({
      error: 'not authorized to delete this tviit'
    })
  case 'TOKEN_MISSING_INVALID':
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  case 'USER_NOT_FOUND':
    return response.status(404).json({
      error: 'no user found with given username'
    })
  case 'SEARCH_NO_USERNAME':
    return response.status(400).json({
      error: 'no username given for search'
    })
  case 'ACTIONS_UNKNOWN_TYPE':
    return response.status(400).json({
      error: 'unknown action type'
    })
  case 'ACTIONS_MISSING_PARAM':
    return response.status(400).json({
      error: 'an action must include actionType and targetTviitId params'
    })
  case 'ACTIONS_USERS_OWN_TVIIT':
    return response.status(400).json({
      error: 'users not allowed to perform actions on their own tviits'
    })
  case 'ACTIONS_USER_DUPLICATE_ACTION':
    return response.status(400).json({
      error: 'user not allowed to perform the same action more than once'
    })
  case 'USER_UNAUTH_USER_PATCH':
    return response.status(403).json({
      error: 'not authorized to modify information of other user'
    })
  case 'USERS_PATCH_PARAMS_ISSUE':
    return response.status(400).json({
      error: `user modifying information must contain ONE of the following: 
      name, bio or newPassword (and oldPassword if newPassword)`
    })
  case 'USERS_PATCH_PROBLEM':
    return response.status(500).json({
      error: 'someting went wrong with modifying, no changes made'
    })
  case 'USERS_PATCH_OLD_PW_WRONG':
    return response.status(403).json({
      error: 'given current password was incorrect'
    })
  case 'USERS_BIO_TOO_SHORT':
    return response.status(400).json({
      error: `min length of bio is ${config.MIN_BIO_LENGTH}`
    })
  case 'USERS_BIO_TOO_LONG':
    return response.status(400).json({
      error: `max length of bio is ${config.MAX_BIO_LENGTH}`
    })
  case 'USERS_USERNAME_TOO_SHORT':
    return response.status(400).json({
      error: `min length of username is ${config.MIN_USERNAME_LENGTH}`
    })
  case 'USERS_USERNAME_TOO_LONG':
    return response.status(400).json({
      error: `max length of username is ${config.MAX_USERNAME_LENGTH}`
    })
  case 'USERS_NAME_TOO_SHORT':
    return response.status(400).json({
      error: `min length of name is ${config.MIN_NAME_LENGTH}`
    })
  case 'USERS_NAME_TOO_LONG':
    return response.status(400).json({
      error: `max length of name is ${config.MAX_NAME_LENGTH}`
    })
  case 'UPLOAD_WRONG_FILE_FORMAT':
    return response.status(400).json({
      error: `allowed file formats are: ${config.ALLOWED_FILE_TYPES.join(', ')}`
    })
  case 'UPLOAD_NO_FILE':
    return response.status(400).json({
      error: 'no file included in upload'
    })
  case 'AVATAR_NOT_FOUND':
    return response.status(404).json({
      error: 'avatar with given filename not found'
    })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  authHandler,
  errorHandler
}