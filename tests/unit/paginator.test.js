const appRoot = require('app-root-path');
const { assert } = require('chai');
const _ = require('lodash');

const { paginate } = appRoot.require('/utils/paginator');
const rows = appRoot.require('/tests/unit/mock-data.json').pets;

describe('Test paginator', () => {
  it('number of returned results should be at most page size', (done) => {
    const page = { size: 4, number: 1 };
    const { totalPages } = paginate(rows, page);
    while (page.number <= totalPages) {
      const { paginatedRows } = paginate(rows, page);
      assert.isAtMost(paginatedRows.length, page.size);
      page.number += 1;
    }
    done();
  });

  it('unique IDs should not appear more than once across all pages', (done) => {
    const page = { size: 4, number: 1 };
    const { totalPages } = paginate(rows, page);
    let uIDs = []
    while (page.number <= totalPages) {
      const { paginatedRows } = paginate(rows, page);
      _.forEach(paginatedRows, ({ ID }) => {
        assert.isFalse(uIDs.includes(ID));
        uIDs.push(ID);
      });
      page.number += 1;
    }
    done();
  });

});
