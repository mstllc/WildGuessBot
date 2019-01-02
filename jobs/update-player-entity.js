// Pull environment variables from `.env` into process.env
require('dotenv').config()

const axios = require('axios')
const nhlClient = require('../utils/nhl-client')()
const dialogFlowClient = require('../utils/dialogflow-client')(
  process.env.DIALOGFLOW_DEVELOPER_ACCESS_TOKEN
)

async function updatePlayerEntity() {
  try {
    // Get Wild team roster from NHL API
    let { data: { roster } } = await nhlClient.get('teams/30/roster', {
      params: { expand: 'roster.person,person.names' }
    })

    // Get existing @player entity from Dialogflow to merge with
    let { data: entity } = await dialogFlowClient.get('entities/player')

    // Convert existing entries to Object
    let entries = entity.entries.reduce((acc, entry) => {
      acc[entry.value] = entry.synonyms
      return acc
    }, {})

    // Merge data from NHL API
    for (let player of roster) {
      // (should probably check that lastNames are unique)
      let { id, fullName, lastName } = player.person
      let existingSynonyms = (entries[id] && entries[id].synonyms) || []
      entries[id] = [
        ...existingSynonyms,
        fullName,
        lastName,
        `#${player.jerseyNumber}`,
        `number ${player.jerseyNumber}`
      ]
    }

    // Update entity with merged entries
    await dialogFlowClient.put(
      `entities/${entity.id}/entries`,
      Object.keys(entries).map(key => ({
        value: key,
        synonyms: [...new Set(entries[key])]
      }))
    )
  } catch (error) {
    console.log('Error', error)
  }
}

updatePlayerEntity()

// dialogFlowClient.get('entities/player')
//   .then(response => console.log(response.data))

// dialogFlowClient.put('entities/c3533501-9aae-4998-a970-d1abe28a4f34/entries', [
//   {
//     value: 'Chris Stew',
//     synonyms: ['ste']
//   }
// ])
//   .then(response => {
//     console.log(response.data)
//   })
//   .catch(error => {
//     console.log('Error', error.request, error.response.data)
//   })
