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
const getPets = async () => {
  const options = { uri: sourceUri, json: true };
  const rawPets = await rp(options);
  const serializedPets = serializePets(rawPets, endpointUri);
  return serializedPets;
};

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = async (id) => {
  const options = { uri: `${sourceUri}/${id}`, json: true };
  const rawPet = await rp(options);
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet, endpointUri);
  return serializedPet;
};

export { getPets, getPetById };
