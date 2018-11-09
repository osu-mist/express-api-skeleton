const appRoot = require('app-root-path');
const _ = require('lodash');
const capitalize = require('capitalize');

const { SerializedPet, SerializedPets } = require('../../serializers/pets-serializer');

/**
 * @summary Return a list of pets
 * @function
 * @param {Object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = query => new Promise((resolve, reject) => {
  try {
    let rawPets = appRoot.require('/tests/unit/mock-data.json').pets;
    const { species } = query;

    rawPets = species ? _.filter(rawPets, { SPECIES: capitalize(species) }) : rawPets;

    const serializedPet = SerializedPets(rawPets, query);
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
    const rawPets = appRoot.require('/tests/unit/mock-data.json').pets;
    const rawPet = _.find(rawPets, { ID: id });
    if (!rawPet) {
      resolve(undefined);
    } else {
      const serializedPet = SerializedPet(rawPet);
      resolve(serializedPet);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getPets, getPetById };
