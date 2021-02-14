const actionsRouter = require('express').Router()
const middleware = require('../utils/middleware')
const db = require('../db/database')

const knownActionTypes = ['like']

actionsRouter.get('/', middleware.authHandler, async (request, response) => {
  const userId = request.user.userId

  const likes = await db.getAllLikesOfUser(userId)

  response.json({ actions: likes })
})

actionsRouter.post('/', middleware.authHandler, async (request, response) => {
  const actionInfo = request.body

  const userId = request.user.userId

  const actionType = actionInfo.actionType
    ? actionInfo.actionType
    : null

  if (!actionType) throw Error('ACTIONS_MISSING_PARAM')

  if (!knownActionTypes.includes(actionType)) throw Error('ACTIONS_UNKNOWN_TYPE')

  const targetTviitId = isNaN(actionInfo.targetTviitId)
    ? null
    : actionInfo.targetTviitId

  if (!targetTviitId) throw Error('ACTIONS_MISSING_PARAM')

  const targetTviit = await db.getTviit(targetTviitId)

  if (targetTviit.userId === userId) throw Error('ACTIONS_USERS_OWN_TVIIT')

  const timestamp = new Date().toISOString()

  const action = { userId, actionType, targetTviitId, timestamp }


  if (await db.checkForDuplicateAction(action)) throw Error('ACTIONS_USER_DUPLICATE_ACTION')
  await db.addAction(action)

  if (action.actionType === 'like') {
    await db.likeTviit(targetTviitId)
  }

  response.json({ ...action })
})

actionsRouter.delete('/', middleware.authHandler, async (request, response) => {
  const actionInfo = request.body

  const userId = request.user.userId

  const actionType = actionInfo.actionType
    ? actionInfo.actionType
    : null

  if (!actionType) throw Error('ACTIONS_MISSING_PARAM')

  if (!knownActionTypes.includes(actionType)) throw Error('ACTIONS_UNKNOWN_TYPE')

  const targetTviitId = isNaN(actionInfo.targetTviitId)
    ? null
    : actionInfo.targetTviitId

  if (!targetTviitId) throw Error('ACTIONS_MISSING_PARAM')

  const targetTviit = await db.getTviit(targetTviitId)

  if (targetTviit.userId === userId) throw Error('ACTIONS_USERS_OWN_TVIIT')

  const timestamp = new Date().toISOString()

  const action = { userId, actionType, targetTviitId, timestamp }

  const changes = await db.deleteAction(action)

  if (action.actionType === 'like' && changes > 0) {
    await db.unlikeTviit(targetTviitId)
  }

  response.json({ ...action })
})

module.exports = actionsRouter