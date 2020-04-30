import chai from 'chai';
import _ from 'lodash';
import proxyquire from 'proxyquire';

chai.should();
describe('Test validate-nested-objects', () => {
  const err = new Error('test error');
  const res = undefined;
  const next = () => undefined;
  const route = { methods: { post: true } };
  const operationDoc = {
    requestBody: {
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                properties: {
                  attributes: {
                    properties: {
                      size: {
                        type: 'object',
                        properties: {
                          length: {
                            type: 'string',
                          },
                          nestedObject: {
                            type: 'object',
                            properties: {
                              nestedAttribute: {
                                type: 'string',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const validateProxy = proxyquire('middlewares/validate-nested-objects', {
    '../errors/errors': { errorBuilder: () => { throw err; } },
  });

  const testCases = [
    {
      message: "Invalid attribute 'badAttribute' should be rejected",
      accept: false,
      attributes: {
        size: {
          badAttribute: 'test',
        },
      },
    },
    {
      message: "Doubly nested attribute 'badAttribute' should be rejected",
      accept: false,
      attributes: {
        size: {
          nestedObject: {
            badAttribute: 'test',
          },
        },
      },
    },
    {
      message: "Valid attribute 'length' should be accepted",
      accept: true,
      attributes: {
        size: {
          length: 5,
        },
      },
    },
  ];
  _.forEach(testCases, ({ message, accept, attributes }) => {
    it(message, () => {
      const result = validateProxy.validateNestedObjects.bind(
        this,
        {
          route,
          operationDoc,
          body: {
            data: {
              attributes,
            },
          },
        },
        res,
        next,
      );
      if (accept) {
        result.should.not.throw(err);
      } else {
        result.should.throw(err);
      }
    });
  });
});
