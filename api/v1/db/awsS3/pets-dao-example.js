const capitalize = require('capitalize');
const _ = require('lodash');

const awsOps = require('./aws-operations');
const { serializePets, serializePet } = require('../../serializers/pets-serializer');

const objectKey = 'pets.json';

/**
 * @summary Return a list of pets
 * @function
 * @param {Object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async (query) => {
  const object = await awsOps.getObject(objectKey);
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
  const object = await awsOps.getObject(objectKey);
  const rawPets = JSON.parse(object.Body.toString()).pets;
  const rawPet = _.find(rawPets, { ID: id });
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet);
  return serializedPet;
};

module.exports = { getPets, getPetById };
