import chai from 'chai';
import { parseQuery } from 'utils/parse-query';

chai.should();
describe('Test parse-query', () => {
  it('Filter[] should be removed from keys and non filter params should be ignored', () => {
    const testCase = {
      'filter[id]': '5',
      'filter[age]': '12',
      petName: 'fedora',
    };
    const expected = {
      id: '5',
      age: '12',
      petName: 'fedora',
    };

    const result = parseQuery(testCase);
    result.should.deep.equal(expected);
  });
});
