const config = require('../utils/config')
const path = require('path')
const fs = require('fs')
const uploadRouter = require('express').Router()
const middleware = require('../utils/middleware')
const multer = require('multer')
const sharp = require('sharp')

const avatarStorage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, config.AVATAR_UPLOAD_DIR)
  }
})

const limits = { fileSize: config.MAX_UPLOAD_FILE_SIZE }

const fileFilter = (request, file, cb) => {
  if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
    return cb(new Error('UPLOAD_WRONG_FILE_FORMAT'))
  }
}

const avatarUpload = multer({ storage: avatarStorage, limits, fileFilter })

uploadRouter.post('/avatar', middleware.authHandler, avatarUpload.single('avatar'), async (request, response) => {
  const file = request.file
  if (!file) {
    throw Error('UPLOAD_NO_FILE')
  }

  const avatarFilename = `avatar-${request.user.userId}.jpg`
  const avatarPath = path.resolve(file.destination, avatarFilename)

  await sharp(file.path)
    .resize(config.AVATAR_WIDTH_AND_HEIGHT, config.AVATAR_WIDTH_AND_HEIGHT)
    .jpeg({ quality: 90 })
    .toFile(avatarPath)

  fs.unlinkSync(file.path)

  response.status(201).json({ filename: avatarFilename })
})

module.exports = uploadRouter