const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const contrib = appRoot.require('contrib/contrib');
const { getConnection } = appRoot.require('db/connection');
const { apiResourceSerializer } = appRoot.require('serializers/api-resources-serializer');

const { endpointUri } = config.get('server');

/**
 * @summary Return a list of APIs
 * @function
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = () => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(contrib.getApis());
    const jsonapi = apiResourceSerializer(rows, endpointUri);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

/**
 * @summary Return a specific API by unique ID
 * @function
 * @param {string} id
 * @returns {Promise} Promise object represents a specific API
 */
const getApiById = id => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(contrib.getApiById(id), id);

    if (_.isEmpty(rows)) {
      resolve(undefined);
    } else if (rows.length > 1) {
      reject(new Error('Expect a single object but got multiple results.'));
    } else {
      const [row] = rows;
      const jsonapi = apiResourceSerializer(row, endpointUri);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

module.exports = { getApis, getApiById };
