const testsRouter = require('express').Router()
const db = require('../db/database')

testsRouter.post('/createTablesDb', async (request, response) => {
  await db.createTablesDb()
  response.json({})
})

testsRouter.post('/deleteEverythingInTableDb/:tableName', async (request, response) => {
  const tableName = request.params.tableName
  await db.deleteEverythingInTableDb(tableName)
  response.json({})
})

testsRouter.post('/closeDb', async (request, response) => {
  await db.closeDb()
  response.json({})
})

module.exports = testsRouter