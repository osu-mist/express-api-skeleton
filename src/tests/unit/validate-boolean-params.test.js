import chai from 'chai';
import _ from 'lodash';
import proxyquire from 'proxyquire';

chai.should();
describe('Test validate-boolean-params', () => {
  const err = new Error('oops');
  const res = undefined;
  const next = () => undefined;

  const myFunc = proxyquire('middlewares/validate-boolean-params', {
    '../errors/errors': { errorBuilder: () => { throw err; } },
  });

  const testCases = ['test', 'cats', 1, true];
  _.forEach(testCases, (testCase) => {
    it(`${testCase} should be rejected`, () => {
      const result = myFunc.validateBooleanParams.bind(
        this,
        { query: { 'filter[isCat]': testCase } },
        res,
        next,
      );
      result.should.throw(err);
    });
  });
});
