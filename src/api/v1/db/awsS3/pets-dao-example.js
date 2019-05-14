import capitalize from 'capitalize';
import _ from 'lodash';

import { getObject } from './aws-operations';

import { serializePets, serializePet } from 'api/v1/serializers/pets-serializer';

const objectKey = 'pets.json';

/**
 * @summary Return a list of pets
 * @function
 * @param {Object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async (query) => {
  const object = await getObject(objectKey);
  let rawPets = JSON.parse(object.Body.toString()).pets;
  const { species } = query;

  rawPets = species ? _.filter(rawPets, { SPECIES: capitalize(species) }) : rawPets;

  const serializedPets = serializePets(rawPets, query);
  return serializedPets;
};

/**
 * @summary Return a specific pet by unique ID
 * @function
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = async (id) => {
  const object = await getObject(objectKey);
  const rawPets = JSON.parse(object.Body.toString()).pets;
  const rawPet = _.find(rawPets, { ID: id });
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet);
  return serializedPet;
};

export { getPets, getPetById };
