const config = require('../utils/config')
const sqlite3 = require('sqlite3').verbose()
const sqlite = require('sqlite')
const logger = require('../utils/logger')

let db = null

const openDb = async (filename) => {
  db = await sqlite.open({
    filename,
    driver: sqlite3.Database
  })

  logger.info(`Opened database at ${filename}`)
}

const closeDb = async () => {
  await db.close()
  db = null

  logger.info('Closed the database')
}

const createTablesDb = async () => {
  await db.exec(`CREATE TABLE "actions" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "userId"	INTEGER NOT NULL,
    "actionType"	TEXT NOT NULL,
    "targetTviitId"	INTEGER NOT NULL,
    "timestamp"	TEXT NOT NULL
  )`)
  await db.exec(`CREATE TABLE "tviits" (
    "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "userId"	INTEGER NOT NULL,
    "content"	TEXT NOT NULL,
    "postDate"	TEXT NOT NULL,
    "responseTo"	INTEGER,
    "likes"	INTEGER DEFAULT 0
  )`)
  await db.exec(`CREATE TABLE "users" (
    "userId"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    "username"	TEXT NOT NULL UNIQUE,
    "name"	TEXT,
    "bio"	TEXT,
    "passwordHash"	TEXT NOT NULL
  )`)
}

/**
 * Deletes all entries in the given table of the database.
 *
 * Meant only for emptying the database tables during testing!
 *
 * @param {string} tableName The table to be emptied.
 */
const deleteEverythingInTableDb = async (tableName) => {
  if (process.env.NODE_ENV === 'test') {
    await db.exec(`DELETE FROM ${tableName}`)
  }
}

const getNewestTviits = async (limit, offset) => {
  const sql = `SELECT * 
              FROM tviits 
              ORDER BY id DESC
              LIMIT ? OFFSET ?`

  const tviits = await db.all(sql, [limit, offset])

  logger.info('getNewestTviits')
  logger.info(tviits)
  logger.info('---')

  return tviits
}

const getTviit = async (tviitId) => {
  const sql = `SELECT * 
              FROM tviits 
              WHERE id = ?`

  const tviit = await db.get(sql, [tviitId])

  if (!tviit) throw Error('TVIIT_NOT_FOUND')

  logger.info('getTviit')
  logger.info(tviit)
  logger.info('---')

  return tviit
}

const addTviit = async (tviit) => {
  const sql = `INSERT INTO tviits (userId, content, postDate, responseTo)
              VALUES (?, ?, ?, ?)`

  const tviit_params = [tviit.userId, tviit.content, tviit.postDate, tviit.responseTo]

  const result = await db.run(sql, tviit_params)

  logger.info('addTviit')
  logger.info(`A tviit has been inserted with id ${result.lastID}`)
  logger.info('---')

  return result.lastID
}

const deleteTviit = async (tviitId) => {
  const sql = 'DELETE FROM tviits WHERE id = ?'

  const result = await db.run(sql, [tviitId])

  logger.info('deleteTviit')
  if (result.changes !== 0) {
    logger.info(`Deleted a twiit with id ${tviitId}`)
  } else {
    logger.info(`No twiit with id ${tviitId} found!`)
  }
  logger.info('---')

  return result.changes
}

const likeTviit = async (tviitId) => {
  const sql = 'UPDATE tviits SET likes = likes + 1 WHERE id = ?'

  const tviit_params = [tviitId]

  const result = await db.run(sql, tviit_params)

  logger.info('likeTviit')
  logger.info(`Amount of tviits liked: ${result.changes}`)
  logger.info('---')

  return result.changes
}

const unlikeTviit = async (tviitId) => {
  const sql = 'UPDATE tviits SET likes = likes - 1 WHERE id = ?'

  const tviit_params = [tviitId]

  const result = await db.run(sql, tviit_params)

  logger.info('unlikeTviit')
  logger.info(`Amount of tviits unliked: ${result.changes}`)
  logger.info('---')

  return result.changes
}

const findTviits = async (searchString, userId = null, limit = config.DEFAULT_GET_TVIIT_LIMIT, offset = 0) => {
  let sql = null
  let sqlParams = null

  if (userId && searchString) {
    sql = `SELECT *
          FROM tviits
          WHERE
          (
            userId = ?
            AND content LIKE ?
          )
          ORDER BY id DESC
          LIMIT ? OFFSET ?`

    sqlParams = [userId, `%${searchString}%`, limit, offset]
  } else if (userId) {
    sql = `SELECT *
          FROM tviits
          WHERE userId = ?
          ORDER BY id DESC
          LIMIT ? OFFSET ?`

    sqlParams = [userId, limit, offset]
  } else {
    sql = `SELECT *
          FROM tviits
          WHERE content LIKE ?
          ORDER BY id DESC
          LIMIT ? OFFSET ?`

    sqlParams = [`%${searchString}%`, limit, offset]
  }

  const tviits = await db.all(sql, sqlParams)

  logger.info('findTviits')
  logger.info(tviits)
  logger.info('---')

  return tviits
}

const getUser = async (username, userId = null) => {
  let sql = null
  let sqlParam = null

  if (username) {
    sql = `SELECT * 
          FROM users 
          WHERE username = ?`
    sqlParam = [username]
  } else {
    sql = `SELECT * 
          FROM users 
          WHERE userId = ?`
    sqlParam = [userId]
  }

  const user = await db.get(sql, sqlParam)

  logger.info('getUser')

  if (user) {
    // Don't log the passwordHash for security reasons
    // eslint-disable-next-line no-unused-vars
    const { passwordHash, ...rest } = user
    logger.info(rest)
  } else {
    logger.info(user)
  }

  logger.info('---')

  return user
}

const addUser = async (user) => {
  const sql = `INSERT INTO users (username, name, bio, passwordHash)
              VALUES (?, ?, ?, ?)`

  const user_params = [user.username, user.name, user.bio, user.passwordHash]

  const result = await db.run(sql, user_params)

  logger.info('addUser')
  logger.info(`A user has been inserted with userId ${result.lastID}`)
  logger.info('---')

  return result.lastID
}

const modifyUser = async (user) => {
  const sql = `UPDATE users
              SET username = ?,
                  name = ?
              WHERE userId = ?`

  const user_params = [user.username, user.name, user.userId]

  const result = await db.run(sql, user_params)

  logger.info('modifyUser')
  logger.info(`Amount of users changed: ${result.changes}`)
  logger.info('---')

  return result.changes
}

const changeUserPassword = async (userInfo) => {
  const sql = `UPDATE users
              SET passwordHash = ?
              WHERE userId = ?`

  const user_params = [userInfo.passwordHash, userInfo.userId]

  const result = await db.run(sql, user_params)

  logger.info('changeUserPassword')
  logger.info(`Amount of users changed: ${result.changes}`)
  logger.info('---')

  return result.changes
}

const changeUserName = async (userInfo) => {
  const sql = `UPDATE users
              SET name = ?
              WHERE userId = ?`

  const user_params = [userInfo.name, userInfo.userId]

  const result = await db.run(sql, user_params)

  logger.info('changeUserName')
  logger.info(`Amount of users changed: ${result.changes}`)
  logger.info('---')

  return result.changes
}

const changeUserBio = async (userInfo) => {
  const sql = `UPDATE users
              SET bio = ?
              WHERE userId = ?`

  logger.info(userInfo)
  const user_params = [userInfo.bio, userInfo.userId]

  const result = await db.run(sql, user_params)

  logger.info('changeUserBio')
  logger.info(`Amount of users changed: ${result.changes}`)
  logger.info('---')

  return result.changes
}

const addUserInfoToTviits = async (tviits) => {
  const tviitAuthors = tviits.map(tviit => tviit.userId)

  // Get info of all unique tviit authors
  let users = {}
  for (const userId of [...new Set(tviitAuthors)]) {
    const user = await getUser(null, userId)
    if (user) users[user.userId] = user
  }

  // Add author info to tviits
  let detailedTviits = []
  for (const tviit of tviits) {
    const author = users[String(tviit.userId)]
    if (author) {
      const tviitToPush = { ...tviit, username: author.username, name: author.name }
      detailedTviits.push(tviitToPush)
    }
  }

  return detailedTviits
}

const addUserInfoToTviit = async (tviit) => {
  const author = await getUser(null, tviit.userId)

  let detailedTviit = author
    ? { ...tviit, username: author.username, name: author.name }
    : { ...tviit, username: null, name: null }

  return detailedTviit
}

const addAction = async (action) => {
  const sql = `INSERT INTO actions (userId, actionType, targetTviitId, timestamp)
              VALUES (?, ?, ?, ?)`

  const action_params = [action.userId, action.actionType, action.targetTviitId, action.timestamp]

  const result = await db.run(sql, action_params)

  logger.info('addAction')
  logger.info(`An action has been inserted with actionId ${result.lastID}`)
  logger.info('---')

  return result.lastID
}

const deleteAction = async (action) => {
  const sql = `DELETE FROM actions 
              WHERE (userId = ?
                AND actionType = ?
                AND targetTviitId = ?)`

  const action_params = [action.userId, action.actionType, action.targetTviitId]
  const result = await db.run(sql, action_params)

  logger.info('deleteAction')
  if (result.changes !== 0) {
    logger.info('Deleted an action')
  } else {
    logger.info('No action to delete found!')
  }
  logger.info('---')

  return result.changes
}

const getAllLikesOfUser = async (userId) => {
  const sql = `SELECT targetTviitId
              FROM actions 
              WHERE (userId = ?
                AND actionType = ?)`

  let actions = await db.all(sql, [userId, 'like'])

  if (actions.length > 0) actions = actions.map(action => action.targetTviitId)

  logger.info('getAllLikesOfUser')
  logger.info(actions)
  logger.info('---')

  return actions
}

const checkForDuplicateAction = async (action) => {
  const sql = `SELECT * 
              FROM actions 
              WHERE (userId = ?
                AND actionType = ?
                AND targetTviitId = ?)`

  const action_params = [action.userId, action.actionType, action.targetTviitId]
  const duplicateAction = await db.get(sql, action_params)

  const isDuplicateAction = Boolean(duplicateAction)

  logger.info('checkForDuplicateAction')
  logger.info(isDuplicateAction)
  logger.info('---')

  return isDuplicateAction
}

module.exports = {
  openDb,
  closeDb,
  createTablesDb,
  deleteEverythingInTableDb,
  getNewestTviits,
  getTviit,
  addTviit,
  deleteTviit,
  likeTviit,
  unlikeTviit,
  findTviits,
  getUser,
  addUser,
  modifyUser,
  changeUserPassword,
  changeUserName,
  changeUserBio,
  addUserInfoToTviits,
  addUserInfoToTviit,
  addAction,
  deleteAction,
  getAllLikesOfUser,
  checkForDuplicateAction
}