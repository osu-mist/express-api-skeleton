const config = require('config');
const reqlib = require('app-root-path').require;
const camelCase = require('camelcase');
const chai = require('chai');
const chaiString = require('chai-string');
const _ = require('lodash');
const url = require('url');

const { apiResourceSerializer } = reqlib('/serializers/jsonapi');
const { paginate } = reqlib('/serializers/paginator');
const rows = reqlib('/tests/unit/mock-data.json').apis;

const { defaultPageSize } = config.get('pagination');
const { assert } = chai;
chai.use(chaiString);

describe('Test JSON API serializer', () => {
  const jsonapi = apiResourceSerializer(rows, 'exampleUri');
  it('keys should be camelCase', (done) => {
    const newKeys = _.keys(jsonapi.data[0].attributes);
    _.forEach(newKeys, key => assert.equal(key, camelCase(key)));
    done();
  });
});

describe('Test paginator', () => {
  it('number of returned results should less then page size', (done) => {
    const page = { size: 10 };
    const { paginatedRows } = paginate(rows, page);
    assert.isAtMost(paginatedRows.length, page.size);
    done();
  });

  it('should use default page number and size if not given', (done) => {
    _.forEach([{}, { size: '', number: '' }], (page) => {
      const { paginationLinks } = paginate(rows, page);
      const { query } = url.parse(paginationLinks.first, true);
      assert.equal(query['page[number]'], 1);
      assert.equal(query['page[size]'], defaultPageSize);
    });
    done();
  });

  it('prev and next should be null if given number is out of bounds', (done) => {
    const page = { number: 100 };
    const { paginationLinks } = paginate(rows, page);
    assert.isNull(paginationLinks.prev);
    assert.isNull(paginationLinks.next);
    done();
  });
});
