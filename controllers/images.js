const config = require('../utils/config')
const path = require('path')
const fs = require('fs')
const imagesRouter = require('express').Router()

imagesRouter.get('/avatars/:userId', async (request, response) => {
  const userId = request.params.userId
  const avatarPath = path.resolve(config.AVATAR_UPLOAD_DIR, `avatar-${userId}.jpg`)
  const defaultAvatarPath = path.resolve(config.AVATAR_UPLOAD_DIR, 'avatar-default.png')

  if (fs.existsSync(avatarPath)) {
    response.sendFile(avatarPath)
  } else {
    response.sendFile(defaultAvatarPath)
  }
})

imagesRouter.get('/avatars/userHasAvatar/:userId', async (request, response) => {
  const userId = request.params.userId
  const avatarPath = path.resolve(config.AVATAR_UPLOAD_DIR, `avatar-${userId}.jpg`)

  if (fs.existsSync(avatarPath)) {
    response.json({ userHasAvatar: true })
  } else {
    response.json({ userHasAvatar: false })
  }
})

module.exports = imagesRouter