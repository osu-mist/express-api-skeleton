const reqlib = require('app-root-path').require;
const _ = require('lodash');

const { resourceSerializer } = reqlib('/serializers/jsonapi');

const rows = reqlib('/tests/unit/mock-data.json').apis;

/**
 * @summary Return a list of APIs
 * @function
 * @param {Object} page Pagination query parameter
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = page => new Promise((resolve, reject) => {
  try {
    const jsonapi = resourceSerializer(rows, page);
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
      const jsonapi = resourceSerializer(row);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getApis, getApiById };
