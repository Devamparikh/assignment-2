const express = require('express')
const inventoryRouter = require('./routers/inventory')
const connection = require('./db/mysql')


const app = express()

app.use(express.json())
app.use(inventoryRouter)

module.exports = app