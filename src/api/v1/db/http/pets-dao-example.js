import config from 'config';
import rp from 'request-promise-native';

import { serializePets, serializePet } from 'api/v1/serializers/pets-serializer';

const { sourceUri } = config.get('httpDataSource');
const { endpointUri } = config.get('server');

/**
 * Return a list of pets
 *
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = () => new Promise(async (resolve, reject) => {
  try {
    const options = { uri: sourceUri, json: true };
    const rawPets = await rp(options);
    const serializedPets = serializePets(rawPets, endpointUri);
    resolve(serializedPets);
  } catch (err) {
    reject(err);
  }
});

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = id => new Promise(async (resolve, reject) => {
  try {
    const options = { uri: `${sourceUri}/${id}`, json: true };
    const rawPet = await rp(options);
    if (!rawPet) {
      resolve(undefined);
    } else {
      const serializedPet = serializePet(rawPet, endpointUri);
      resolve(serializedPet);
    }
  } catch (err) {
    reject(err);
  }
});

export { getPets, getPetById };