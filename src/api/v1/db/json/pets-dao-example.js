import _ from 'lodash';

import { serializePets, serializePet } from 'api/v1/serializers/pets-serializer';

import { readJsonFile } from './fs-operations';

const dbPath = 'dist/tests/unit/mock-data.json';

/**
 * Return a list of pets
 *
 * @param {object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async (query) => {
  let rawPets = readJsonFile(dbPath).pets;
  const { species } = query;

  rawPets = species ? _.filter(rawPets, { species }) : rawPets;

  const serializedPet = serializePets(rawPets, query);
  return serializedPet;
};

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = async (id) => {
  const rawPets = readJsonFile(dbPath).pets;
  const rawPet = _.find(rawPets, { id });
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet);
  return serializedPet;
};

export { getPets, getPetById };
