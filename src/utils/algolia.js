const algoliasearch = require('algoliasearch');

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY)
const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME)

const parseiProfile = (iProfile) => {
    const languagues = iProfile.languages.map(lang => ({
        language: lang.language,
        fluency: lang.fluency
    }))

    const coordinates = {
        lat: iProfile.location.coordinates.latitude,
        lng: iProfile.location.coordinates.longitude
    }

    return {
        name: iProfile.name,
        avatar: 'https://littlebeebooks.com/wp-content/uploads/2017/04/Moomin1.png',
        email: iProfile.email,
        languages: languagues,
        location: iProfile.location.locationString,
        objectID: iProfile._id,
        _geoloc: coordinates
    }
}

const saveiProfile = async (iProfile) => {
    const data = parseiProfile(iProfile)
    index.saveObject(data)
}

const getiProfile = async (objectID) => {
    index.getObject(objectID)
        .catch(error => {
            throw error
        })
}

module.exports = {
    saveiProfile,
    getiProfile
}