const appRoot = require('app-root-path');
const { assert } = require('chai');
const _ = require('lodash');

const { paginate } = appRoot.require('/utils/paginator');
const rows = appRoot.require('/tests/unit/mock-data.json').pets;

const repeatForAllPages = (assertion) => {
  const page = { size: 4, number: 1 };
  const { totalPages } = paginate(rows, page);
  let uIDs = [];
  while (page.number <= totalPages) {
    uIDs = assertion(page, uIDs);
    page.number += 1;
  }
};

describe('Test paginator', () => {
  it('number of returned results should be at most page size', (done) => {
    const assertResultsSize = (page) => {
      const { paginatedRows } = paginate(rows, page);
      assert.isAtMost(paginatedRows.length, page.size);
    };
    repeatForAllPages(assertResultsSize);
    done();
  });

  it('unique IDs should not appear more than once across all pages', (done) => {
    const assertNoDuplicateResults = (page, uIDs) => {
      const { paginatedRows } = paginate(rows, page);
      _.forEach(paginatedRows, ({ ID }) => {
        assert.isFalse(uIDs.includes(ID));
        uIDs.push(ID);
      });
      return uIDs;
    };
    repeatForAllPages(assertNoDuplicateResults);
    done();
  });

  it('page numbers should match query', (done) => {
    const assertPageNumberMatchQuery = (page) => {
      const { pageNumber } = paginate(rows, page);
      assert.equal(page.number, pageNumber);
    };
    repeatForAllPages(assertPageNumberMatchQuery);
    done();
  });

  it('page size should match query', (done) => {
    const assertPageSizeMatchQuery = (page) => {
      const { pageSize } = paginate(rows, page);
      assert.equal(page.size, pageSize);
    };
    repeatForAllPages(assertPageSizeMatchQuery);
    done();
  });

  // it('total pages should remain constant', (done) => {
  //   const page = { size: 4, number: 1 };
  //   const { totalPages } = paginate(rows, page);
  //   while (page.number <= totalPages) {
  //     const { totalPages } = paginate(rows, page);
  //     assert.equal(page.size, pageSize);
  //     page.number += 1;
  //   }
  //   done();
  // });
});
