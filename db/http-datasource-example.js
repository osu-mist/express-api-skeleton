const reqlib = require('app-root-path').require;
const config = require('config');
const rp = require('request-promise-native');

const { apiResourceSerializer } = reqlib('/serializers/jsonapi');

const { endpointUri } = config.get('server');
const { sourceUri } = config.get('httpDataSource');

/**
 * @summary Return a list of APIs
 * @function
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = () => new Promise(async (resolve, reject) => {
  try {
    const options = { uri: sourceUri, json: true };
    const apis = await rp(options);
    const jsonapi = apiResourceSerializer(apis, endpointUri);
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
const getApiById = id => new Promise(async (resolve, reject) => {
  try {
    const options = { uri: `${sourceUri}/${id}`, json: true };
    const api = await rp(options);
    if (!api) {
      resolve(undefined);
    } else {
      const jsonapi = apiResourceSerializer(api, endpointUri);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getApis, getApiById };
