const mongoose = require('mongoose')
const env = require('dotenv')
env.config()

const mongodbUri = process.env.MONGODB_URL

function connect() {
    return new Promise((resolve, reject) => {
        if(process.env.NODE_ENV === 'TESTx') {
          const Mockgoose = require('mockgoose').Mockgoose;
          const mockgoose = new Mockgoose(mongoose)
          mockgoose.prepareStorage()
            .then(() => {
              mongoose.connect(mongodbUri,
                { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
                .then((res, err) => {
                  if (err) return reject(err)
                  console.log('connected successfully to db.')
                  resolve()
                })
            })
        } else {
            mongoose.connect(`mongodb:${mongodbUri}`,
              { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
              .then((res, err) => {
                if (err) return reject(err)
                console.log('connected successfully to db.')
                resolve()
              })
        }
    })
}

function close() {
    return mongoose.disconnect()
}

module.exports = { connect, close }