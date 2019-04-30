import { assert } from 'chai';

import pets from './mock-data';

import { paginate } from 'utils/paginator';

const rows = pets.pets;

describe('Test paginator', () => {
  it('number of returned results should less then page size', (done) => {
    const page = { size: 10 };
    const { paginatedRows } = paginate(rows, page);
    assert.isAtMost(paginatedRows.length, page.size);
    done();
  });
});
