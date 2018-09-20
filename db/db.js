const reqlib = require('app-root-path').require;
const config = require('config');

const { ResourceSerializer } = reqlib('/serializers/jsonapi');

const { endpointUri } = config.get('server');

const apiExamples = [
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
    const jsonapi = ResourceSerializer(apiExamples, endpointUri);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  }
});

module.exports = { getApis };
