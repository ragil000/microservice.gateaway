const express = require('express')
const app = express()
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

const apiGateawayRoute = require('./api/routes/apiGateawayRoute')

app.use(helmet())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.json())

// handle CORS
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Headers', 'Origin, X-API-KEY, X-Requested-With, Content-Type, Accept, Authorization, Timezone')
    if(request.method === 'OPTIONS') {
        response.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return response.status(200).json({})
    }
    next()
})

// app v1
app.use('/', apiGateawayRoute)

// handle error
app.use((request, response, next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error, request, response, next) => {
    return response.status(error.status || 500).json({
        status: false,
        message: error.message || 'SERVER ERROR'
    })
})

module.exports = app