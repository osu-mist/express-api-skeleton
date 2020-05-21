import chai from 'chai';
import _ from 'lodash';

import { formatSubObjects } from 'utils/format-sub-objects';

chai.should();
describe('Test format-sub-objects', () => {
  it('Objects with \'.\' in the key should be expanded into nesting objects', () => {
    const testCase = {
      'phoneType.code': 'Android',
      'phoneType.description': 'The superior mobile phone',
      phoneNumber: '5554443333',
    };
    const expected = _.pick(testCase, ['phoneNumber']);
    expected.phoneType = {
      code: 'Android',
      description: 'The superior mobile phone',
    };

    formatSubObjects([testCase]);
    testCase.should.deep.equal(expected);
  });
});
