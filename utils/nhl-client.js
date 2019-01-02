const axios = require('axios')

module.exports = (baseURL = 'https://statsapi.web.nhl.com/api/v1/') => {
  let instance = axios.create({
    baseURL
  })

  return instance
}
