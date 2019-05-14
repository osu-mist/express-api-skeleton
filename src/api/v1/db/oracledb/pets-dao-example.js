import config from 'config';
import _ from 'lodash';

import conn from './connection';
import contrib from './contrib/contrib';

import { serializePets, serializePet } from 'api/v1/serializers/pets-serializer';

const { endpointUri } = config.get('server');

/**
 * @summary Return a list of pets
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of pets
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
 * @summary Return a specific pet by unique ID
 * @function
 * @param {string} id Unique pet ID
 * @returns {Promise<Object>} Promise object represents a specific pet or return undefined if term
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
      const serializedPet = serializePet(rawPet);
      return serializedPet;
    }
  } finally {
    connection.close();
  }
};

export { getPets, getPetById };
