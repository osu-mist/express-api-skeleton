const config = require('config');
const rp = require('request-promise-native');

const { SerializedPets, SerializedPet } = require('../../serializers/pets-serializer');

const { endpointUri } = config.get('server');
const { sourceUri } = config.get('httpDataSource');

/**
 * @summary Return a list of pets
 * @function
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = () => new Promise(async (resolve, reject) => {
  try {
    const options = { uri: sourceUri, json: true };
    const rawPets = await rp(options);
    const serializedPets = SerializedPets(rawPets, endpointUri);
    resolve(serializedPets);
  } catch (err) {
    reject(err);
  }
});

/**
 * @summary Return a specific pet by unique ID
 * @function
 * @param {string} id
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = id => new Promise(async (resolve, reject) => {
  try {
    const options = { uri: `${sourceUri}/${id}`, json: true };
    const rawPet = await rp(options);
    if (!rawPet) {
      resolve(undefined);
    } else {
      const serializedPet = SerializedPet(rawPet, endpointUri);
      resolve(serializedPet);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getPets, getPetById };
