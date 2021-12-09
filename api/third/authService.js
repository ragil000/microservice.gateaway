const axios = require('axios')
const urlAuthService = process.env.URL_AUTH_SERVICE
const apiKey = process.env.API_KEY

const gateaway = async (token) => {
    try {
        const config = {
            method: 'get',
            url: `${urlAuthService}/gateaway`,
            headers: { 
                'Content-Type': 'application/json', 
                'x-api-key': apiKey,
                'Authorization': token
            }
        }
    
        const sendData = await axios(config)
        if(sendData) {
            if(sendData.data) {
                if(sendData.data.status) {
                    return {
                        responseCode: 200,
                        status: sendData.data.status,
                        message: sendData.data.message,
                        data: sendData.data.data
                    }
                }else {
                    return {
                        responseCode: 400,
                        status: sendData.data.status,
                        message: sendData.data.message
                    }
                }
            }else {
                return {
                    responseCode: 500,
                    status: false,
                    message: 'error undefined, maybe the service is dead.'
                }
            }
        }else {
            return {
                responseCode: 500,
                status: false,
                message: 'error undefined, maybe the service is dead.'
            }
        }
    }catch(error) {
        console.log('error', error.message)
        if(error.response) {
            if(error.response) {
                if(error.response.data) {
                    return {
                        responseCode: 500,
                        status: error.response.data.status,
                        message: error.response.data.message
                    }
                }else {
                    return {
                        responseCode: 500,
                        status: false,
                        message: 'error undefined, maybe the service is dead.'
                    }
                }
            }else {
                return {
                    responseCode: 500,
                    status: false,
                    message: error.message
                }
            }
        }else {
            return {
                responseCode: 500,
                status: false,
                message: 'error undefined, maybe the service is dead.'
            }
        }
    }
}

module.exports = { gateaway }