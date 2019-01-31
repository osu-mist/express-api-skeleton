const appRoot = require('app-root-path');
const capitalize = require('capitalize');
const _ = require('lodash');

const { serializePets, serializePet } = require('../../serializers/pets-serializer');

const { readJSONFile } = appRoot.require('utils/fs-operations');

const dbPath = 'tests/unit/mock-data.json';

/**
 * @summary Return a list of pets
 * @function
 * @param {Object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = query => new Promise((resolve, reject) => {
  try {
    let rawPets = readJSONFile(dbPath).pets;
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
    const rawPets = readJSONFile(dbPath).pets;
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

module.exports = { getPets, getPetById };
