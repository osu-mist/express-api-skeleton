const _ = require('lodash');

const awsOps = require('./aws-operations');
const { serializePets, serializePet } = require('../../serializers/pets-serializer');

const objectKey = 'pets.json';

/**
 * Return a list of pets
 *
 * @param {object} query Query parameters
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = async (query) => {
  const object = await awsOps.getObject(objectKey);
  let rawPets = JSON.parse(object.Body.toString()).pets;
  const { species } = query;

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
  const object = await awsOps.getObject(objectKey);
  const rawPets = JSON.parse(object.Body.toString()).pets;
  const rawPet = _.find(rawPets, { id });
  if (!rawPet) {
    return undefined;
  }
  const serializedPet = serializePet(rawPet, id);
  return serializedPet;
};

module.exports = { getPets, getPetById };
