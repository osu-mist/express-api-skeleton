import chai from 'chai';

import { stringsToNumbers } from 'utils/convert-strings-to-numbers';

chai.should();

const testProperties = {
  name: {
    type: 'string',
  },
  age: {
    type: 'number',
    format: 'integer',
  },
  size: {
    type: 'object',
    properties: {
      length: {
        type: 'number',
        format: 'float',
      },
    },
  },
  arrayType: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        size: {
          type: 'number',
          format: 'float',
        },
      },
    },
  },
};

describe('Test convert-strings-to-numbers', () => {
  it('Should convert strings to strings to numbers as defined in testProperties', () => {
    const input = {
      name: '5',
      age: '5',
      size: {
        length: '10.5',
      },
      arrayType: [
        {
          size: '12',
        },
      ],
    };
    const expected = {
      name: '5',
      age: 5,
      size: {
        length: 10.5,
      },
      arrayType: [
        {
          size: 12,
        },
      ],
    };
    stringsToNumbers([input], testProperties);
    return input.should.deep.equal(expected);
  });
});
