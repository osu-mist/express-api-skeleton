const reqlib = require('app-root-path').require;
const chai = require('chai');
const chaiString = require('chai-string');
const _ = require('lodash');

const { paginate } = reqlib('/serializers/paginator');
const rows = reqlib('/tests/unit/mock-data.json').apis;

const DEFAULT_PAGE_SIZE = 25;
const { assert } = chai;
chai.use(chaiString);

describe('Test paginator', () => {
  it('number of returned results should less then page size', (done) => {
    const page = { size: 10 };
    const { paginatedRows } = paginate(rows, page);
    assert.isAtMost(paginatedRows.length, page.size);
    done();
  });

  it('should use default page number and size if not given', (done) => {
    _.forEach([{}, { size: '', number: '' }], (page) => {
      const { pageNumber, pageSize } = paginate(rows, page);
      assert.equal(pageNumber, 1);
      assert.equal(pageSize, DEFAULT_PAGE_SIZE);
    });
    done();
  });

  it('prev and next should be null if given number is out of bounds', (done) => {
    const page = { number: 100 };
    const { nextPage, prevPage } = paginate(rows, page);
    assert.isNull(nextPage);
    assert.isNull(prevPage);
    done();
  });
});
