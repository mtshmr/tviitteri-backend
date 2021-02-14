const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const tviitsRouter = require('./controllers/tviits')
const searchRouter = require('./controllers/search')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const actionsRouter = require('./controllers/actions')
const middleware = require('./utils/middleware')
const db = require('./db/database')
const path = require('path')

db.openDb(config.DATABASE_FILE)

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/tviits', tviitsRouter)
app.use('/api/search', searchRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/actions', actionsRouter)

if (process.env.NODE_ENV === 'test') {
  const testsRouter = require('./controllers/tests')
  app.use('/api/tests', testsRouter)
}

app.use(express.static('build'))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app