const axios = require('axios')

module.exports = (
  accessToken,
  baseURL = 'https://api.dialogflow.com/v1/',
  protocolVersion = '20170712'
) => {
  let instance = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params: {
      v: protocolVersion
    }
  })

  return instance
}
