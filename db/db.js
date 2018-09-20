const reqlib = require('app-root-path').require;
const config = require('config');
const _ = require('lodash');

const { ResourceSerializer } = reqlib('/serializers/jsonapi');

const { endpointUri } = config.get('server');

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

const getApis = () => new Promise((resolve, reject) => {
  try {
    const jsonapi = ResourceSerializer(apis, endpointUri);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  }
});

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
