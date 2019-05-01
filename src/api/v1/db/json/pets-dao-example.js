import capitalize from 'capitalize';
import _ from 'lodash';

import { serializePets, serializePet } from '../../serializers/pets-serializer';

import { readJsonFile } from './fs-operations';

const dbPath = 'tests/unit/mock-data.json';

/**
 * @summary Return a list of pets
 * @function
 * @param {Object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = query => new Promise((resolve, reject) => {
  try {
    let rawPets = readJsonFile(dbPath).pets;
    const { species } = query;

    rawPets = species ? _.filter(rawPets, { SPECIES: capitalize(species) }) : rawPets;

    const serializedPet = serializePets(rawPets, query);
    resolve(serializedPet);
  } catch (err) {
    reject(err);
  }
});

/**
 * @summary Return a specific pet by unique ID
 * @function
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = id => new Promise((resolve, reject) => {
  try {
    const rawPets = readJsonFile(dbPath).pets;
    const rawPet = _.find(rawPets, { ID: id });
    if (!rawPet) {
      resolve(undefined);
    } else {
      const serializedPet = serializePet(rawPet);
      resolve(serializedPet);
    }
  } catch (err) {
    reject(err);
  }
});

export { getPets, getPetById };
