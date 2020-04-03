import _ from 'lodash';

import { parseQuery } from 'utils/parse-query';
import { serializePets, serializePet } from 'serializers/pets-serializer';

import { getObject } from './aws-operations';

const objectKey = 'pets.json';

/**
 * Return a list of pets
 *
 * @param {object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async (query) => {
  const object = await getObject(objectKey);
  let rawPets = JSON.parse(object.Body.toString()).pets;
  const parsedQuery = parseQuery(query);
  const { species } = parsedQuery;

  rawPets = species ? _.filter(rawPets, { species }) : rawPets;

  const serializedPets = serializePets(rawPets, query);
  return serializedPets;
};

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = async (id) => {
  const object = await getObject(objectKey);
  const rawPets = JSON.parse(object.Body.toString()).pets;
  const rawPet = _.find(rawPets, { id });
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet);
  return serializedPet;
};

export { getPets, getPetById };
