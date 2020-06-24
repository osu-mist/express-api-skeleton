import config from 'config';
import rp from 'request-promise-native';

import { httpOptions } from './connection';

const { baseUri } = config.get('dataSources.http');

/**
 * Return a list of pets
 *
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async () => {
  const rawPets = await rp.get({ ...{ uri: baseUri }, ...httpOptions });
  return rawPets;
};

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = async (id) => {
  try {
    const rawPet = await rp.get({ ...{ uri: `${baseUri}/${id}` }, ...httpOptions });
    return rawPet;
  } catch (err) {
    if (err.statusCode === 404) {
      return undefined;
    }
    throw new Error('Internal Server Error');
  }
};

export { getPets, getPetById };
