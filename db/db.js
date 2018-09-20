const reqlib = require('app-root-path').require;
const config = require('config');
const _ = require('lodash');

const { ResourceSerializer } = reqlib('/serializers/jsonapi');

const { endpointUri } = config.get('server');

const apis = [
  {
    id: '1',
    name: 'Location Frontend API',
    repoUrl: 'https://github.com/osu-mist/locations-frontend-api',
  },
  {
    id: '2',
    name: 'Directory API',
    repoUrl: 'https://github.com/osu-mist/directory-api',
  }
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
    const api = _.find(apis, { id });
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
