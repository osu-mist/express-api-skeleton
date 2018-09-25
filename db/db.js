const reqlib = require('app-root-path').require;
const config = require('config');
const _ = require('lodash');

const { ResourceSerializer } = reqlib('/serializers/jsonapi');

const { endpointUri } = config.get('server');

/**
 * @summary Fake resource data
 * @constant
 */
const apis = [
  {
    ID: '1',
    NAME: 'Location Frontend API',
    REPO_URL: 'https://github.com/osu-mist/locations-frontend-api',
  },
  {
    ID: '2',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
];

/**
 * @summary Return a list of APIs
 * @function
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = () => new Promise((resolve, reject) => {
  try {
    const jsonapi = ResourceSerializer(apis, endpointUri);
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
    const api = _.find(apis, { ID: id });
    if (!api) {
      resolve(undefined);
    } else {
      const jsonapi = ResourceSerializer(api, endpointUri);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getApis, getApiById };
