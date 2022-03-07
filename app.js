const express = require('express')
const app = express()
const port = 3000
const testController = require('./modules/test.controller')

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})

app.use('/Router',testController);