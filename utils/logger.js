const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...params)
  }
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('ERROR:', ...params)
    console.error('---')
  }
}

module.exports = {
  info, error
}