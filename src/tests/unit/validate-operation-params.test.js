import chai from 'chai';
import _ from 'lodash';
import proxyquire from 'proxyquire';

chai.should();
describe('Test validate-operation-params', () => {
  const err = new Error('test error');
  const res = undefined;
  const next = () => undefined;
  const operationDoc = {
    parameters: [
      { name: 'filter[age][gt]', in: 'query' },
      { name: 'filter[age][lt]', in: 'query' },
    ],
  };

  const validateProxy = proxyquire('middlewares/validate-operation-params', {
    '../errors/errors': { errorBuilder: () => { throw err; } },
  });

  let testCases = [
    {
      message: "Invalid operation 'badOperator' should be rejected",
      testCase: { 'filter[age][badOperator]': 5 },
    },
    {
      message: "Invalid operation 'differentBadOperator' should be rejected",
      testCase: { 'filter[age][differentBadOperator]': 5 },
    },
    {
      message: 'Parameters with multiple operations should be rejected',
      testCase: {
        'filter[age][badOperator]': 5,
        'filter[age][differentBadOperator]': 5,
      },
    },
  ];
  _.forEach(testCases, ({ message, testCase }) => {
    it(message, () => {
      const result = validateProxy.validateOperationParams.bind(
        this,
        {
          query: testCase,
          operationDoc,
        },
        res,
        next,
      );
      result.should.throw(err);
    });
  });

  testCases = [
    {
      message: "Correct operation 'gt' should be accepted",
      testCase: { 'filter[age][gt]': 5 },
    },
    {
      message: "Correct operation 'lt' should be accepted",
      testCase: { 'filter[age][lt]': 5 },
    },
  ];
  _.forEach(testCases, ({ message, testCase }) => {
    it(message, () => {
      const result = validateProxy.validateOperationParams.bind(
        this,
        {
          query: testCase,
          operationDoc,
        },
        res,
        next,
      );
      result.should.not.throw(err);
    });
  });
});
