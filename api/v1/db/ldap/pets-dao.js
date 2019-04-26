const appRoot = require('app-root-path');

const { serializePets, serializePet } = require('../../serializers/pets-serializer');

const { openapi } = appRoot.require('utils/load-openapi');
const conn = appRoot.require(`api/${openapi.basePath}/db/ldap/connection`);

/**
 * @summary Map endpoint query to ldap query
 * @function
 * @returns {string} string representing search filter for ldap query
 */
const mapQuery = (endpointQuery) => {
  const keyMap = new Map([
    ['species', 'petSpecies'],
  ]);

  const keyOperations = (key, value) => {
    switch (key) {
      case 'species': {
        return `${keyMap.get(key)}=${value}*`;
      }
      default: {
        return `${keyMap.get(key)}=*${value}*`;
      }
    }
  };

  let ldapQuery = '(&'; // begin requiring all conditions
  Object.keys(endpointQuery).forEach((key) => {
    if (keyMap.get(key)) ldapQuery += `(${keyOperations(key, endpointQuery[key])})`;
  });
  ldapQuery += ')'; // end requiring all conditions

  return ldapQuery;
};

/**
 * @summary Return a pet
 * @function
 * @returns {Promise} Promise object represents a pet
 */
const getPet = pathParameter => new Promise(async (resolve, reject) => {
  const client = conn.getClient();

  client.search('o=example.edu', { filter: `UID=${pathParameter}`, scope: 'sub' }, (err, res) => {
    res.on('searchEntry', (entry) => {
      resolve(serializePet(entry.object));
    });
    res.on('error', (error) => {
      reject(error);
    });
    res.on('end', () => {
      resolve(null);
    });
  });
});

/**
 * @summary Return a list of pets
 * @function
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = endpointQuery => new Promise(async (resolve, reject) => {
  const ldapQuery = mapQuery(endpointQuery);
  const client = conn.getClient();

  const searchResults = [];
  client.search('o=example.edu', { filter: ldapQuery, scope: 'sub' }, (err, res) => {
    res.on('searchEntry', (entry) => {
      searchResults.push(entry.object);
    });
    res.on('error', (error) => {
      reject(error);
    });
    res.on('end', () => {
      resolve(serializePets(searchResults, endpointQuery));
    });
  });
});

module.exports = { getPet, getPets };
