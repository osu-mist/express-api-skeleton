import chai from 'chai';
import _ from 'lodash';
import proxyquire from 'proxyquire';

chai.should();
describe('Test validate-boolean-params', () => {
  const err = new Error('Invalid boolean value');
  const res = undefined;
  const next = () => undefined;

  const validateProxy = proxyquire('middlewares/validate-boolean-params', {
    '../errors/errors': { errorBuilder: () => { throw err; } },
    '../utils/load-openapi': {
      openapi: {
        paths: [
          [
            {
              parameters: [
                {
                  in: 'query',
                  schema: { type: 'boolean' },
                  name: 'filter[hasOwner]',
                },
              ],
            },
          ],
        ],
      },
    },
  });

  let testCases = ['test', 'cats', 1, true, undefined, null];
  _.forEach(testCases, (testCase) => {
    it(`${testCase} should be rejected`, () => {
      const result = validateProxy.validateBooleanParams.bind(
        this,
        { query: { 'filter[hasOwner]': testCase } },
        res,
        next,
      );
      result.should.throw(err);
    });
  });

  testCases = ['true', 'false'];
  _.forEach(testCases, (testCase) => {
    it(`'${testCase}' should be accepted`, () => {
      const result = validateProxy.validateBooleanParams.bind(
        this,
        { query: { 'filter[hasOwner]': testCase } },
        res,
        next,
      );
      result.should.not.throw(err);
    });
  });
});
