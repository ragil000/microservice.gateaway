const express = require('express')
const router = express.Router()
const axios = require('axios')
const jwt = require('jsonwebtoken')
const registry = require('./registry.json')
const FormData = require('form-data')
const fs = require('fs')
const formidable = require('formidable')
const authService = require('../third/authService')

// create json web token
const createToken = (data) => {
    return jwt.sign(data, process.env.JWT_KEY, {
        expiresIn: '365d'
    })
}

router.all('/:apiName/*', async (request, response, next) => {
    if(registry.services[request.params.apiName]) {
        try {
            const authorization = request.headers['authorization']
            if(authorization) {
                const getService = await authService.gateaway(authorization)
                if(getService.status) {
                    const resultService = getService.data
                    const token = createToken(resultService)
                    const newAuthorization = `Bearer ${token}`
                    request.headers['authorization'] = newAuthorization
                }else {
                    return response.status(getService.statusCode || 401).json({
                        status: getService.status,
                        message: getService.message
                    })
                }
            }

            const URL = `${registry.services[request.params.apiName].protocol}://${registry.services[request.params.apiName].host}:${registry.services[request.params.apiName].port}`
            
            const regex = /application\/json|multipart\/form-data|application\/x-www-form-urlencoded/gi
            const contentType = request.headers['content-type'].match(regex)
            
            if(contentType && Array.isArray(contentType)) {
                if(contentType[0] == 'application/json') {
                    delete request.headers['content-length']
                    try {
                        let requestQueries = Object.keys(request.query)
                        let query = ''

                        if(requestQueries.length) {
                            let counter = 0
                            requestQueries.forEach((e) => {
                                if(counter == 0) {
                                    query += `?${e}=${request.query[e]}`
                                }else {
                                    query += `&${e}=${request.query[e]}`
                                }
                                counter++
                            })
                        }

                        let config = {
                            method: request.method,
                            timeout: 1000 * 25, // Wait for 25 seconds
                            url: `${URL}/${request.params[0]}${query}`,
                            headers: request.headers,
                            data: request.body,
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity
                        }
                        
                        const sendData = await axios(config)
                        
                        if(sendData) {
                            if(sendData.data) {
                                if(sendData.data.status) {
                                    return response.status(200).json(sendData.data)
                                }else {
                                    return response.status(400).json(sendData.data)
                                }
                            }else {
                                return response.status(500).json({
                                    status: false,
                                    message: 'undefined error.'
                                })
                            }
                        }else {
                            return response.status(500).json({
                                status: false,
                                message: 'undefined error.'
                            })
                        }
                    }catch(error) {
                        console.log('error:', error.message)
                        if(error.response) {
                            return response.status(error.response.status || 500).json(error.response.data)
                        }else {
                            return response.status(500).json({
                                status: false,
                                message: error.message
                            })
                        }
                    }
                }else if(contentType[0] == 'multipart/form-data' || contentType[0] == 'application/x-www-form-urlencoded') {
                    const form = formidable({ multiples: true, allowEmptyFiles: true })
                    form.parse(request, async (error, fields, files) => {
                        try {
                            if(error) {
                                return response.status(500).json({
                                    status: false,
                                    message: error.message
                                })
                            }
    
                            const formData = new FormData()
                            const keyFiles = Object.keys(files)[0]
                            const tempFiles = files[keyFiles]
                            const keyFields = Object.keys(fields)
                            
                            if(tempFiles) {
                                if(Array.isArray(tempFiles)) {
                                    for(let i = 0; i < tempFiles.length; i++) {
                                        formData.append(keyFiles, fs.createReadStream(tempFiles[i].filepath), tempFiles[i].originalFilename)
                                    }
                                }else {
                                    formData.append(keyFiles, fs.createReadStream(tempFiles.filepath), tempFiles.originalFilename)
                                }
                            }
    
    
                            for(let i = 0; i < keyFields.length; i++) {
                                if(Array.isArray(fields[keyFields[i]])) {
                                    for(let j = 0; j < fields[keyFields[i]].length; j++) {
                                        formData.append(keyFields[i], fields[keyFields[i]][j])
                                    }
                                }else {
                                    formData.append(keyFields[i], fields[keyFields[i]])
                                }
                            }

                            let requestQueries = Object.keys(request.query)
                            let query = ''

                            if(requestQueries.length) {
                                let counter = 0
                                requestQueries.forEach((e) => {
                                    if(counter == 0) {
                                        query += `?${e}=${request.query[e]}`
                                    }else {
                                        query += `&${e}=${request.query[e]}`
                                    }
                                    counter++
                                })
                            }

                            Object.assign(request.headers, formData.getHeaders())
                            
                            let config = {
                                method: request.method,
                                timeout: 1000 * 25, // Wait for 25 seconds
                                url: `${URL}/${request.params[0]}${query}`,
                                headers: request.headers,
                                // headers: {
                                //     'content-type': 'multipart/form-data; boundary=--------------------------375991275000184278083639',
                                //     'x-api-key': 'ffd4c9f2458b534a57250820dbe41ed6f9f352630e0ed1191f6c3aaed3cdf2b6',
                                //     authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTk0ODljMmFhMjM5MDY0MGRhMTc1ZWMiLCJlbWFpbCI6InJhZ2lseXVkaGFudG80MkBnbWFpbC5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJzdGF0dXMiOiJ2ZXJpZmllZCIsInRva2VuX3JvbGUiOiJhbGwiLCJpYXQiOjE2Mzc4Mjg4MzEsImV4cCI6MTY2OTM2NDgzMX0.dC_5gfQCuOrxY9wJNkTOUGb3yZRjshcH5dc8fvZXBVY',
                                //     'content-length': '239436',
                                //     ...formData.getHeaders()
                                // },
                                data: formData,
                                maxContentLength: Infinity,
                                maxBodyLength: Infinity
                            }
    
                            const sendData = await axios(config)
            
                            if(sendData) {
                                if(sendData.data) {
                                    if(sendData.data.status) {
                                        return response.status(200).json(sendData.data)
                                    }else {
                                        return response.status(400).json(sendData.data)
                                    }
                                }else {
                                    return response.status(500).json({
                                        status: false,
                                        message: 'error undefined, maybe the service is dead.'
                                    })
                                }
                            }else {
                                return response.status(500).json({
                                    status: false,
                                    message: 'error undefined, maybe the service is dead.'
                                })
                            }
                        }catch(error) {
                            console.log('erro:', error.message)
                            if(error.response) {
                                return response.status(error.response.status || 500).json(error.response.data)
                            }else {
                                return response.status(500).json({
                                    status: false,
                                    message: error.message
                                })
                            }
                        }
                    })
                }else {
                    return response.status(500).json({
                        status: false,
                        message: `content-type ${contentType[0]} undefinied.`
                    })
                }
            }else {
                return response.status(500).json({
                    status: false,
                    message: 'content-type not found.'
                })
            }
        }catch(error) {
            console.log('error:', error.message)
            if(error.response) {
                return response.status(500).json(error.response.data)
            }else {
                return response.status(500).json({
                    status: false,
                    message: error.message
                })
            }
        }
    }else {
        console.log('the service: ', request.params.apiName, ' not registered.')
        return response.status(404).json({
            status: false,
            message: `the ${request.params.apiName} service not registered.`
        })
    }
})

module.exports = router