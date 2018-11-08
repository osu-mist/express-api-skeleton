const appRoot = require('app-root-path');
const _ = require('lodash');

const {
  apiResourcesSerializer,
  apiResourceSerializer,
} = appRoot.require('serializers/api-resources-serializer');

const rows = appRoot.require('/tests/unit/mock-data.json').pets;

/**
 * @summary Return a list of APIs
 * @function
 * @param {Object} query Query parameters
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = query => new Promise((resolve, reject) => {
  try {
    const jsonapi = apiResourcesSerializer(rows, query);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  }
});

/**
 * @summary Return a specific API by unique ID
 * @function
 * @param {string} id
 * @returns {Promise} Promise object represents a specific API
 */
const getApiById = id => new Promise((resolve, reject) => {
  try {
    const row = _.find(rows, { ID: id });
    if (!row) {
      resolve(undefined);
    } else {
      const jsonapi = apiResourceSerializer(row);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getApis, getApiById };
