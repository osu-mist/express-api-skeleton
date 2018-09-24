const reqlib = require('app-root-path').require;
const camelCase = require('camelcase');
const chai = require('chai');
const chaiString = require('chai-string');
const _ = require('lodash');

const { ResourceSerializer } = reqlib('/serializers/jsonapi');

const { assert } = chai;
chai.use(chaiString);

describe('Test JSON API serializer', () => {
  const rows = [{
    ID: '1',
    NAME: 'Location Frontend API',
    REPO_URL: 'https://github.com/osu-mist/locations-frontend-api',
  },
  {
    ID: '2',
    NAME: 'Directory API',
    REPO_URL: 'https://github.com/osu-mist/directory-api',
  }];
  const jsonapi = ResourceSerializer(rows, 'exampleUri');

  it('keys should be camelCase', (done) => {
    const newKeys = _.keys(jsonapi.data[0].attributes);
    _.forEach(newKeys, key => assert.equal(key, camelCase(key)));
    done();
  });
});
