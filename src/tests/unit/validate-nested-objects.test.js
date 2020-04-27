import chai from 'chai';
// import _ from 'lodash';
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

  it('Invalid attribute should be rejected', () => {
    const result = validateProxy.validateNestedObjects.bind(
      this,
      {
        body: {
          data: {
            attributes: {
              size: {
                badAttribute: 'test',
              },
            },
          },
        },
        route,
        operationDoc,
      },
      res,
      next,
    );
    result.should.throw(err);
  });
});
