const _ = require('lodash');

const { readJsonFile, writeJsonFile } = require('./fs-operations');
const { serializePets, serializePet } = require('../../serializers/pets-serializer');

const dbPath = 'tests/unit/mock-data.json';

/**
 * Return a list of pets
 *
 * @param {object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = query => new Promise((resolve, reject) => {
  try {
    let rawPets = readJsonFile(dbPath).pets;
    const { species } = query;

    rawPets = species ? _.filter(rawPets, { species }) : rawPets;

    const serializedPet = serializePets(rawPets, query);
    resolve(serializedPet);
  } catch (err) {
    reject(err);
  }
});

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = id => new Promise((resolve, reject) => {
  try {
    const rawPets = readJsonFile(dbPath).pets;
    const rawPet = _.find(rawPets, { id });
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

/**
 * Posts a new pet
 *
 * @param {object} body Request body
 * @returns {Promise} Promise object represents ?
 */
const postPet = body => new Promise((resolve, reject) => {
  try {
    const rawPets = readJsonFile(dbPath).pets;
    const { name, owner, species } = body.data.attributes;

    // Determine smallest unused id
    const ids = _.mapValues(rawPets, 'id');
    const idHash = {};
    _.forEach(ids, (id) => {
      idHash[id] = true;
    });
    let id = 1;
    while (idHash[id]) {
      id += 1;
    }
    rawPets.push({
      id, name, owner, species,
    });
    writeJsonFile(dbPath, { pets: rawPets });
    resolve(getPetById(id));
  } catch (err) {
    reject(err);
  }
});

/**
 * Validates a new pet for uniqueness
 *
 * @param {object} body Request body
 * @returns {boolean} true if pet object in body already exists
 */
const petExists = body => new Promise((resolve, reject) => {
  try {
    const rawPets = readJsonFile(dbPath).pets;
    _.forEach(rawPets, (pet) => {
      if (_.isEqual(_.omit(pet, 'id'), body.data.attributes)) {
        resolve(true);
      }
    });
    resolve(false);
  } catch (err) {
    reject(err);
  }
});

module.exports = {
  getPets, getPetById, postPet, petExists,
};
