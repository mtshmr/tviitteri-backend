require('dotenv').config()

const PORT = Number(process.env.PORT) || 3001
let DATABASE_FILE = process.env.DATABASE_FILE

if (process.env.NODE_ENV === 'test') {
  DATABASE_FILE = process.env.TESTING_DATABASE_FILE
}

const DEFAULT_GET_TVIIT_LIMIT = Number(process.env.DEFAULT_GET_TVIIT_LIMIT)

const MIN_SEARCH_LENGTH = Number(process.env.MIN_SEARCH_LENGTH)

const MIN_TVIIT_CONTENT_LENGTH = Number(process.env.MIN_TVIIT_CONTENT_LENGTH)
const MAX_TVIIT_CONTENT_LENGTH = Number(process.env.MAX_TVIIT_CONTENT_LENGTH)

const MIN_PASSWORD_LENGTH = Number(process.env.MIN_PASSWORD_LENGTH)
const MAX_PASSWORD_LENGTH = Number(process.env.MAX_PASSWORD_LENGTH)

const MIN_USERNAME_LENGTH = Number(process.env.MIN_USERNAME_LENGTH)
const MAX_USERNAME_LENGTH = Number(process.env.MAX_USERNAME_LENGTH)

const MIN_BIO_LENGTH = Number(process.env.MIN_BIO_LENGTH)
const MAX_BIO_LENGTH = Number(process.env.MAX_BIO_LENGTH)

const MIN_NAME_LENGTH = Number(process.env.MIN_NAME_LENGTH)
const MAX_NAME_LENGTH = Number(process.env.MAX_NAME_LENGTH)

const JWT_SECRET = process.env.JWT_SECRET

const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES.split(',')

const MAX_UPLOAD_FILE_SIZE = Number(process.env.MAX_UPLOAD_FILE_SIZE)

const AVATAR_UPLOAD_DIR = process.env.AVATAR_UPLOAD_DIR

const AVATAR_WIDTH_AND_HEIGHT = Number(process.env.AVATAR_WIDTH_AND_HEIGHT)

module.exports = {
  PORT,
  DATABASE_FILE,
  DEFAULT_GET_TVIIT_LIMIT,
  MIN_SEARCH_LENGTH,
  MIN_TVIIT_CONTENT_LENGTH,
  MAX_TVIIT_CONTENT_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_BIO_LENGTH,
  MAX_BIO_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  JWT_SECRET,
  ALLOWED_FILE_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  AVATAR_UPLOAD_DIR,
  AVATAR_WIDTH_AND_HEIGHT
}