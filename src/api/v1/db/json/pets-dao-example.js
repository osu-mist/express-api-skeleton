import _ from 'lodash';
import config from 'config';
import uuidv1 from 'uuid/v1';

import { serializePets, serializePet } from 'api/v1/serializers/pets-serializer';

import { readJsonFile, writeJsonFile } from './fs-operations';

const { dbPath } = config.get('dataSources.json');

/**
 * Return a list of pets
 *
 * @param {object} req Express request object
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async (req) => {
  let rawPets = readJsonFile(dbPath).pets;
  const { query: { species } } = req;

  rawPets = species ? _.filter(rawPets, { species }) : rawPets;

  const serializedPet = serializePets(rawPets, req);
  return serializedPet;
};

/**
 * Return a specific pet by unique ID
 *
 * @param {string} req Express request object
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = async (req) => {
  const { params: { id } } = req;
  const rawPets = readJsonFile(dbPath).pets;
  const rawPet = _.find(rawPets, { id });
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet, req);
  return serializedPet;
};

/**
 * Posts a new pet
 *
 * 1. Reads the JSON DB as an array of objects
 * 2. Inserts posted pet into the array
 * 3. Overwrites JSON DB with new file
 *
 * @param {object} req Express request object
 * @returns {Promise} Promise object represents the posted pet
 */
const postPet = async (req) => {
  // Read DB
  const rawPets = readJsonFile(dbPath).pets;
  const newPet = req.body.data.attributes;

  // Write new pet to DB
  newPet.id = uuidv1();
  rawPets.push(newPet);
  writeJsonFile(dbPath, { pets: rawPets });

  // Return new pet resource
  return serializePet(newPet, req);
};

export {
  getPets,
  getPetById,
  postPet,
};
