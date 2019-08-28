import _ from 'lodash';
import config from 'config';
import uuidv1 from 'uuid/v1';

import { serializePets, serializePet } from 'api/v1/serializers/pets-serializer';

import { readJsonFile, writeJsonFile } from './fs-operations';

const { dbPath } = config.get('dataSources.json');

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

/**
 * Posts a new pet
 *
 * Reads the JSON DB as an array of objects
 * Inserts posted pet
 * Writes new array to JSON DB
 *
 * @param {object} body Request body
 * @returns {Promise} Promise object represents the posted pet
 */
const postPet = async (body) => {
  // Read DB
  const rawPets = readJsonFile().pets;
  const newPet = body.data.attributes;

  // Write new pet to DB
  newPet.id = uuidv1();
  rawPets.push(newPet);
  writeJsonFile(dbPath, { pets: rawPets });

  // Return new pet resource
  return serializePet(newPet, true);
};

export {
  getPets,
  getPetById,
  postPet,
};
