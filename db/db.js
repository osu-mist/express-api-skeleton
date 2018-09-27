const reqlib = require('app-root-path').require;
const _ = require('lodash');

const { ResourceSerializer } = reqlib('/serializers/jsonapi');

/**
 * @summary Fake resource data
 * @constant
 */
const rows = [
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
  {
    ID: '3',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '4',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '5',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '6',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '7',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '8',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '9',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
  {
    ID: '10',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  },
];

/**
 * @summary Return a list of APIs
 * @function
 * @param {Object} page Pagination query parameter
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = page => new Promise((resolve, reject) => {
  try {
    const jsonapi = ResourceSerializer(rows, page);
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
      const jsonapi = ResourceSerializer(row);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  }
});

module.exports = { getApis, getApiById };
