const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { serializePets, serializePet } = require('../../serializers/pets-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { contrib } = appRoot.require('api/v1/db/oracledb/contrib/contrib');

const { endpointUri } = config.get('server');

/**
 * Return a list of pets
 *
 * @returns {Promise<object[]>} Promise object represents a list of pets
 */
const getPets = async () => {
  const connection = await conn.getConnection();
  try {
    const { rawPets } = await connection.execute(contrib.getPets());
    const serializedPets = serializePets(rawPets, endpointUri);
    return serializedPets;
  } finally {
    connection.close();
  }
};

/**
 * Return a specific pet by unique ID
 *
 * @param {string} id Unique pet ID
 * @returns {Promise<object>} Promise object represents a specific pet or return undefined if term
 *                            is not found
 */
const getPetById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const { rawPets } = await connection.execute(contrib.getPetById(id), id);

    if (_.isEmpty(rawPets)) {
      return undefined;
    }
    if (rawPets.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [rawPet] = rawPets;
      const serializedPet = serializePet(rawPet, id);
      return serializedPet;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getPets, getPetById };
