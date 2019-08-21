import { assert } from 'chai';
import { paginate } from 'utils/paginator';
import _ from 'lodash';
import { pets as rows } from './mock-data';

/**
 * Repeats an assertion for all pages of the mock data
 *
 * @param {Function} assertion a function containing a chai assertion
 * @param {object} assertionVars a dictionary of variables to be made
 *     available to the assertion function
 */
const repeatForAllPages = (assertion, assertionVars = {}) => {
  _.forEach(_.range(1, rows.length + 1), (size) => {
    const page = { size, number: 1 };
    const { totalPages } = paginate(rows, page);
    assertionVars.totalPages = totalPages;
    while (page.number <= totalPages) {
      assertionVars.page = page;
      assertion(assertionVars);
      page.number += 1;
    }
  });
};

describe('Test paginator', () => {
  it('number of returned results is at most page size', (done) => {
    const assertResultsSize = ({ page }) => {
      const { paginatedRows } = paginate(rows, page);
      assert.isAtMost(paginatedRows.length, page.size);
    };
    repeatForAllPages(assertResultsSize);
    done();
  });

  it('unique IDs do not appear more than once across all pages', (done) => {
    const assertNoDuplicateResults = (assertionVars) => {
      const { paginatedRows } = paginate(rows, assertionVars.page);
      _.forEach(paginatedRows, ({ id }) => {
        assert.isFalse(assertionVars.uids.has(id));
        assertionVars.uids.add(id);
      });
      if (assertionVars.page.number === assertionVars.totalPages) {
        // clear uids for next iteration of page size
        assertionVars.uids = new Set();
      }
    };
    repeatForAllPages(assertNoDuplicateResults, { uids: new Set() });
    done();
  });

  it('page numbers match query', (done) => {
    const assertPageNumberMatchQuery = ({ page }) => {
      const { pageNumber } = paginate(rows, page);
      assert.equal(page.number, pageNumber);
    };
    repeatForAllPages(assertPageNumberMatchQuery);
    done();
  });

  it('page sizes match query', (done) => {
    const assertPageSizeMatchQuery = ({ page }) => {
      const { pageSize } = paginate(rows, page);
      assert.equal(page.size, pageSize);
    };
    repeatForAllPages(assertPageSizeMatchQuery);
    done();
  });

  it('total pages remains constant', (done) => {
    const assertConstantTotalPages = (assertionVars) => {
      const { totalPages } = paginate(rows, assertionVars.page);
      assert.equal(assertionVars.totalPages, totalPages);
    };
    repeatForAllPages(assertConstantTotalPages);
    done();
  });

  it('page number at least 1, at most total pages', (done) => {
    const assertValidPageNumber = ({ page }) => {
      const { pageNumber, totalPages } = paginate(rows, page);
      assert.isAtLeast(pageNumber, 1);
      assert.isAtMost(pageNumber, totalPages);
    };
    repeatForAllPages(assertValidPageNumber);
    done();
  });
});
